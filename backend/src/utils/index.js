const crypto = require("crypto");

const createId = (prefix) => {
    return `${prefix}-${crypto.randomUUID()}`;
};

const success = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data
    });
};

const failure = (res, message, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = {
    createId,
    success,
    failure
};