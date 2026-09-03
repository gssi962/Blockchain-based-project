class User {
    constructor({
        id,
        name,
        email,
        passwordHash,
        roleId,
        did,
        organization,
        verified = false,
        status = "ACTIVE",
        createdAt = new Date().toISOString()
    }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roleId = roleId;
        this.did = did;
        this.organization = organization;
        this.verified = verified;
        this.status = status;
        this.createdAt = createdAt;
    }
}

module.exports = User;