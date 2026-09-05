const transactionService =
    require("../services/transactionService");

const { success, failure } =
    require("../utils");

const list = (req, res) => {

    return success(
        res,
        transactionService.getAllTransactions()
    );
};

const get = (req, res) => {

    const transaction =
        transactionService.getTransactionById(
            req.params.id
        );

    if (!transaction) {
        return failure(
            res,
            "Transaction not found",
            404
        );
    }

    return success(
        res,
        transaction
    );
};

module.exports = {
    list,
    get
};