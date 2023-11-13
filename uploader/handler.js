const S3 = require('aws-sdk/clients/s3');

const { BUCKET_NAME } = process.env;
const s3 = new S3();

module.exports.generatePresignedUrl = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { objectKey } = body;
    const { contentType } = body;
    const expirationTime = 5 * 60; // 1 min to test
    const s3Action = 'putAction';

    console.log(
      `BucketName: ${BUCKET_NAME}, ObjectKey: ${objectKey}, S3Action: ${s3Action}, expirationTime: ${expirationTime}, contentType: ${contentType}`
    );

    const params = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Expires: expirationTime,
      ContentType: contentType,
    };

    const signedUrl = s3.getSignedUrl(s3Action, params);

    console.log(signedUrl);

    return {
      statusCode: 200,
      body: signedUrl,
    };
  } catch (error) {
    console.log(`Error: ${error}`);
    return {
      statusCode: 500,
      body: 'Some error occurred..please check the logs',
    };
  }
};
