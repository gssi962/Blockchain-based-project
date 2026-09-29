const { Contract } = require("fabric-contract-api");

class OwnershipContract extends Contract {

    async OwnershipExists(ctx, ownershipId) {
        const ownership = await ctx.stub.getState(ownershipId);
        return ownership && ownership.length > 0;
    }

    async RecordOwnership(
        ctx,
        ownershipId,
        assetId,
        nftId,
        previousOwner,
        newOwner,
        transactionId = ""
    ) {
        const exists = await this.OwnershipExists(
            ctx,
            ownershipId
        );

        if (exists) {
            throw new Error(
                `Ownership record ${ownershipId} already exists`
            );
        }

        if (!ownershipId || !assetId || !newOwner) {
            throw new Error(
                "ownershipId, assetId and newOwner are required"
            );
        }

        const ownership = {
            ownershipId,
            assetId,
            nftId,
            previousOwner,
            newOwner,
            transferredBy: ctx.clientIdentity.getID(),
            transactionId,
            timestamp: new Date().toISOString()
        };

        await ctx.stub.putState(
            ownershipId,
            Buffer.from(JSON.stringify(ownership))
        );

        return JSON.stringify(ownership);
    }

    async ReadOwnership(ctx, ownershipId) {
        const ownership = await ctx.stub.getState(
            ownershipId
        );

        if (!ownership || ownership.length === 0) {
            throw new Error(
                `Ownership record ${ownershipId} does not exist`
            );
        }

        return ownership.toString();
    }

    async GetOwnershipHistory(ctx, assetId) {
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

    async GetAllOwnershipRecords(ctx) {
        const iterator = await ctx.stub.getStateByRange(
            "",
            ""
        );

        const records = [];

        for await (const result of iterator) {
            try {
                const record = JSON.parse(
                    result.value.toString()
                );

                if (
                    record.ownershipId &&
                    record.assetId
                ) {
                    records.push(record);
                }
            } catch (error) {
                // Ignore unrelated records
            }
        }

        return JSON.stringify(records);
    }
}

module.exports = OwnershipContract;