const { store } = require("../config/database");

const getAllTransactions = () => {
    return [...store.transactions].reverse();
};

const getTransactionById = (id) => {
    return store.transactions.find(
        transaction => transaction.id === id
    );
};

const getRecentTransactions = (limit = 10) => {
    return [...store.transactions]
        .reverse()
        .slice(0, limit);
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    getRecentTransactions
};