const { pool } = require("../config/database");

const { createId } = require("../utils");


const createAuditLog = async ({
    action,
    category,
    description,
    performedBy,
    status = "SUCCESS",
    metadata = {}
}) => {

    const auditId = createId("audit");

    await pool.execute(
        `
        INSERT INTO audit_logs
        (
            id,
            action,
            category,
            description,
            performed_by,
            performed_by_did,
            status,
            metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            auditId,
            action,
            category,
            description,
            performedBy?.id || null,
            performedBy?.did || null,
            status,
            JSON.stringify(metadata)
        ]
    );


    return {
        id: auditId,
        action,
        category,
        description,
        status,
        metadata
    };
};



const getAllAuditLogs = async () => {

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            action,
            category,
            description,
            performed_by,
            performed_by_did,
            status,
            metadata,
            timestamp
        FROM audit_logs
        ORDER BY timestamp DESC
        `
    );

    return rows;
};



const getAuditLogById = async (id) => {

    const [rows] = await pool.execute(
        `
        SELECT *
        FROM audit_logs
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows.length
        ? rows[0]
        : null;
};



const getRecentAuditLogs = async (limit = 10) => {

    const [rows] = await pool.execute(
        `
        SELECT *
        FROM audit_logs
        ORDER BY timestamp DESC
        LIMIT ?
        `,
        [limit]
    );

    return rows;
};



module.exports = {
    createAuditLog,
    getAllAuditLogs,
    getAuditLogById,
    getRecentAuditLogs
};