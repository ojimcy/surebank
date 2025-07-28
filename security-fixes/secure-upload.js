/**
 * Secure File Upload Configuration
 * Fix for: Insecure file upload with no validation or virus scanning
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const FileType = require('file-type');
const sharp = require('sharp'); // For image processing
const config = require('../src/config/config');

// Allowed file types with MIME types and extensions
const ALLOWED_FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  documents: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  kyc: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

// S3 configuration
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Generate secure random filename
const generateSecureFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const ext = path.extname(originalName).toLowerCase();
  return `${timestamp}-${randomString}${ext}`;
};

// Validate file type by reading file buffer
const validateFileType = async (buffer, allowedTypes) => {
  const fileTypeResult = await FileType.fromBuffer(buffer);
  
  if (!fileTypeResult) {
    throw new Error('Unable to determine file type');
  }
  
  const { mime, ext } = fileTypeResult;
  
  // Check against allowed types
  const isAllowed = allowedTypes.mimeTypes.includes(mime) && 
                    allowedTypes.extensions.includes(`.${ext}`);
  
  if (!isAllowed) {
    throw new Error(`File type not allowed. Detected: ${mime}`);
  }
  
  return { mime, ext };
};

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  // Remove any directory components
  const basename = path.basename(filename);
  // Remove special characters except dots and hyphens
  return basename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Virus scanning stub (integrate with actual service)
const scanForVirus = async (buffer) => {
  // TODO: Integrate with ClamAV or similar service
  // For now, implement basic checks
  
  // Check for suspicious patterns in file
  const suspiciousPatterns = [
    Buffer.from('4D5A'), // EXE header
    Buffer.from('504B0304'), // ZIP header (could contain malware)
    Buffer.from('EICAR'), // EICAR test file
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (buffer.includes(pattern)) {
      throw new Error('File contains suspicious content');
    }
  }
  
  return { clean: true };
};

// Process and optimize images
const processImage = async (buffer, mimeType) => {
  try {
    let processor = sharp(buffer);
    
    // Get metadata
    const metadata = await processor.metadata();
    
    // Strip EXIF data (privacy concern)
    processor = processor.rotate(); // Auto-rotate based on EXIF
    
    // Resize if too large
    if (metadata.width > 2048 || metadata.height > 2048) {
      processor = processor.resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    
    // Convert to optimized format
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      processor = processor.jpeg({ quality: 85, progressive: true });
    } else if (mimeType === 'image/png') {
      processor = processor.png({ compressionLevel: 9 });
    }
    
    return await processor.toBuffer();
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

// Secure file upload middleware
const createSecureUpload = (fileCategory = 'images') => {
  const allowedTypes = ALLOWED_FILE_TYPES[fileCategory];
  
  if (!allowedTypes) {
    throw new Error(`Invalid file category: ${fileCategory}`);
  }
  
  // Configure multer with memory storage (for processing)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: allowedTypes.maxSize,
      files: 5, // Max 5 files per request
    },
    fileFilter: (req, file, cb) => {
      // Basic extension check (will validate properly later)
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedTypes.extensions.includes(ext)) {
        return cb(new Error(`File extension not allowed: ${ext}`));
      }
      
      // Sanitize filename
      file.originalname = sanitizeFilename(file.originalname);
      
      cb(null, true);
    },
  });
  
  // Middleware to process uploaded files
  const processUpload = async (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }
    
    const files = req.files || [req.file];
    const processedFiles = [];
    
    try {
      for (const file of files) {
        // Validate file type by reading buffer
        const { mime, ext } = await validateFileType(file.buffer, allowedTypes);
        
        // Scan for viruses
        await scanForVirus(file.buffer);
        
        // Process images
        let processedBuffer = file.buffer;
        if (fileCategory === 'images' || fileCategory === 'kyc') {
          if (mime.startsWith('image/')) {
            processedBuffer = await processImage(file.buffer, mime);
          }
        }
        
        // Generate secure filename
        const secureFilename = generateSecureFilename(file.originalname);
        const s3Key = `${fileCategory}/${req.user.id}/${secureFilename}`;
        
        // Upload to S3
        const uploadParams = {
          Bucket: config.aws.s3Bucket,
          Key: s3Key,
          Body: processedBuffer,
          ContentType: mime,
          ServerSideEncryption: 'AES256',
          Metadata: {
            originalName: file.originalname,
            uploadedBy: req.user.id,
            uploadedAt: new Date().toISOString(),
          },
        };
        
        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Add processed file info
        processedFiles.push({
          originalName: file.originalname,
          filename: secureFilename,
          mimeType: mime,
          size: processedBuffer.length,
          s3Key,
          s3Url: `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${s3Key}`,
        });
      }
      
      // Attach processed files to request
      req.uploadedFiles = processedFiles;
      next();
    } catch (error) {
      // Clean up any uploaded files on error
      for (const file of processedFiles) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: config.aws.s3Bucket,
            Key: file.s3Key,
          }));
        } catch (deleteError) {
          logger.error('Failed to delete file after error:', deleteError);
        }
      }
      
      next(error);
    }
  };
  
  return { upload, processUpload };
};

// Rate limiting for file uploads
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: 'Too many file uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  createSecureUpload,
  uploadRateLimiter,
  ALLOWED_FILE_TYPES,
};

/**
 * Implementation steps:
 * 
 * 1. Install required packages:
 *    npm install file-type sharp
 * 
 * 2. Replace existing multer config with this secure version
 * 
 * 3. Update routes to use new upload middleware:
 *    const { createSecureUpload, uploadRateLimiter } = require('./secure-upload');
 *    const { upload, processUpload } = createSecureUpload('kyc');
 *    router.post('/upload', 
 *      uploadRateLimiter,
 *      upload.single('file'), 
 *      processUpload,
 *      uploadController
 *    );
 * 
 * 4. Set up S3 bucket with proper permissions:
 *    - Enable versioning
 *    - Enable server-side encryption
 *    - Set up lifecycle policies
 *    - Configure access logging
 * 
 * 5. Add virus scanning service (ClamAV or similar)
 * 
 * 6. Monitor upload patterns for abuse
 */