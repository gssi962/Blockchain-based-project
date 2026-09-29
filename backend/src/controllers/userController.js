const userService = require("../services/userService");

const {
  sendSuccess,
  sendError,
} = require("../utils/response");

const getUsers = async (req, res) => {
  try {
    // Admin can see all users
    if (req.user.role_id === "role-admin") {
      const users = await userService.getAllUsers();
      return sendSuccess(res, users);
    }

    // Other roles can see only their own profile
    const user = await userService.findById(req.user.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, [user]);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userService.findById(
      req.params.id
    );

    if (!user) {
      return sendError(
        res,
        "User not found",
        404
      );
    }

    return sendSuccess(
      res,
      user
    );
  } catch (error) {
    return sendError(
      res,
      error.message
    );
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      roleId,
      organization,
    } = req.body;

    if (!name || !email || !organization) {
      return sendError(
        res,
        "Name, email and organization are required",
        400
      );
    }

    const user = await userService.createUser({
      name,
      email,
      roleId,
      organization,
    });

    return sendSuccess(
      res,
      user,
      201
    );
  } catch (error) {
    return sendError(
      res,
      error.message
    );
  }
};

const updateUserRole = async (req, res) => {
  try {
    const {
      roleId,
      organization,
    } = req.body;

    if (!roleId) {
      return sendError(
        res,
        "Role is required",
        400
      );
    }

    const user = await userService.updateUserRole(
      req.params.id,
      roleId,
      organization
    );

    return sendSuccess(
      res,
      user
    );
  } catch (error) {
    return sendError(
      res,
      error.message
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userService.findById(
      req.params.id
    );

    if (!user) {
      return sendError(
        res,
        "User not found",
        404
      );
    }

    await userService.deleteUser(
      req.params.id
    );

    return sendSuccess(
      res,
      {
        message: "User removed successfully",
      }
    );
  } catch (error) {
    return sendError(
      res,
      error.message
    );
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserRole,
  deleteUser,
};