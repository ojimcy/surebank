const bannerSchema = require('./banner.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns Banner
 */
const Banner = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Banner', bannerSchema);
  }

  return model;
};

module.exports = Banner;
