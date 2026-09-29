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

  return rows.length === 0 ? null : rows[0];
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

  return rows.length === 0 ? null : rows[0];
};



const createUser = async ({
  name,
  email,
  roleId = "role-user",
  organization = "CRYPTA",
}) => {

  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
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


  if (!roles.length) {
    throw new Error("Invalid role");
  }


  const userId = createId("user");

  const did =
    `did:sih:${createId("identity")}`;


  await pool.execute(
    `
    INSERT INTO users
    (
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
      null,
      roleId,
      did,
      organization || "CRYPTA",
      false,
      "ACTIVE",
    ]
  );


  return {
    id: userId,
    name: name.trim(),
    email: email.trim(),
    roleId,
    did,
    organization:
      organization || "CRYPTA",
    verified: false,
    status: "ACTIVE",
  };
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



// =====================================================
// UPDATE USER ROLE + AUDIT LOG
// =====================================================

const updateUserRole = async (
  id,
  roleId,
  organization,
  performedBy = "user-admin"
) => {

  const user = await findById(id);


  if (!user) {
    throw new Error(
      "User not found"
    );
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


  if (!roles.length) {
    throw new Error(
      "Invalid role"
    );
  }


  const newOrganization =
    organization !== undefined
      ? organization.trim()
      : user.organization;



  // Update user role

  await pool.execute(
    `
    UPDATE users
    SET
      role_id = ?,
      organization = ?
    WHERE id = ?
    `,
    [
      roleId,
      newOrganization,
      id
    ]
  );



  // Create audit log

  await pool.execute(
    `
    INSERT INTO audit_logs
    (
      id,
      action,
      category,
      description,
      performed_by,
      performed_by_did,
      status,
      metadata
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      createId("audit"),
      "ROLE_UPDATED",
      "USER_MANAGEMENT",
      `User role changed from ${user.role_id} to ${roleId}`,
      performedBy,
      null,
      "SUCCESS",
      JSON.stringify({
        targetUserId: id,
        previousRole: user.role_id,
        updatedRole: roleId
      })
    ]
  );


  return await findById(id);
};




const deleteUser = async (id) => {

  const user = await findById(id);


  if (!user) {
    throw new Error(
      "User not found"
    );
  }


  await pool.execute(
    `
    DELETE FROM users
    WHERE id = ?
    `,
    [id]
  );


  return true;
};



module.exports = {

  findByEmail,
  findById,
  createUser,
  getAllUsers,
  updateUserRole,
  deleteUser,

};