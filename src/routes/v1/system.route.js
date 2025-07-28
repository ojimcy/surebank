const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const redisService = require('../../services/redis-wrapper.service');
const config = require('../../config/config');
const os = require('os');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System monitoring and health endpoints
 */

/**
 * @swagger
 * /system/redis-stats:
 *   get:
 *     summary: Get Redis usage statistics
 *     description: Monitor Redis command usage for Upstash free tier
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 commandsUsedToday:
 *                   type: number
 *                 commandsRemaining:
 *                   type: number
 *                 percentageUsed:
 *                   type: number
 *                 hoursUntilReset:
 *                   type: number
 *                 fallbackMode:
 *                   type: boolean
 *                 memoryCacheSize:
 *                   type: number
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/redis-stats', auth('manageSystem'), async (req, res) => {
  const stats = redisService.getUsageStats();
  
  if (!stats) {
    return res.json({
      message: 'Redis stats not available (not using Upstash service)',
      usingUpstash: false
    });
  }
  
  res.json({
    ...stats,
    environment: config.env,
    usingUpstash: true,
    recommendations: getRecommendations(stats)
  });
});

/**
 * @swagger
 * /system/clear-cache:
 *   post:
 *     summary: Clear Redis memory cache
 *     description: Clear the in-memory cache used to reduce Redis commands
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/clear-cache', auth('manageSystem'), async (req, res) => {
  if (redisService.clearMemoryCache) {
    redisService.clearMemoryCache();
    res.json({ message: 'Memory cache cleared successfully' });
  } else {
    res.json({ message: 'Memory cache not available' });
  }
});

/**
 * @swagger
 * /system/info:
 *   get:
 *     summary: Get system information
 *     description: Get general system information and status
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/info', auth('manageSystem'), async (req, res) => {
  const stats = redisService.getUsageStats();
  
  res.json({
    environment: config.env,
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      limit: Math.round(os.totalmem() / 1024 / 1024)
    },
    redis: {
      connected: !stats?.fallbackMode,
      usingUpstash: !!stats,
      commandsToday: stats?.commandsUsedToday || 0,
      dailyLimit: 10000
    },
    lambda: {
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
      functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
      region: process.env.AWS_REGION,
      memorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE
    }
  });
});

// Helper function to provide recommendations based on usage
function getRecommendations(stats) {
  const recommendations = [];
  
  if (stats.percentageUsed > 80) {
    recommendations.push('WARNING: Approaching daily limit. Consider upgrading to paid tier.');
  }
  
  if (stats.percentageUsed > 60) {
    recommendations.push('Monitor usage closely. You are using ' + stats.percentageUsed + '% of daily limit.');
  }
  
  if (stats.fallbackMode) {
    recommendations.push('CRITICAL: Redis is in fallback mode. Check connection settings.');
  }
  
  if (stats.memoryCacheSize > 1000) {
    recommendations.push('Memory cache is large (' + stats.memoryCacheSize + ' items). Consider clearing if Lambda memory is high.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All systems operating normally.');
  }
  
  return recommendations;
}

module.exports = router;