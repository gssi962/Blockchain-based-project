const auditService =
    require("../services/auditService");

const { success, failure } =
    require("../utils");

const list = (req, res) => {

    return success(
        res,
        auditService.getAllAuditLogs()
    );
};

const get = (req, res) => {

    const audit =
        auditService.getAuditLogById(req.params.id);

    if (!audit) {
        return failure(
            res,
            "Audit event not found",
            404
        );
    }

    return success(res, audit);
};

const stats = (req, res) => {

    const logs =
        auditService.getAllAuditLogs();

    return success(res, {
        totalEvents: logs.length,

        identityEvents: logs.filter(
            item => item.category === "IDENTITY"
        ).length,

        assetEvents: logs.filter(
            item => item.category === "ASSET"
        ).length,

        transactionEvents: logs.filter(
            item => item.category === "TRANSACTION"
        ).length
    });
};

module.exports = {
    list,
    get,
    stats
};