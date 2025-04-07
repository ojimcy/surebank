const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <h2>KYC Status Update</h2>
  <p>Dear ${data.name},</p>
  
  <div class="alert ${data.status === 'approved' ? 'alert-success' : 'alert-warning'}">
    <h3>KYC ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</h3>
    <p>${data.message}</p>
    
    ${
      data.feedback
        ? `
      <div style="margin: 20px 0;">
        <p><strong>Feedback:</strong></p>
        <p>${data.feedback}</p>
      </div>
    `
        : ''
    }
  </div>

  ${
    data.nextSteps
      ? `
    <div style="margin: 20px 0;">
      <h4>Next Steps:</h4>
      <ol>
        ${data.nextSteps.map((step) => `<li>${step}</li>`).join('')}
      </ol>
    </div>
  `
      : ''
  }

  ${
    data.actionRequired
      ? `
    <a href="${data.actionUrl}" class="button">Complete KYC</a>
  `
      : ''
  }
`,
    'KYC Status Update'
  );
