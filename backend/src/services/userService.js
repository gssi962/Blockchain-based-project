const bcrypt = require("bcryptjs");

const { pool } = require("../config/database");
const { createId } = require("../utils");

const findByEmail = async (email) => {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            name,
            email,
            password_hash,
            role_id,
            did,
            organization,
            verified,
            status,
            created_at
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email.trim()]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};

const findById = async (id) => {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            name,
            email,
            password_hash,
            role_id,
            did,
            organization,
            verified,
            status,
            created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};

const createUser = async ({
    name,
    email,
    password,
    roleId = "role-user",
    organization = "CRYPTA"
}) => {
    const existingUser = await findByEmail(email);

    if (existingUser) {
        throw new Error("Email already registered");
    }

    // Check whether role exists
    const [roles] = await pool.execute(
        `
        SELECT id
        FROM roles
        WHERE id = ?
        LIMIT 1
        `,
        [roleId]
    );

    if (roles.length === 0) {
        throw new Error("Invalid role");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = createId("user");
    const did = `did:sih:${createId("identity")}`;

    await pool.execute(
        `
        INSERT INTO users (
            id,
            name,
            email,
            password_hash,
            role_id,
            did,
            organization,
            verified,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            name.trim(),
            email.trim(),
            passwordHash,
            roleId,
            did,
            organization || "CRYPTA",
            false,
            "ACTIVE"
        ]
    );

    return {
        id: userId,
        name: name.trim(),
        email: email.trim(),
        roleId,
        did,
        organization: organization || "CRYPTA",
        verified: false,
        status: "ACTIVE"
    };
};

const verifyPassword = async (user, password) => {
    return bcrypt.compare(
        password,
        user.password_hash
    );
};

const getAllUsers = async () => {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            name,
            email,
            role_id,
            did,
            organization,
            verified,
            status,
            created_at
        FROM users
        ORDER BY created_at DESC
        `
    );

    return rows;
};

const updateUserRole = async (id, roleId) => {
    const user = await findById(id);

    if (!user) {
        throw new Error("User not found");
    }

    const [roles] = await pool.execute(
        `
        SELECT id
        FROM roles
        WHERE id = ?
        LIMIT 1
        `,
        [roleId]
    );

    if (roles.length === 0) {
        throw new Error("Invalid role");
    }

    await pool.execute(
        `
        UPDATE users
        SET role_id = ?
        WHERE id = ?
        `,
        [roleId, id]
    );

    return await findById(id);
};

module.exports = {
    findByEmail,
    findById,
    createUser,
    verifyPassword,
    getAllUsers,
    updateUserRole
};