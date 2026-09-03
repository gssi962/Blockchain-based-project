class Transaction {
    constructor({
        id,
        operation,
        assetId = null,
        initiatedBy = null,
        fromUser = null,
        toUser = null,
        status = "CONFIRMED",
        blockchainTxId = null,
        timestamp = new Date().toISOString()
    }) {
        this.id = id;
        this.operation = operation;
        this.assetId = assetId;
        this.initiatedBy = initiatedBy;
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.status = status;
        this.blockchainTxId = blockchainTxId;
        this.timestamp = timestamp;
    }
}

module.exports = Transaction;