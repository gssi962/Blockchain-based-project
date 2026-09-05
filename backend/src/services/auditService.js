const { store } = require("../config/database");
const { createId } = require("../utils");

const createAuditLog = ({
    action,
    category,
    description,
    performedBy,
    status = "SUCCESS",
    metadata = {}
}) => {

    const audit = {
        id: createId("audit"),
        action,
        category,
        description,
        performedBy: performedBy
            ? performedBy.id
            : null,
        performedByDid: performedBy
            ? performedBy.did
            : null,
        status,
        metadata,
        timestamp: new Date().toISOString()
    };

    store.auditLogs.push(audit);

    return audit;
};

const getAllAuditLogs = () => {
    return [...store.auditLogs].reverse();
};

const getAuditLogById = (id) => {
    return store.auditLogs.find(
        audit => audit.id === id
    );
};

const getRecentAuditLogs = (limit = 10) => {
    return [...store.auditLogs]
        .reverse()
        .slice(0, limit);
};

module.exports = {
    createAuditLog,
    getAllAuditLogs,
    getAuditLogById,
    getRecentAuditLogs
};