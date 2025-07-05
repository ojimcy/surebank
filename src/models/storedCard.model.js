const { getConnection } = require('./connection');
const storedCardSchema = require('./storedCard.schema');

let model = null;

/**
 * @returns StoredCard
 */
const StoredCard = async () => {
    if (!model) {
        const conn = await getConnection();
        model = conn.model('StoredCard', storedCardSchema);
    }

    return model;
};

module.exports = StoredCard; 