const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <h2>${data.title}</h2>
  <p>Dear ${data.name},</p>
  
  <div style="margin: 20px 0;">
    ${data.content}
  </div>

  ${
    data.callToAction
      ? `
    <a href="${data.callToAction.url}" class="button">
      ${data.callToAction.text}
    </a>
  `
      : ''
  }

  <p style="font-size: 12px; margin-top: 20px;">
    You received this email because you subscribed to marketing updates. 
    <a href="${data.unsubscribeUrl}">Unsubscribe</a>
  </p>
`,
    'Marketing Update'
  );
