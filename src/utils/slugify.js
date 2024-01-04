const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-');

module.exports = {
  slugify,
};
