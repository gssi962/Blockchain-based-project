const { store } = require("../config/database");
const Role = require("../models/Role");
const { createId } = require("../utils");

const getAllRoles = () => {
    return store.roles;
};

const getRoleById = (id) => {
    return store.roles.find(role => role.id === id);
};

const createRole = ({ name, permissions = [] }) => {
    const exists = store.roles.find(
        role => role.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        throw new Error("Role already exists");
    }

    const role = new Role({
        id: createId("role"),
        name,
        permissions
    });

    store.roles.push(role);

    return role;
};

const updatePermissions = (id, permissions) => {
    const role = getRoleById(id);

    if (!role) {
        throw new Error("Role not found");
    }

    role.permissions = permissions;

    return role;
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updatePermissions
};