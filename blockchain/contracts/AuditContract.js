const { Contract } = require("fabric-contract-api");

class AuditContract extends Contract {

    async AuditExists(ctx, auditId) {
        const audit = await ctx.stub.getState(auditId);
        return audit && audit.length > 0;
    }

    async RecordAudit(
        ctx,
        auditId,
        action,
        category,
        performedBy,
        description = "",
        assetId = "",
        nftId = "",
        transactionId = ""
    ) {
        const exists = await this.AuditExists(
            ctx,
            auditId
        );

        if (exists) {
            throw new Error(
                `Audit record ${auditId} already exists`
            );
        }

        if (!auditId || !action || !performedBy) {
            throw new Error(
                "auditId, action and performedBy are required"
            );
        }

        const audit = {
            auditId,
            action,
            category,
            performedBy,
            description,
            assetId,
            nftId,
            transactionId,
            timestamp: new Date().toISOString()
        };

        await ctx.stub.putState(
            auditId,
            Buffer.from(JSON.stringify(audit))
        );

        return JSON.stringify(audit);
    }

    async ReadAudit(ctx, auditId) {
        const audit = await ctx.stub.getState(auditId);

        if (!audit || audit.length === 0) {
            throw new Error(
                `Audit record ${auditId} does not exist`
            );
        }

        return audit.toString();
    }

    async GetAssetAuditHistory(ctx, assetId) {
        const iterator = await ctx.stub.getStateByRange(
            "",
            ""
        );

        const history = [];

        for await (const result of iterator) {
            try {
                const record = JSON.parse(
                    result.value.toString()
                );

                if (record.assetId === assetId) {
                    history.push(record);
                }
            } catch (error) {
                // Ignore unrelated records
            }
        }

        return JSON.stringify(history);
    }

    async GetAllAudits(ctx) {
        const iterator = await ctx.stub.getStateByRange(
            "",
            ""
        );

        const audits = [];

        for await (const result of iterator) {
            try {
                const record = JSON.parse(
                    result.value.toString()
                );

                if (
                    record.auditId &&
                    record.action
                ) {
                    audits.push(record);
                }
            } catch (error) {
                // Ignore unrelated records
            }
        }

        return JSON.stringify(audits);
    }
}

module.exports = AuditContract;