import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

import {
  fetchDashboardStats,
  fetchRecentActivity,
  fetchBlockchainStatus,
  fetchTransactions,
} from "../services/api";

import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    assets: 0,
    nfts: 0,
    transactions: 0,
  });

  const [blockchain, setBlockchain] = useState({
    status: "Checking",
    network: "Hyperledger Fabric",
    channel: "crypta-channel",
    consensus: "Raft",
    operational: false,
    connected: false,
  });

  const [transactions, setTransactions] = useState([]);
  const [activity, setActivity] = useState([]);

  const toArray = (value, key) => {
    const data = value?.data ?? value;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.[key])) {
      return data[key];
    }

    if (Array.isArray(value?.[key])) {
      return value[key];
    }

    return [];
  };

  // ---------------------------------------------------------
  // NORMALIZE DASHBOARD STATS
  // ---------------------------------------------------------

  const normalizeStats = (response) => {
    const root =
      response?.data ??
      response ??
      {};

    const statsData =
      root?.stats ??
      root?.data?.stats ??
      root ??
      {};

    return {
      users: Number(
        statsData.users ??
          statsData.totalUsers ??
          0
      ),

      assets: Number(
        statsData.assets ??
          statsData.totalAssets ??
          0
      ),

      nfts: Number(
        statsData.nfts ??
          statsData.totalNFTs ??
          statsData.totalNfts ??
          0
      ),

      transactions: Number(
        statsData.transactions ??
          statsData.totalTransactions ??
          0
      ),
    };
  };

  // ---------------------------------------------------------
  // NORMALIZE BLOCKCHAIN STATUS
  // ---------------------------------------------------------

  const normalizeBlockchain = (response) => {
    const root =
      response?.data ??
      response ??
      {};

    const data =
      root?.blockchain ??
      root?.data?.blockchain ??
      root ??
      {};

    const rawStatus = String(
      data.status ??
        data.blockchainStatus ??
        ""
    )
      .trim()
      .toUpperCase();

    const connected =
      data.connected === true ||
      data.operational === true ||
      rawStatus === "ONLINE" ||
      rawStatus === "CONNECTED";

    return {
      status: connected
        ? "ONLINE"
        : "NOT CONNECTED",

      network:
        data.network ||
        data.networkName ||
        "Hyperledger Fabric",

      channel:
        data.channel ||
        data.channelName ||
        "crypta-channel",

      consensus:
        data.consensus ||
        "Raft",

      operational:
        connected,

      connected:
        connected,
    };
  };

  // ---------------------------------------------------------
  // NORMALIZE TRANSACTIONS
  // ---------------------------------------------------------

  const normalizeTransaction = (tx = {}) => {
    const operationValue =
      tx.operation ||
      tx.type ||
      tx.action ||
      "—";

    const operationMap = {
      CREATE_ASSET: "CREATE",
      MINT_NFT: "MINT",
      TRANSFER_ASSET: "TRANSFER",
      UPDATE_ASSET: "UPDATE",
      DELETE_ASSET: "DELETE",
    };

    const operation =
      operationMap[
        String(
          operationValue
        ).toUpperCase()
      ] ||
      operationValue;

    return {
      ...tx,

      id:
        tx.id ||
        tx.transactionId ||
        tx.txId ||
        "—",

      txId:
        tx.blockchainTxId ||
        tx.blockchain_tx_id ||
        tx.transactionId ||
        tx.txId ||
        tx.id ||
        "—",

      operation,

      assetId:
        tx.assetId ||
        tx.asset_id ||
        "—",

      assetName:
        tx.assetName ||
        tx.asset_name ||
        tx.assetId ||
        tx.asset_id ||
        "—",

      userName:
        tx.userName ||
        tx.user_name ||
        tx.initiatedByName ||
        tx.initiated_by_name ||
        tx.initiatedBy ||
        tx.initiated_by ||
        tx.user ||
        tx.fromUser ||
        tx.from_user ||
        tx.toUser ||
        tx.to_user ||
        "—",

      timestamp:
        tx.timestamp ||
        tx.createdAt ||
        tx.created_at ||
        null,

      status:
        String(
          tx.status ||
            "CONFIRMED"
        ).toUpperCase(),
    };
  };

  // ---------------------------------------------------------
  // LOAD DASHBOARD
  // ---------------------------------------------------------

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        statsResponse,
        activityResponse,
        blockchainResponse,
        transactionsResponse,
      ] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchRecentActivity(),
        fetchBlockchainStatus(),
        fetchTransactions(),
      ]);

      // -----------------------------------------------------
      // DASHBOARD STATS
      // -----------------------------------------------------

      if (
        statsResponse.status ===
        "fulfilled"
      ) {
        setStats(
          normalizeStats(
            statsResponse.value
          )
        );
      } else {
        setStats({
          users: 0,
          assets: 0,
          nfts: 0,
          transactions: 0,
        });
      }

      // -----------------------------------------------------
      // RECENT ACTIVITY
      // -----------------------------------------------------

      if (
        activityResponse.status ===
        "fulfilled"
      ) {
        setActivity(
          toArray(
            activityResponse.value,
            "activity"
          )
        );
      } else {
        setActivity([]);
      }

      // -----------------------------------------------------
      // BLOCKCHAIN STATUS
      // -----------------------------------------------------

      if (
        blockchainResponse.status ===
        "fulfilled"
      ) {
        setBlockchain(
          normalizeBlockchain(
            blockchainResponse.value
          )
        );
      } else {
        setBlockchain({
          status: "NOT CONNECTED",
          network: "Hyperledger Fabric",
          channel: "crypta-channel",
          consensus: "Raft",
          operational: false,
          connected: false,
        });
      }

      // -----------------------------------------------------
      // TRANSACTIONS
      // -----------------------------------------------------

      if (
        transactionsResponse.status ===
        "fulfilled"
      ) {
        const transactionList =
          toArray(
            transactionsResponse.value,
            "transactions"
          );

        setTransactions(
          transactionList.map(
            normalizeTransaction
          )
        );
      } else {
        setTransactions([]);
      }

    } catch (error) {

      console.error(
        "Dashboard loading error:",
        error
      );

      setStats({
        users: 0,
        assets: 0,
        nfts: 0,
        transactions: 0,
      });

      setBlockchain({
        status: "NOT CONNECTED",
        network: "Hyperledger Fabric",
        channel: "crypta-channel",
        consensus: "Raft",
        operational: false,
        connected: false,
      });

      setTransactions([]);
      setActivity([]);

    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // STATUS CLASS
  // ---------------------------------------------------------

  const getStatusClass = (status) => {
    const value =
      String(status || "")
        .toLowerCase();

    if (
      value.includes("success") ||
      value.includes("completed") ||
      value.includes("confirmed") ||
      value.includes("active") ||
      value.includes("online") ||
      value.includes("connected")
    ) {
      return "status-success";
    }

    if (
      value.includes("pending") ||
      value.includes("processing") ||
      value.includes("checking")
    ) {
      return "status-warning";
    }

    if (
      value.includes("failed") ||
      value.includes("rejected") ||
      value.includes("offline") ||
      value.includes("not connected")
    ) {
      return "status-danger";
    }

    return "status-neutral";
  };

  // ---------------------------------------------------------
  // FORMAT DATE
  // ---------------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      [],
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <div className="app-layout">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="main-content">

        <Navbar
          title="Dashboard"
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="page-content">

          {/* PAGE HEADER */}

          <div className="page-header">

            <div>

              <div className="page-eyebrow">
                CRYPTA SHIELD / CONTROL CENTER
              </div>

              <h1>
                Security Dashboard
              </h1>

              <p>
                Welcome back,{" "}
                <strong>
                  {user?.name ||
                    user?.email ||
                    "Administrator"}
                </strong>
                . Monitor your blockchain ecosystem.
              </p>

            </div>

          </div>


          {/* STAT CARDS */}

          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  TOTAL USERS
                </span>

                <div className="stat-icon gold">
                  ◉
                </div>

              </div>

              <div className="stat-value">

                {loading
                  ? "—"
                  : stats.users.toLocaleString()}

              </div>

              <div className="stat-footer">

                <span className="stat-positive">
                  ● Identity Network
                </span>

                <span>
                  Verified accounts
                </span>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  TOTAL ASSETS
                </span>

                <div className="stat-icon cyan">
                  ◈
                </div>

              </div>

              <div className="stat-value">

                {loading
                  ? "—"
                  : stats.assets.toLocaleString()}

              </div>

              <div className="stat-footer">

                <span className="stat-positive">
                  ● Secured
                </span>

                <span>
                  Blockchain assets
                </span>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  TOTAL NFTs
                </span>

                <div className="stat-icon gold">
                  ◆
                </div>

              </div>

              <div className="stat-value">

                {loading
                  ? "—"
                  : stats.nfts.toLocaleString()}

              </div>

              <div className="stat-footer">

                <span className="stat-positive">
                  ● Minted
                </span>

                <span>
                  Digital ownership
                </span>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  TRANSACTIONS
                </span>

                <div className="stat-icon cyan">
                  ⇄
                </div>

              </div>

              <div className="stat-value">

                {loading
                  ? "—"
                  : stats.transactions.toLocaleString()}

              </div>

              <div className="stat-footer">

                <span className="stat-positive">
                  ● Ledger
                </span>

                <span>
                  Recorded operations
                </span>

              </div>

            </div>

          </section>


          {/* BLOCKCHAIN + QUICK ACTIONS */}

          <section className="dashboard-grid">

            {/* BLOCKCHAIN STATUS */}

            <div className="dashboard-card blockchain-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    NETWORK
                  </span>

                  <h2>
                    Blockchain Status
                  </h2>

                </div>

              </div>


              <div className="blockchain-visual">

                <div className="blockchain-ring">

                  <div className="blockchain-core">
                    ⛓
                  </div>

                </div>

                <div>

                  <h3>
                    {blockchain.network}
                  </h3>

                  <p>
                    Hyperledger Fabric blockchain network.
                  </p>

                </div>

              </div>


              <div className="blockchain-details">

                <div>

                  <span>
                    NETWORK
                  </span>

                  <strong>
                    {blockchain.network}
                  </strong>

                </div>

                <div>

                  <span>
                    CHANNEL
                  </span>

                  <strong>
                    {blockchain.channel}
                  </strong>

                </div>

                <div>

                  <span>
                    CONSENSUS
                  </span>

                  <strong>
                    {blockchain.consensus}
                  </strong>

                </div>

              </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    OPERATIONS
                  </span>

                  <h2>
                    Quick Actions
                  </h2>

                </div>

              </div>


              <div className="quick-actions">

                {/* ADD IDENTITY */}

                {user?.role !== "AUDITOR" &&
                  user?.role !== "USER" && (

                  <button
                    className="quick-action"
                    onClick={() =>
                      navigate("/identity")
                    }
                  >

                    <div className="quick-action-icon gold">
                      +
                    </div>

                    <div>

                      <strong>
                        Add Identity
                      </strong>

                      <span>
                        Register a new user
                      </span>

                    </div>

                    <span className="quick-arrow">
                      →
                    </span>

                  </button>

                )}


                {/* CREATE ASSET */}

                {user?.role !== "AUDITOR" &&
                  user?.role !== "USER" && (

                  <button
                    className="quick-action"
                    onClick={() =>
                      navigate("/assets")
                    }
                  >

                    <div className="quick-action-icon cyan">
                      ◈
                    </div>

                    <div>

                      <strong>
                        Create Asset
                      </strong>

                      <span>
                        Register blockchain asset
                      </span>

                    </div>

                    <span className="quick-arrow">
                      →
                    </span>

                  </button>

                )}


                {/* MY ASSETS */}

                {user?.role === "USER" && (

                  <button
                    className="quick-action"
                    onClick={() =>
                      navigate("/assets")
                    }
                  >

                    <div className="quick-action-icon cyan">
                      ◈
                    </div>

                    <div>

                      <strong>
                        My Assets
                      </strong>

                      <span>
                        View assigned digital assets
                      </span>

                    </div>

                    <span className="quick-arrow">
                      →
                    </span>

                  </button>

                )}


                {/* VIEW TRANSACTIONS */}

                <button
                  className="quick-action"
                  onClick={() =>
                    navigate("/transactions")
                  }
                >

                  <div className="quick-action-icon gold">
                    ⇄
                  </div>

                  <div>

                    <strong>
                      View Transactions
                    </strong>

                    <span>
                      Inspect ledger activity
                    </span>

                  </div>

                  <span className="quick-arrow">
                    →
                  </span>

                </button>


                {/* AUDIT TRAIL */}

                {user?.role !== "USER" && (

                  <button
                    className="quick-action"
                    onClick={() =>
                      navigate("/audit-trail")
                    }
                  >

                    <div className="quick-action-icon cyan">
                      ◉
                    </div>

                    <div>

                      <strong>
                        Audit Trail
                      </strong>

                      <span>
                        Review security events
                      </span>

                    </div>

                    <span className="quick-arrow">
                      →
                    </span>

                  </button>

                )}

              </div>

            </div>

          </section>


          {/* RECENT TRANSACTIONS */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">
                  LEDGER ACTIVITY
                </span>

                <h2>
                  Recent Transactions
                </h2>

              </div>

              <Button
                variant="ghost"
                size="small"
                onClick={() =>
                  navigate("/transactions")
                }
              >
                View All →
              </Button>

            </div>


            <div className="dashboard-table-wrapper">

              <table className="cs-table">

                <thead>

                  <tr>

                    <th>
                      TRANSACTION ID
                    </th>

                    <th>
                      OPERATION
                    </th>

                    <th>
                      ASSET
                    </th>

                    <th>
                      USER
                    </th>

                    <th>
                      TIME
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="table-empty"
                      >
                        Loading blockchain transactions...
                      </td>

                    </tr>

                  ) : transactions.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="table-empty"
                      >
                        No transactions found.
                      </td>

                    </tr>

                  ) : (

                    transactions
                      .slice(0, 5)
                      .map(
                        (
                          tx,
                          index
                        ) => (

                          <tr
                            key={
                              tx.id ||
                              tx.txId ||
                              index
                            }
                          >

                            <td>

                              <span className="tx-id">
                                {tx.txId ||
                                  tx.id ||
                                  "—"}
                              </span>

                            </td>

                            <td>
                              {tx.operation ||
                                "—"}
                            </td>

                            <td>
                              {tx.assetName ||
                                tx.assetId ||
                                "—"}
                            </td>

                            <td>
                              {tx.userName ||
                                tx.initiatedBy ||
                                tx.initiated_by ||
                                "—"}
                            </td>

                            <td>

                              {formatDate(
                                tx.timestamp ||
                                  tx.createdAt ||
                                  tx.created_at
                              )}

                            </td>

                            <td>

                              <span
                                className={`status-badge ${getStatusClass(
                                  tx.status
                                )}`}
                              >

                                <span className="status-dot"></span>

                                {tx.status ||
                                  "Unknown"}

                              </span>

                            </td>

                          </tr>

                        )
                      )

                  )}

                </tbody>

              </table>

            </div>

          </section>


          {/* ACTIVITY / AUDIT EVENTS */}

          {user?.role !== "USER" && (

            <section className="dashboard-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    SECURITY EVENTS
                  </span>

                  <h2>
                    Recent Activity
                  </h2>

                </div>

                <Button
                  variant="ghost"
                  size="small"
                  onClick={() =>
                    navigate("/audit-trail")
                  }
                >
                  Full Audit Trail →
                </Button>

              </div>


              <div className="activity-list">

                {activity.length === 0 ? (

                  <div className="activity-empty">
                    No recent security activity.
                  </div>

                ) : (

                  activity
                    .slice(0, 6)
                    .map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="activity-item"
                          key={
                            item.id ||
                            index
                          }
                        >

                          <div className="activity-icon">

                            {item.type ===
                            "TRANSFER"
                              ? "⇄"
                              : item.type ===
                                "USER"
                              ? "◉"
                              : item.type ===
                                "ASSET"
                              ? "◈"
                              : "◆"}

                          </div>


                          <div className="activity-content">

                            <strong>
                              {item.title ||
                                item.action ||
                                "System activity"}
                            </strong>

                            <span>
                              {item.description ||
                                item.message ||
                                "Blockchain security event recorded."}
                            </span>

                          </div>


                          <time>

                            {formatDate(
                              item.timestamp ||
                                item.createdAt ||
                                item.created_at
                            )}

                          </time>

                        </div>

                      )
                    )

                )}

              </div>

            </section>

          )}

        </main>

      </div>

    </div>
  );
}

export default Dashboard;