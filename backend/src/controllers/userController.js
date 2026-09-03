const userService = require("../services/userService");
const { sendSuccess, sendError } = require("../utils/response");

const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        return sendSuccess(res, users);
    } catch (error) {
        return sendError(res, error.message);
    }
};

const getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(
            req.params.id
        );

        if (!user) {
            return sendError(
                res,
                "User not found",
                404
            );
        }

        return sendSuccess(res, user);
    } catch (error) {
        return sendError(res, error.message);
    }
};

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            roleId,
            organization
        } = req.body;

        if (!name || !email || !password) {
            return sendError(
                res,
                "Name, email and password are required",
                400
            );
        }

        const user = await userService.createUser({
            name,
            email,
            password,
            roleId,
            organization
        });

        return sendSuccess(res, user, 201);
    } catch (error) {
        return sendError(res, error.message);
    }
};

const updateUserRole = async (req, res) => {
    try {
        const {
            roleId
        } = req.body;

        if (!roleId) {
            return sendError(
                res,
                "Role ID is required",
                400
            );
        }

        const user = await userService.updateUserRole(
            req.params.id,
            roleId
        );

        return sendSuccess(res, user);
    } catch (error) {
        return sendError(res, error.message);
    }
};

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUserRole
};