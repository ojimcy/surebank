const { getConnection } = require('./connection');
const scheduledPaymentLogSchema = require('./scheduledPaymentLog.schema');

let model = null;

/**
 * @returns ScheduledPaymentLog
 */
const ScheduledPaymentLog = async () => {
    if (!model) {
        const conn = await getConnection();
        model = conn.model('ScheduledPaymentLog', scheduledPaymentLogSchema);
    }

    return model;
};

module.exports = ScheduledPaymentLog; 