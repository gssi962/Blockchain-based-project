class NFT {
    constructor({
        nftId,
        assetId,
        ownerId,
        tokenUri = "",
        metadataHash = "",
        mintedBy = "",
        createdAt = new Date().toISOString(),
        status = "MINTED"
    }) {
        this.nftId = nftId;
        this.assetId = assetId;
        this.ownerId = ownerId;
        this.tokenUri = tokenUri;
        this.metadataHash = metadataHash;
        this.mintedBy = mintedBy;
        this.createdAt = createdAt;
        this.status = status;
    }
}

module.exports = NFT;