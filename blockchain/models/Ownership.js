class Ownership {
    constructor({
        ownershipId,
        assetId,
        nftId = "",
        previousOwner = "",
        newOwner,
        transferredBy,
        transactionId = "",
        timestamp = new Date().toISOString()
    }) {
        this.ownershipId = ownershipId;
        this.assetId = assetId;
        this.nftId = nftId;
        this.previousOwner = previousOwner;
        this.newOwner = newOwner;
        this.transferredBy = transferredBy;
        this.transactionId = transactionId;
        this.timestamp = timestamp;
    }
}

module.exports = Ownership;