const { pool } = require("../config/database");

const getAllTransactions = async () => {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            operation,
            asset_id,
            initiated_by,
            from_user,
            to_user,
            status,
            blockchain_tx_id,
            timestamp
        FROM transactions
        ORDER BY timestamp DESC
        `
    );

    return rows;
};

const getTransactionById = async (id) => {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            operation,
            asset_id,
            initiated_by,
            from_user,
            to_user,
            status,
            blockchain_tx_id,
            timestamp
        FROM transactions
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};

const getRecentTransactions = async (limit = 10) => {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const [rows] = await pool.query(
        `
        SELECT
            id,
            operation,
            asset_id,
            initiated_by,
            from_user,
            to_user,
            status,
            blockchain_tx_id,
            timestamp
        FROM transactions
        ORDER BY timestamp DESC
        LIMIT ${safeLimit}
        `
    );

    return rows;
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    getRecentTransactions
};