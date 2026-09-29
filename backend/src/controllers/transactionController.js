const transactionService =
    require("../services/transactionService");

const { success, failure } =
    require("../utils");

// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

const list = async (req, res) => {

    try {

        const transactions =
            await transactionService.getAllTransactions({
                userId: req.user.id,
                role: req.user.role_id
            });

        console.log(
            "========== TRANSACTIONS =========="
        );

        console.log(
            "User:",
            req.user.name
        );

        console.log(
            "Role:",
            req.user.role_id
        );

        console.log(
            "Transactions found:",
            transactions.length
        );

        console.log(
            "Transactions:",
            transactions
        );

        console.log(
            "=================================="
        );

        return success(
            res,
            transactions
        );

    } catch (error) {

        console.error(
            "Get transactions error:",
            error
        );

        return failure(
            res,
            error.message ||
                "Failed to load transactions",
            500
        );
    }
};


// =====================================================
// GET SINGLE TRANSACTION
// =====================================================

const get = async (req, res) => {

    try {

        const transaction =
            await transactionService.getTransactionById(
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

    } catch (error) {

        console.error(
            "Get transaction error:",
            error
        );

        return failure(
            res,
            error.message ||
                "Failed to load transaction",
            500
        );
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    list,
    get

};