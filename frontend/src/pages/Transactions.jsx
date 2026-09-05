import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Table from "../components/Table";

import {
  fetchTransactions,
  fetchTransactionById,
} from "../services/api";

function Transactions() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [operationFilter, setOperationFilter] = useState("ALL");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);

      const response = await fetchTransactions();

      const txData =
  response?.data?.transactions ||
  response?.data ||
  response?.transactions ||
  response ||
  [];

setTransactions(
  Array.isArray(txData)
    ? txData
    : []
);
    } catch (error) {
      console.error(
        "Transaction loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const query = search.toLowerCase();

      const txId =
        tx.txId ||
        tx.transactionId ||
        tx.id ||
        "";

      const asset =
        tx.assetName ||
        tx.assetId ||
        "";

      const user =
        tx.userName ||
        tx.user ||
        "";

      const matchesSearch =
        !query ||
        String(txId)
          .toLowerCase()
          .includes(query) ||
        String(asset)
          .toLowerCase()
          .includes(query) ||
        String(user)
          .toLowerCase()
          .includes(query);

      const status = String(
        tx.status || ""
      ).toUpperCase();

      const operation = String(
        tx.operation ||
        tx.type ||
        ""
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      const matchesOperation =
        operationFilter === "ALL" ||
        operation === operationFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesOperation
      );
    });
  }, [
    transactions,
    search,
    statusFilter,
    operationFilter,
  ]);

  const getStatusClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (
      value.includes("success") ||
      value.includes("completed") ||
      value.includes("confirmed") ||
      value.includes("success")
    ) {
      return "status-success";
    }

    if (
      value.includes("pending") ||
      value.includes("processing")
    ) {
      return "status-warning";
    }

    if (
      value.includes("failed") ||
      value.includes("rejected")
    ) {
      return "status-danger";
    }

    return "status-neutral";
  };

  const getOperationClass = (operation) => {
    const value = String(
      operation || ""
    ).toLowerCase();

    if (value.includes("transfer")) {
      return "operation-transfer";
    }

    if (
      value.includes("create") ||
      value.includes("mint")
    ) {
      return "operation-create";
    }

    if (
      value.includes("update") ||
      value.includes("modify")
    ) {
      return "operation-update";
    }

    if (
      value.includes("delete") ||
      value.includes("remove")
    ) {
      return "operation-delete";
    }

    return "operation-default";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const shortenHash = (
    value,
    start = 14,
    end = 8
  ) => {
    if (!value) return "—";

    const stringValue = String(value);

    if (
      stringValue.length <=
      start + end
    ) {
      return stringValue;
    }

    return `${stringValue.slice(
      0,
      start
    )}...${stringValue.slice(-end)}`;
  };

  const openTransaction = async (tx) => {
    setModalOpen(true);
    setDetailsLoading(true);
    setSelectedTransaction(tx);

    const txId =
      tx.txId ||
      tx.transactionId ||
      tx.id;

    if (!txId) {
      setDetailsLoading(false);
      return;
    }

    try {
      const response =
        await fetchTransactionById(txId);

      setSelectedTransaction(
        response?.data ??
        response ??
        tx
      );
    } catch (error) {
      console.error(
        "Transaction details error:",
        error
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const columns = [
    {
      key: "txId",
      label: "TRANSACTION ID",
      render: (_, tx) => (
        <span className="transaction-hash">
          {shortenHash(
            tx.txId ||
            tx.transactionId ||
            tx.id
          )}
        </span>
      ),
    },

    {
      key: "operation",
      label: "OPERATION",
      render: (_, tx) => {
        const operation =
          tx.operation ||
          tx.type ||
          "UNKNOWN";

        return (
          <span
            className={`operation-badge ${getOperationClass(
              operation
            )}`}
          >
            {operation}
          </span>
        );
      },
    },

    {
      key: "asset",
      label: "ASSET",
      render: (_, tx) => (
        <div className="transaction-asset">
          <strong>
            {tx.assetName ||
              "Blockchain Asset"}
          </strong>

          <span>
            {tx.assetId ||
              "ASSET-PENDING"}
          </span>
        </div>
      ),
    },

    {
      key: "user",
      label: "INITIATED BY",
      render: (_, tx) => (
        <div className="transaction-user">
          <span>
            {(tx.userName ||
              tx.user ||
              "U")
              .charAt(0)
              .toUpperCase()}
          </span>

          <strong>
            {tx.userName ||
              tx.user ||
              "Unknown User"}
          </strong>
        </div>
      ),
    },

    {
      key: "timestamp",
      label: "TIMESTAMP",
      render: (_, tx) => (
        <span className="transaction-time">
          {formatDate(
            tx.timestamp ||
            tx.createdAt
          )}
        </span>
      ),
    },

    {
      key: "status",
      label: "STATUS",
      render: (value) => (
        <span
          className={`status-badge ${getStatusClass(
            value
          )}`}
        >
          <span className="status-dot"></span>
          {value || "Unknown"}
        </span>
      ),
    },

    {
      key: "action",
      label: "",
      render: (_, tx) => (
        <button
          className="table-action"
          onClick={(e) => {
            e.stopPropagation();
            openTransaction(tx);
          }}
        >
          Details →
        </button>
      ),
    },
  ];

  const successfulCount =
    transactions.filter((tx) =>
      [
        "SUCCESS",
        "COMPLETED",
        "CONFIRMED",
      ].includes(
        String(tx.status || "").toUpperCase()
      )
    ).length;

  const pendingCount =
    transactions.filter((tx) =>
      [
        "PENDING",
        "PROCESSING",
      ].includes(
        String(tx.status || "").toUpperCase()
      )
    ).length;

  const failedCount =
    transactions.filter((tx) =>
      [
        "FAILED",
        "REJECTED",
      ].includes(
        String(tx.status || "").toUpperCase()
      )
    ).length;

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
          title="Transactions"
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="page-content">

          {/* HEADER */}

          <div className="page-header">

            <div>
              <div className="page-eyebrow">
                CRYPTA SHIELD / BLOCKCHAIN LEDGER
              </div>

              <h1>
                Transactions
              </h1>

              <p>
                Monitor every operation recorded
                on the distributed ledger.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={loadTransactions}
              loading={loading}
            >
              ↻ Refresh Ledger
            </Button>

          </div>


          {/* SUMMARY */}

          <div className="transaction-summary">

            <div className="transaction-summary-card">
              <div className="transaction-summary-icon gold">
                ⇄
              </div>

              <div>
                <span>
                  TOTAL TRANSACTIONS
                </span>

                <strong>
                  {transactions.length}
                </strong>
              </div>
            </div>


            <div className="transaction-summary-card">
              <div className="transaction-summary-icon success">
                ✓
              </div>

              <div>
                <span>
                  CONFIRMED
                </span>

                <strong>
                  {successfulCount}
                </strong>
              </div>
            </div>


            <div className="transaction-summary-card">
              <div className="transaction-summary-icon warning">
                ◷
              </div>

              <div>
                <span>
                  PENDING
                </span>

                <strong>
                  {pendingCount}
                </strong>
              </div>
            </div>


            <div className="transaction-summary-card">
              <div className="transaction-summary-icon danger">
                !
              </div>

              <div>
                <span>
                  FAILED
                </span>

                <strong>
                  {failedCount}
                </strong>
              </div>
            </div>

          </div>


          {/* LEDGER */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <span className="card-eyebrow">
                  IMMUTABLE LEDGER
                </span>

                <h2>
                  Transaction History
                </h2>
              </div>

              <div className="ledger-live">
                <span className="status-dot"></span>
                LIVE LEDGER
              </div>

            </div>


            {/* FILTERS */}

            <div className="transaction-toolbar">

              <div className="transaction-search">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search transaction, asset, user..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>


              <select
                value={operationFilter}
                onChange={(e) =>
                  setOperationFilter(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  All Operations
                </option>

                <option value="CREATE">
                  Create
                </option>

                <option value="MINT">
                  Mint
                </option>

                <option value="TRANSFER">
                  Transfer
                </option>

                <option value="UPDATE">
                  Update
                </option>

                <option value="DELETE">
                  Delete
                </option>
              </select>


              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="SUCCESS">
                  Success
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="FAILED">
                  Failed
                </option>
              </select>

            </div>


            <Table
              columns={columns}
              data={filteredTransactions}
              loading={loading}
              emptyMessage="No blockchain transactions found."
              onRowClick={openTransaction}
            />

          </div>


          {/* LEDGER FOOTER */}

          <div className="ledger-security-card">

            <div className="ledger-chain-icon">
              ⛓
            </div>

            <div>
              <h3>
                Ledger Integrity Verified
              </h3>

              <p>
                Transaction records are synchronized
                with the Hyperledger Fabric network
                and protected against unauthorized
                modification.
              </p>
            </div>

            <div className="ledger-sync">
              <span className="status-dot"></span>
              Synchronized
            </div>

          </div>

        </main>
      </div>


      {/* TRANSACTION DETAILS MODAL */}

      <Modal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title="Transaction Details"
        size="large"
      >

        {detailsLoading ? (

          <div className="transaction-loading">
            <div className="loading-spinner"></div>
            <span>
              Verifying ledger transaction...
            </span>
          </div>

        ) : selectedTransaction ? (

          <div className="transaction-details">

            <div className="transaction-detail-header">

              <div className="transaction-confirmed-icon">
                ✓
              </div>

              <div>
                <span className="card-eyebrow">
                  LEDGER RECORD
                </span>

                <h2>
                  {selectedTransaction.operation ||
                    selectedTransaction.type ||
                    "Blockchain Operation"}
                </h2>
              </div>

              <span
                className={`status-badge ${getStatusClass(
                  selectedTransaction.status
                )}`}
              >
                <span className="status-dot"></span>
                {selectedTransaction.status ||
                  "Unknown"}
              </span>

            </div>


            <div className="transaction-detail-grid">

              <div className="transaction-detail-item full">
                <span>
                  TRANSACTION ID
                </span>

                <strong className="full-hash">
                  {selectedTransaction.txId ||
                    selectedTransaction.transactionId ||
                    selectedTransaction.id ||
                    "—"}
                </strong>
              </div>


              <div className="transaction-detail-item">
                <span>
                  OPERATION
                </span>

                <strong>
                  {selectedTransaction.operation ||
                    selectedTransaction.type ||
                    "—"}
                </strong>
              </div>


              <div className="transaction-detail-item">
                <span>
                  TIMESTAMP
                </span>

                <strong>
                  {formatDate(
                    selectedTransaction.timestamp ||
                    selectedTransaction.createdAt
                  )}
                </strong>
              </div>


              <div className="transaction-detail-item">
                <span>
                  ASSET
                </span>

                <strong>
                  {selectedTransaction.assetName ||
                    selectedTransaction.assetId ||
                    "—"}
                </strong>
              </div>


              <div className="transaction-detail-item">
                <span>
                  INITIATED BY
                </span>

                <strong>
                  {selectedTransaction.userName ||
                    selectedTransaction.user ||
                    "—"}
                </strong>
              </div>


              <div className="transaction-detail-item">
                <span>
                  NETWORK
                </span>

                <strong>
                  {selectedTransaction.network ||
                    "Hyperledger Fabric"}
                </strong>
              </div>


              <div className="transaction-detail-item">
                <span>
                  CHANNEL
                </span>

                <strong>
                  {selectedTransaction.channel ||
                    "crypta-channel"}
                </strong>
              </div>


              <div className="transaction-detail-item">
                <span>
                  CHAINCODE
                </span>

                <strong>
                  {selectedTransaction.chaincode ||
                    "AssetContract"}
                </strong>
              </div>


              <div className="transaction-detail-item">
                <span>
                  BLOCK NUMBER
                </span>

                <strong>
                  {selectedTransaction.blockNumber ||
                    "—"}
                </strong>
              </div>

            </div>


            {selectedTransaction.description && (
              <div className="transaction-description">

                <span>
                  DESCRIPTION
                </span>

                <p>
                  {selectedTransaction.description}
                </p>

              </div>
            )}


            <div className="transaction-verified">

              <span>✓</span>

              <div>
                <strong>
                  Transaction cryptographically recorded
                </strong>

                <p>
                  This transaction is part of the
                  distributed ledger and can be
                  independently audited.
                </p>
              </div>

            </div>


            <div className="modal-actions">

              <Button
                variant="ghost"
                onClick={() =>
                  setModalOpen(false)
                }
              >
                Close
              </Button>

            </div>

          </div>

        ) : null}

      </Modal>

    </div>
  );
}

export default Transactions;