const mysql = require("mysql2/promise");

require("dotenv").config();

// =====================================================
// MYSQL CONNECTION
// =====================================================

const pool = mysql.createPool({

    host:
        process.env.DB_HOST ||
        "localhost",

    user:
        process.env.DB_USER ||
        "root",

    password:
        process.env.DB_PASSWORD ||
        "",

    database:
        process.env.DB_NAME ||
        "blockchain_based_project",

    waitForConnections:
        true,

    connectionLimit:
        10,

    queueLimit:
        0,
        ssl: {
    rejectUnauthorized: false
},
});

// =====================================================
// IN-MEMORY STORE
// =====================================================
//
// Used by the current asset/transaction services.
// Keeps the collections available so services do not
// fail with "Cannot read properties of undefined".
// =====================================================

const store = {

    users: [],

    assets: [],

    transactions: [],

    auditLogs: []
};

// =====================================================
// OTP DATABASE SETUP
// =====================================================

const setupOTPColumns = async () => {

    let connection;

    try {

        connection =
            await pool.getConnection();

        const [columns] =
            await connection.execute(`
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'users'
                AND COLUMN_NAME IN (
                    'email_verified',
                    'email_otp',
                    'email_otp_expires'
                )
            `);

        const existingColumns =
            columns.map(
                (column) =>
                    column.COLUMN_NAME
            );

        // =================================================
        // EMAIL VERIFIED
        // =================================================

        if (
            !existingColumns.includes(
                "email_verified"
            )
        ) {

            await connection.execute(`
                ALTER TABLE users
                ADD COLUMN email_verified
                TINYINT(1)
                NOT NULL DEFAULT 0
            `);

            console.log(
                "Added email_verified column"
            );
        }

        // =================================================
        // EMAIL OTP
        // =================================================

        if (
            !existingColumns.includes(
                "email_otp"
            )
        ) {

            await connection.execute(`
                ALTER TABLE users
                ADD COLUMN email_otp
                VARCHAR(10)
                NULL
            `);

            console.log(
                "Added email_otp column"
            );
        }

        // =================================================
        // OTP EXPIRY
        // =================================================

        if (
            !existingColumns.includes(
                "email_otp_expires"
            )
        ) {

            await connection.execute(`
                ALTER TABLE users
                ADD COLUMN email_otp_expires
                DATETIME
                NULL
            `);

            console.log(
                "Added email_otp_expires column"
            );
        }

        // =================================================
        // EXISTING USERS
        // =================================================

        const [result] =
            await connection.execute(`
                UPDATE users
                SET email_verified = 1
                WHERE email_verified = 0
                AND email_otp IS NULL
            `);

        if (
            result.affectedRows > 0
        ) {

            console.log(
                `Marked ${result.affectedRows} existing user(s) as email verified`
            );
        }

        console.log(
            "OTP database setup completed"
        );

    } catch (error) {

        console.error(
            "OTP database setup failed:",
            error.message
        );

        throw error;

    } finally {

        if (connection) {

            connection.release();
        }
    }
};

// =====================================================
// ASSET DOCUMENT STORAGE DATABASE SETUP
// =====================================================
//
// These columns store ONLY metadata/reference.
// The actual document stays in the private server
// uploads directory.
//
// file_hash          = SHA-256 of actual document
// file_name          = original filename
// file_type          = MIME type
// file_size          = size in bytes
// storage_reference  = private storage reference
// storage_file_name  = generated server filename
// =====================================================

const setupAssetStorageColumns = async () => {

    let connection;

    try {

        connection =
            await pool.getConnection();

        const [columns] =
            await connection.execute(`
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'assets'
                AND COLUMN_NAME IN (
                    'file_hash',
                    'file_name',
                    'file_type',
                    'file_size',
                    'storage_reference',
                    'storage_file_name'
                )
            `);

        const existingColumns =
            columns.map(
                (column) =>
                    column.COLUMN_NAME
            );

        // =================================================
        // FILE HASH
        // =================================================

        if (
            !existingColumns.includes(
                "file_hash"
            )
        ) {

            await connection.execute(`
                ALTER TABLE assets
                ADD COLUMN file_hash
                VARCHAR(64)
                NULL
            `);

            console.log(
                "Added assets.file_hash column"
            );
        }

        // =================================================
        // ORIGINAL FILE NAME
        // =================================================

        if (
            !existingColumns.includes(
                "file_name"
            )
        ) {

            await connection.execute(`
                ALTER TABLE assets
                ADD COLUMN file_name
                VARCHAR(255)
                NULL
            `);

            console.log(
                "Added assets.file_name column"
            );
        }

        // =================================================
        // FILE TYPE
        // =================================================

        if (
            !existingColumns.includes(
                "file_type"
            )
        ) {

            await connection.execute(`
                ALTER TABLE assets
                ADD COLUMN file_type
                VARCHAR(150)
                NULL
            `);

            console.log(
                "Added assets.file_type column"
            );
        }

        // =================================================
        // FILE SIZE
        // =================================================

        if (
            !existingColumns.includes(
                "file_size"
            )
        ) {

            await connection.execute(`
                ALTER TABLE assets
                ADD COLUMN file_size
                BIGINT
                NULL
            `);

            console.log(
                "Added assets.file_size column"
            );
        }

        // =================================================
        // STORAGE REFERENCE
        // =================================================

        if (
            !existingColumns.includes(
                "storage_reference"
            )
        ) {

            await connection.execute(`
                ALTER TABLE assets
                ADD COLUMN storage_reference
                VARCHAR(500)
                NULL
            `);

            console.log(
                "Added assets.storage_reference column"
            );
        }

        // =================================================
        // GENERATED SERVER FILE NAME
        // =================================================

        if (
            !existingColumns.includes(
                "storage_file_name"
            )
        ) {

            await connection.execute(`
                ALTER TABLE assets
                ADD COLUMN storage_file_name
                VARCHAR(255)
                NULL
            `);

            console.log(
                "Added assets.storage_file_name column"
            );
        }

        console.log(
            "Asset storage database setup completed"
        );

    } catch (error) {

        console.error(
            "Asset storage database setup failed:",
            error.message
        );

        throw error;

    } finally {

        if (connection) {

            connection.release();
        }
    }
};

// =====================================================
// TEST DATABASE CONNECTION
// =====================================================

const testConnection = async () => {

    try {

        const connection =
            await pool.getConnection();

        console.log(
            "MySQL database connected successfully"
        );

        connection.release();

        await setupOTPColumns();

        await setupAssetStorageColumns();

    } catch (error) {

        console.error(
            "MySQL connection failed:",
            error.message
        );

        throw error;
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {

    pool,

    store,

    testConnection
};