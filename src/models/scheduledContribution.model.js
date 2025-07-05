const { getConnection } = require('./connection');
const scheduledContributionSchema = require('./scheduledContribution.schema');

let model = null;

/**
 * @returns ScheduledContribution
 */
const ScheduledContribution = async () => {
    if (!model) {
        const conn = await getConnection();
        model = conn.model('ScheduledContribution', scheduledContributionSchema);
    }

    return model;
};

module.exports = ScheduledContribution; 