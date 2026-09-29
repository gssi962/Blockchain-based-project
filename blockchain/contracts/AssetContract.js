const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

class AssetContract extends Contract {

    async AssetExists(ctx, assetId) {
        const asset = await ctx.stub.getState(assetId);

        return asset && asset.length > 0;
    }

    async CreateAsset(
        ctx,
        assetId,
        name,
        description,
        category,
        ownerId,
        fileHash,
        storageReference
    ) {
        fileHash = fileHash || "";
        storageReference = storageReference || "";

        const exists = await this.AssetExists(ctx, assetId);

        if (exists) {
            throw new Error(`Asset ${assetId} already exists`);
        }

        if (!assetId || !name || !ownerId) {
            throw new Error(
                "assetId, name and ownerId are required"
            );
        }

        const asset = {
            assetId,
            name,
            description,
            category,
            ownerId,
            nftId: "",
            fileHash,
            storageReference,

            // Fabric transaction timestamp
            createdAt: ctx.stub
                .getTxTimestamp()
                .seconds
                .toString(),

            status: "ACTIVE"
        };

        await ctx.stub.putState(
            assetId,
            Buffer.from(JSON.stringify(asset))
        );

        return JSON.stringify(asset);
    }

    async ReadAsset(ctx, assetId) {
        const asset = await ctx.stub.getState(assetId);

        if (!asset || asset.length === 0) {
            throw new Error(
                `Asset ${assetId} does not exist`
            );
        }

        return asset.toString();
    }

    async UpdateAsset(
        ctx,
        assetId,
        name,
        description,
        category
    ) {
        const asset = await ctx.stub.getState(assetId);

        if (!asset || asset.length === 0) {
            throw new Error(
                `Asset ${assetId} does not exist`
            );
        }

        const existingAsset = JSON.parse(
            asset.toString()
        );

        existingAsset.name = name;
        existingAsset.description = description;
        existingAsset.category = category;

        // NOTE:
        // Existing behavior preserved.
        existingAsset.updatedAt =
            new Date().toISOString();

        await ctx.stub.putState(
            assetId,
            Buffer.from(
                JSON.stringify(existingAsset)
            )
        );

        return JSON.stringify(existingAsset);
    }

    async TransferAsset(
        ctx,
        assetId,
        newOwnerId
    ) {
        const asset = await ctx.stub.getState(assetId);

        if (!asset || asset.length === 0) {
            throw new Error(
                `Asset ${assetId} does not exist`
            );
        }

        if (!newOwnerId) {
            throw new Error(
                "New owner is required"
            );
        }

        const existingAsset = JSON.parse(
            asset.toString()
        );

        const previousOwner =
            existingAsset.ownerId;

        /*
         * IMPORTANT:
         * Do NOT use new Date() or Date.now()
         * during an endorsed Fabric transaction.
         *
         * Fabric transaction timestamp is deterministic
         * across endorsing peers.
         */
        const txTimestamp =
            ctx.stub.getTxTimestamp();

        const timestamp =
            new Date(
                Number(txTimestamp.seconds.low) * 1000 +
                Math.floor(
                    txTimestamp.nanos / 1000000
                )
            ).toISOString();

        // Update owner
        existingAsset.ownerId = newOwnerId;

        // Deterministic timestamp
        existingAsset.updatedAt = timestamp;

        await ctx.stub.putState(
            assetId,
            Buffer.from(
                JSON.stringify(existingAsset)
            )
        );

        /*
         * Transfer history record
         */
        const transferRecord = {
            assetId,
            previousOwner,
            newOwner: newOwnerId,
            timestamp
        };

        /*
         * IMPORTANT:
         * Use Fabric transaction ID instead of Date.now().
         * Transaction ID is deterministic across peers.
         */
        const transferKey =
            ctx.stub.createCompositeKey(
                "TRANSFER",
                [
                    assetId,
                    ctx.stub.getTxID()
                ]
            );

        await ctx.stub.putState(
            transferKey,
            Buffer.from(
                JSON.stringify(transferRecord)
            )
        );

        return JSON.stringify(existingAsset);
    }

    async DeleteAsset(ctx, assetId) {
        const exists =
            await this.AssetExists(
                ctx,
                assetId
            );

        if (!exists) {
            throw new Error(
                `Asset ${assetId} does not exist`
            );
        }

        await ctx.stub.deleteState(assetId);

        return `Asset ${assetId} deleted`;
    }

    async GetAllAssets(ctx) {
        const iterator =
            await ctx.stub.getStateByRange(
                "",
                ""
            );

        const assets = [];

        while (true) {
            const result =
                await iterator.next();

            if (result.done) {
                break;
            }

            if (!result.value) {
                continue;
            }

            const key =
                result.value.key;

            const value =
                result.value.value;

            if (key.startsWith("TRANSFER")) {
                continue;
            }

            try {
                const asset =
                    JSON.parse(
                        value.toString()
                    );

                if (
                    asset.assetId &&
                    asset.name
                ) {
                    assets.push(asset);
                }
            } catch (error) {
                console.error(
                    "Skipping invalid ledger record:",
                    key
                );
            }
        }

        await iterator.close();

        return JSON.stringify(assets);
    }

    async GenerateFileHash(
        ctx,
        fileContent
    ) {
        if (!fileContent) {
            throw new Error(
                "File content is required"
            );
        }

        return crypto
            .createHash("sha256")
            .update(fileContent)
            .digest("hex");
    }
}

module.exports = AssetContract;