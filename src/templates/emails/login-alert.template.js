const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <h2>New Login Alert</h2>
  <p>Dear ${data.name},</p>
  
  <div class="alert ${data.suspicious ? 'alert-danger' : 'alert-success'}">
    <h3>Login Details</h3>
    <div style="margin: 20px 0;">
      <p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
      <p><strong>Device:</strong> ${data.device}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p><strong>IP Address:</strong> ${data.ipAddress}</p>
      <p><strong>Browser:</strong> ${data.browser}</p>
    </div>
  </div>

  ${
    data.suspicious
      ? `
    <div class="alert alert-danger">
      <p><strong>Warning:</strong> This login was from an unrecognized device or location.</p>
      <p>If this wasn't you, please:</p>
      <ol>
        <li>Change your password immediately</li>
        <li>Enable two-factor authentication</li>
        <li>Contact our support team</li>
      </ol>
    </div>
    <a href="${data.securitySettingsUrl}" class="button">Secure Your Account</a>
  `
      : ''
  }
`,
    'New Login Alert'
  );
