const roleService =
    require("../services/roleService");

const {
    success,
    failure
} = require("../utils");

const listRoles = (req, res) => {

    return success(
        res,
        roleService.getAllRoles()
    );
};

const createRole = (req, res) => {

    const {
        name,
        permissions = []
    } = req.body;

    if (!name) {
        return failure(
            res,
            "Role name is required",
            400
        );
    }

    try {

        const role =
            roleService.createRole({
                name,
                permissions
            });

        return success(
            res,
            role,
            201
        );

    } catch (error) {

        return failure(
            res,
            error.message,
            409
        );
    }
};

const updatePermissions = (req, res) => {

    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
        return failure(
            res,
            "permissions must be an array",
            400
        );
    }

    try {

        const role =
            roleService.updatePermissions(
                req.params.id,
                permissions
            );

        return success(res, role);

    } catch (error) {

        return failure(
            res,
            error.message,
            404
        );
    }
};

module.exports = {
    listRoles,
    createRole,
    updatePermissions
};