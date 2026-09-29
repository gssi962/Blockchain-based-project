const { Contract } = require("fabric-contract-api");

class NFTContract extends Contract {

    async NFTExists(ctx, nftId) {
        const nft = await ctx.stub.getState(nftId);
        return nft && nft.length > 0;
    }

    async MintNFT(
        ctx,
        nftId,
        assetId,
        ownerId,
        tokenUri = "",
        metadataHash = ""
    ) {
        const exists = await this.NFTExists(ctx, nftId);

        if (exists) {
            throw new Error(`NFT ${nftId} already exists`);
        }

        if (!nftId || !assetId || !ownerId) {
            throw new Error(
                "nftId, assetId and ownerId are required"
            );
        }

        const nft = {
            nftId,
            assetId,
            ownerId,
            tokenUri,
            metadataHash,
            mintedBy: ctx.clientIdentity.getID(),
            createdAt: ctx.stub.getTxTimestamp().seconds.toString(),
            status: "MINTED"
        };

        await ctx.stub.putState(
            nftId,
            Buffer.from(JSON.stringify(nft))
        );

        return JSON.stringify(nft);
    }

    async ReadNFT(ctx, nftId) {
        const nft = await ctx.stub.getState(nftId);

        if (!nft || nft.length === 0) {
            throw new Error(
                `NFT ${nftId} does not exist`
            );
        }

        return nft.toString();
    }

    async TransferNFT(
        ctx,
        nftId,
        newOwnerId
    ) {
        const nft = await ctx.stub.getState(nftId);

        if (!nft || nft.length === 0) {
            throw new Error(
                `NFT ${nftId} does not exist`
            );
        }

        if (!newOwnerId) {
            throw new Error(
                "New owner is required"
            );
        }

        const existingNFT =
            JSON.parse(nft.toString());

        existingNFT.ownerId = newOwnerId;
        existingNFT.updatedAt =
            ctx.stub.getTxTimestamp()
                .seconds
                .toString();

        await ctx.stub.putState(
            nftId,
            Buffer.from(
                JSON.stringify(existingNFT)
            )
        );

        return JSON.stringify(existingNFT);
    }

    async BurnNFT(ctx, nftId) {
        const exists =
            await this.NFTExists(
                ctx,
                nftId
            );

        if (!exists) {
            throw new Error(
                `NFT ${nftId} does not exist`
            );
        }

        await ctx.stub.deleteState(nftId);

        return `NFT ${nftId} burned`;
    }

    async GetAllNFTs(ctx) {
        const iterator =
            await ctx.stub.getStateByRange(
                "",
                ""
            );

        const nfts = [];

        while (true) {
            const result =
                await iterator.next();

            if (result.done) {
                break;
            }

            if (!result.value) {
                continue;
            }

            try {
                const record =
                    JSON.parse(
                        result.value.value.toString()
                    );

                if (
                    record.nftId &&
                    record.assetId &&
                    record.status === "MINTED"
                ) {
                    nfts.push(record);
                }
            } catch (error) {
                // Ignore non-NFT records
            }
        }

        await iterator.close();

        return JSON.stringify(nfts);
    }
}

module.exports = NFTContract;