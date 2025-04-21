const baseTemplate = require('./base.template');

/**
 * SMS template for package creation
 * @param {Object} data Template data
 * @param {string} data.name Customer's name
 * @param {string} data.productName Name of the product
 * @param {number} data.targetAmount Target amount
 * @returns {string} Formatted SMS content
 */
module.exports = (data) => {
  const content = `Hello ${data.name}, your SB package for ${
    data.productName
  } has been created successfully. Target: ₦${Number(
    data.targetAmount
  ).toLocaleString()}. Make daily contributions to reach your goal faster.`;
  return baseTemplate(content);
};
