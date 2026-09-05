class Asset {
    constructor({
        id,
        name,
        description = "",
        category = "General",
        ownerId = null,
        nftId = null,
        status = "ACTIVE",
        blockchainId = null,
        createdBy = null,
        createdAt = new Date().toISOString()
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.ownerId = ownerId;
        this.nftId = nftId;
        this.status = status;
        this.blockchainId = blockchainId;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
}

module.exports = Asset;