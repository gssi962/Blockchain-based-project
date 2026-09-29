class Asset {
    constructor({
        assetId,
        name,
        description = "",
        category = "",
        ownerId = "",
        nftId = "",
        fileHash = "",
        storageReference = "",
        createdAt = new Date().toISOString(),
        status = "ACTIVE"
    }) {
        this.assetId = assetId;
        this.name = name;
        this.description = description;
        this.category = category;
        this.ownerId = ownerId;
        this.nftId = nftId;
        this.fileHash = fileHash;
        this.storageReference = storageReference;
        this.createdAt = createdAt;
        this.status = status;
    }
}

module.exports = Asset;