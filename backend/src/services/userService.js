const bcrypt = require("bcryptjs");

const {
    store
} = require("../config/database");

const User = require("../models/User");

const {
    createId
} = require("../utils");

const findByEmail = (email) => {
    return store.users.find(
        user =>
            user.email.toLowerCase() ===
            email.toLowerCase()
    );
};

const findById = (id) => {
    return store.users.find(
        user => user.id === id
    );
};

const createUser = async ({
    name,
    email,
    password,
    roleId = "role-user",
    organization = "CRYPTA"
}) => {

    if (findByEmail(email)) {
        throw new Error("Email already registered");
    }

    const passwordHash =
        await bcrypt.hash(password, 10);

    const user = new User({
        id: createId("user"),
        name,
        email,
        passwordHash,
        roleId,
        did: `did:sih:${createId("identity")}`,
        organization,
        verified: false,
        status: "ACTIVE"
    });

    store.users.push(user);

    return user;
};

const verifyPassword = async (
    user,
    password
) => {
    return bcrypt.compare(
        password,
        user.passwordHash
    );
};

const getAllUsers = () => {
    return store.users.map(user => {

        const {
            passwordHash,
            ...safeUser
        } = user;

        return safeUser;
    });
};

module.exports = {
    findByEmail,
    findById,
    createUser,
    verifyPassword,
    getAllUsers
};