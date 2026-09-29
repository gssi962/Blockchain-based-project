const { pool } = require("../config/database");

const blockchainService =
    require("./blockchainService");

const transactionService =
    require("./transactionService");

// =====================================================
// GET DASHBOARD STATS
// =====================================================

const getStats = async (user = {}) => {

    let totalUsers = 0;

    // ---------------------------------------------
    // Admin -> all users
    // Other roles -> current logged-in user
    // ---------------------------------------------

    if (
        String(
            user?.role_id || ""
        ).toLowerCase() ===
        "role-admin"
    ) {

        const [[users]] =
            await pool.query(`
                SELECT COUNT(*) AS totalUsers
                FROM users
            `);

        totalUsers =
            Number(
                users.totalUsers || 0
            );

    } else {

        totalUsers =
            user ? 1 : 0;
    }

    // ---------------------------------------------
    // ASSETS
    //
    // IMPORTANT:
    // Only assets having a REAL NFT ID are counted.
    //
    // This prevents old/pending DB records from
    // appearing as active blockchain assets.
    // ---------------------------------------------

    const [[assets]] =
        await pool.query(`
            SELECT COUNT(*) AS totalAssets
            FROM assets
            WHERE nft_id IS NOT NULL
              AND TRIM(nft_id) <> ''
              AND UPPER(TRIM(nft_id)) <> 'NFT-PENDING'
              AND UPPER(TRIM(nft_id)) <> 'PENDING'
              AND UPPER(TRIM(nft_id)) <> 'NULL'
              AND UPPER(TRIM(nft_id)) <> 'UNDEFINED'
        `);

    // ---------------------------------------------
    // NFT COUNT
    //
    // Count only REAL NFT IDs.
    // ---------------------------------------------

    const [[nfts]] =
        await pool.query(`
            SELECT COUNT(*) AS totalNFTs
            FROM assets
            WHERE nft_id IS NOT NULL
              AND TRIM(nft_id) <> ''
              AND UPPER(TRIM(nft_id)) <> 'NFT-PENDING'
              AND UPPER(TRIM(nft_id)) <> 'PENDING'
              AND UPPER(TRIM(nft_id)) <> 'NULL'
              AND UPPER(TRIM(nft_id)) <> 'UNDEFINED'
        `);

    // ---------------------------------------------
    // TRANSACTION COUNT
    // ---------------------------------------------

    const [[transactions]] =
        await pool.query(`
            SELECT COUNT(*) AS totalTransactions
            FROM transactions
        `);

    return {

        totalUsers,

        totalAssets:
            Number(
                assets.totalAssets || 0
            ),

        totalNFTs:
            Number(
                nfts.totalNFTs || 0
            ),

        totalTransactions:
            Number(
                transactions.totalTransactions || 0
            )
    };
};

// =====================================================
// REAL BLOCKCHAIN STATUS
// =====================================================

const getBlockchainStatus =
    async () => {

        try {

            // -----------------------------------------
            // CHECK MYSQL
            // -----------------------------------------

            await pool.query(
                "SELECT 1"
            );

            // -----------------------------------------
            // CHECK ACTUAL HYPERLEDGER FABRIC
            // -----------------------------------------

            const fabricStatus =
                await blockchainService
                    .getBlockchainStatus();

            // -----------------------------------------
            // Determine REAL Fabric connection
            // -----------------------------------------

            const fabricConnected =
                fabricStatus?.connected === true ||
                fabricStatus?.operational === true ||
                String(
                    fabricStatus?.status || ""
                ).trim().toUpperCase() ===
                    "ONLINE" ||
                String(
                    fabricStatus?.status || ""
                ).trim().toUpperCase() ===
                    "CONNECTED";

            // -----------------------------------------
            // FABRIC NOT CONNECTED
            // -----------------------------------------

            if (!fabricConnected) {

                return {

                    network:
                        fabricStatus?.network ||
                        "Hyperledger Fabric",

                    channel:
                        fabricStatus?.channel ||
                        process.env.FABRIC_CHANNEL ||
                        "crypta-channel",

                    consensus:
                        fabricStatus?.consensus ||
                        "Raft",

                    status:
                        "NOT CONNECTED",

                    connected:
                        false,

                    operational:
                        false
                };
            }

            // -----------------------------------------
            // FABRIC CONNECTED
            // -----------------------------------------

            return {

                network:
                    fabricStatus?.network ||
                    "Hyperledger Fabric",

                channel:
                    fabricStatus?.channel ||
                    process.env.FABRIC_CHANNEL ||
                    "crypta-channel",

                consensus:
                    fabricStatus?.consensus ||
                    "Raft",

                status:
                    "ONLINE",

                connected:
                    true,

                operational:
                    true
            };

        } catch (error) {

            console.error(
                "Blockchain status check failed:",
                error.message
            );

            return {

                network:
                    "Hyperledger Fabric",

                channel:
                    process.env.FABRIC_CHANNEL ||
                    "crypta-channel",

                consensus:
                    "Raft",

                status:
                    "NOT CONNECTED",

                connected:
                    false,

                operational:
                    false,

                error:
                    error.message
            };
        }
    };

// =====================================================
// COMPLETE DASHBOARD DATA
// =====================================================

const getDashboardData =
    async (user = {}) => {

        const stats =
            await getStats(user);

        const blockchain =
            await getBlockchainStatus();

        const recentTransactions =
            await transactionService
                .getRecentTransactions(5);

        return {

            stats,

            blockchain,

            recentTransactions
        };
    };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getStats,

    getBlockchainStatus,

    getDashboardData

};