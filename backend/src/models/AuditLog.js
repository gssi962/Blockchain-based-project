class AuditLog {
    constructor({
        id,
        action,
        category,
        description,
        performedBy = null,
        performedByDid = null,
        status = "SUCCESS",
        metadata = {},
        timestamp = new Date().toISOString()
    }) {
        this.id = id;
        this.action = action;
        this.category = category;
        this.description = description;
        this.performedBy = performedBy;
        this.performedByDid = performedByDid;
        this.status = status;
        this.metadata = metadata;
        this.timestamp = timestamp;
    }
}

module.exports = AuditLog;