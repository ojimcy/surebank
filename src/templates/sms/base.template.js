module.exports = (content) => {
  // Ensure content is within SMS character limit (160 characters)
  const MAX_LENGTH = 160;
  const truncatedContent = content.length > MAX_LENGTH ? `${content.substring(0, MAX_LENGTH - 3)}...` : content;

  return `SureBank: ${truncatedContent}`;
};
