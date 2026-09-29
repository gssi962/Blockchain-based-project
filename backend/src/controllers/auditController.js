const auditService =
    require("../services/auditService");

const { success, failure } =
    require("../utils");


// GET ALL AUDIT LOGS

const list = async (req, res) => {
    try {

        const logs =
            await auditService.getAllAuditLogs();

        return success(
            res,
            logs
        );

    } catch (error) {

        console.error(
            "Audit list error:",
            error
        );

        return failure(
            res,
            "Failed to fetch audit logs",
            500
        );
    }
};



// GET SINGLE AUDIT LOG

const get = async (req, res) => {

    try {

        const audit =
            await auditService.getAuditLogById(
                req.params.id
            );


        if (!audit) {

            return failure(
                res,
                "Audit event not found",
                404
            );
        }


        return success(
            res,
            audit
        );


    } catch (error) {

        console.error(
            "Audit get error:",
            error
        );

        return failure(
            res,
            "Failed to fetch audit log",
            500
        );
    }
};



// AUDIT STATS

const stats = async (req, res) => {

    try {

        const logs =
            await auditService.getAllAuditLogs();


        return success(
            res,
            {
                totalEvents:
                    logs.length,

                identityEvents:
                    logs.filter(
                        item =>
                            item.category === "IDENTITY"
                    ).length,

                assetEvents:
                    logs.filter(
                        item =>
                            item.category === "ASSET"
                    ).length,

                transactionEvents:
                    logs.filter(
                        item =>
                            item.category === "TRANSACTION"
                    ).length
            }
        );


    } catch (error) {

        console.error(
            "Audit stats error:",
            error
        );

        return failure(
            res,
            "Failed to fetch audit stats",
            500
        );
    }
};


module.exports = {
    list,
    get,
    stats
};