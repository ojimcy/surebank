const NodeCache = require("node-cache");

// Create cache instances with different TTLs
const contributionCache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
const generalCache = new NodeCache({ stdTTL: 600 }); // 10 minutes cache

/**
 * Generate cache key from query parameters
 */
const generateCacheKey = (prefix, params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key];
      }
      return acc;
    }, {});

  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

/**
 * Get or set contribution sum cache
 */
const getOrSetContributionSum = async (params, fetchFunction) => {
  const cacheKey = generateCacheKey('contribution_sum', params);

  // Try to get from cache
  const cachedValue = contributionCache.get(cacheKey);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  // Fetch from database
  const value = await fetchFunction();

  // Store in cache
  contributionCache.set(cacheKey, value);

  return value;
};

/**
 * Clear contribution cache
 */
const clearContributionCache = () => {
  contributionCache.flushAll();
};

/**
 * Get or set general cache
 */
const getOrSetCache = async (key, ttl, fetchFunction) => {
  // Try to get from cache
  const cachedValue = generalCache.get(key);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  // Fetch from source
  const value = await fetchFunction();

  // Store in cache with custom TTL if provided
  if (ttl) {
    generalCache.set(key, value, ttl);
  } else {
    generalCache.set(key, value);
  }

  return value;
};

module.exports = {
  generateCacheKey,
  getOrSetContributionSum,
  clearContributionCache,
  getOrSetCache,
  contributionCache,
  generalCache,
};
