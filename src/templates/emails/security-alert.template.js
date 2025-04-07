const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <h2>Security Alert</h2>
  <p>Dear ${data.name},</p>
  
  <div class="alert alert-warning">
    <h3>${data.alertType}</h3>
    <p>${data.message}</p>
    <p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
    <p><strong>Location:</strong> ${data.location}</p>
    <p><strong>Device:</strong> ${data.device}</p>
    <p><strong>IP Address:</strong> ${data.ipAddress}</p>
  </div>

  <p>If this wasn't you, please:</p>
  <ol>
    <li>Change your password immediately</li>
    <li>Enable two-factor authentication</li>
    <li>Contact our support team</li>
  </ol>

  <a href="${data.securitySettingsUrl}" class="button">Review Security Settings</a>
`,
    'Security Alert'
  );
