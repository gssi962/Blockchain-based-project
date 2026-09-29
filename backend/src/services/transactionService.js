const { pool } = require("../config/database");


// GET ALL TRANSACTIONS
// Admin / Manager / Auditor -> all transactions
// User -> only transactions related to that user
const getAllTransactions = async ({
    userId,
    role
} = {}) => {

    let query = `
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
    `;

    const params = [];

    if (role === "role-user") {
        query += `
            WHERE initiated_by = ?
               OR from_user = ?
               OR to_user = ?
        `;

        params.push(
            userId,
            userId,
            userId
        );
    }

    query += `
        ORDER BY timestamp DESC
    `;

    const [rows] = await pool.execute(
        query,
        params
    );

    return rows;
};


// GET SINGLE TRANSACTION
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


// GET RECENT TRANSACTIONS
const getRecentTransactions = async (
    limit = 10
) => {

    const safeLimit = Math.min(
        Math.max(Number(limit) || 10, 1),
        50
    );

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