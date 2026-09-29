class AuditLog {
    constructor({
        auditId,
        action,
        category = "SYSTEM",
        performedBy,
        description = "",
        assetId = "",
        nftId = "",
        transactionId = "",
        timestamp = new Date().toISOString()
    }) {
        this.auditId = auditId;
        this.action = action;
        this.category = category;
        this.performedBy = performedBy;
        this.description = description;
        this.assetId = assetId;
        this.nftId = nftId;
        this.transactionId = transactionId;
        this.timestamp = timestamp;
    }
}

module.exports = AuditLog;