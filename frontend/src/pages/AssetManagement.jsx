import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Table from "../components/Table";

import {
  fetchAssets,
  createAsset,
} from "../services/api";

function AssetManagement() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    name: "",
    description: "",
    category: "Digital Asset",
    owner: "",
    value: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);

      const response = await fetchAssets();

      setAssets(
        response?.data ??
        response ??
        []
      );
    } catch (err) {
      console.error("Asset loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        String(asset.name || "")
          .toLowerCase()
          .includes(query) ||
        String(asset.assetId || asset.id || "")
          .toLowerCase()
          .includes(query) ||
        String(asset.nftId || "")
          .toLowerCase()
          .includes(query) ||
        String(asset.owner || asset.ownerName || "")
          .toLowerCase()
          .includes(query);

      const status = String(
        asset.status || "ACTIVE"
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const closeCreateModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Asset name is required.");
      return;
    }

    if (!form.owner.trim()) {
      setError("Owner identity is required.");
      return;
    }

    try {
      setSubmitting(true);

      await createAsset({
        ...form,
        value: form.value
          ? Number(form.value)
          : 0,
      });

      closeCreateModal();
      await loadAssets();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create asset."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    const value = String(
      status || "ACTIVE"
    ).toLowerCase();

    if (
      value.includes("active") ||
      value.includes("verified") ||
      value.includes("secured")
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
      value.includes("blocked") ||
      value.includes("failed") ||
      value.includes("inactive")
    ) {
      return "status-danger";
    }

    return "status-neutral";
  };

  const columns = [
    {
      key: "asset",
      label: "ASSET",
      render: (_, asset) => (
        <div className="asset-cell">
          <div className="asset-icon">
            ◈
          </div>

          <div>
            <strong>
              {asset.name || "Unnamed Asset"}
            </strong>

            <span>
              {asset.assetId ||
                asset.id ||
                "ASSET-PENDING"}
            </span>
          </div>
        </div>
      ),
    },

    {
      key: "nftId",
      label: "NFT ID",
      render: (value) => (
        <span className="nft-value">
          {value || "NFT-PENDING"}
        </span>
      ),
    },

    {
      key: "owner",
      label: "CURRENT OWNER",
      render: (_, asset) => (
        <div className="owner-cell">
          <span className="owner-avatar">
            {(
              asset.ownerName ||
              asset.owner ||
              "U"
            )
              .charAt(0)
              .toUpperCase()}
          </span>

          <span>
            {asset.ownerName ||
              asset.owner ||
              "Unassigned"}
          </span>
        </div>
      ),
    },

    {
      key: "category",
      label: "CATEGORY",
      render: (value) => (
        <span>
          {value || "Digital Asset"}
        </span>
      ),
    },

    {
      key: "status",
      label: "STATUS",
      render: (value) => {
        const status = value || "ACTIVE";

        return (
          <span
            className={`status-badge ${getStatusClass(
              status
            )}`}
          >
            <span className="status-dot"></span>
            {status}
          </span>
        );
      },
    },

    {
      key: "blockchain",
      label: "BLOCKCHAIN",
      render: (_, asset) => (
        <span className="blockchain-cell">
          <span className="status-dot"></span>
          {asset.blockchainStatus ||
            "Verified"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "ACTION",
      render: (_, asset) => (
        <button
          className="table-action"
          onClick={(e) => {
            e.stopPropagation();

            navigate(
              `/assets/${
                asset.assetId ||
                asset.id ||
                asset._id
              }`
            );
          }}
        >
          View →
        </button>
      ),
    },
  ];

  const activeCount = assets.filter(
    (asset) =>
      String(asset.status || "ACTIVE")
        .toUpperCase() === "ACTIVE"
  ).length;

  const nftCount = assets.filter(
    (asset) => asset.nftId
  ).length;

  return (
    <div className="app-layout">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">

        <Navbar
          title="Asset Management"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="page-content">

          {/* HEADER */}

          <div className="page-header">

            <div>
              <div className="page-eyebrow">
                CRYPTA SHIELD / DIGITAL ASSETS
              </div>

              <h1>Asset Management</h1>

              <p>
                Register, monitor and secure
                blockchain-backed digital assets.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={openCreateModal}
            >
              + Create Asset
            </Button>

          </div>


          {/* SUMMARY */}

          <div className="asset-summary">

            <div className="asset-summary-card">
              <span>Total Assets</span>
              <strong>
                {assets.length}
              </strong>
            </div>

            <div className="asset-summary-card">
              <span>Active</span>
              <strong className="asset-success">
                {activeCount}
              </strong>
            </div>

            <div className="asset-summary-card">
              <span>NFT Linked</span>
              <strong className="asset-cyan">
                {nftCount}
              </strong>
            </div>

            <div className="asset-summary-card">
              <span>Ledger</span>
              <strong className="asset-success">
                ● Online
              </strong>
            </div>

          </div>


          {/* REGISTRY */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <span className="card-eyebrow">
                  BLOCKCHAIN REGISTRY
                </span>

                <h2>Registered Assets</h2>
              </div>

              <Button
                variant="ghost"
                size="small"
                onClick={loadAssets}
                loading={loading}
              >
                ↻ Refresh
              </Button>

            </div>


            {/* SEARCH / FILTER */}

            <div className="asset-toolbar">

              <div className="asset-search">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search asset, NFT, owner..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>


              <select
                className="asset-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>

            </div>


            <Table
              columns={columns}
              data={filteredAssets}
              loading={loading}
              emptyMessage="No blockchain assets found."
              onRowClick={(asset) =>
                navigate(
                  `/assets/${
                    asset.assetId ||
                    asset.id ||
                    asset._id
                  }`
                )
              }
            />

          </div>


          {/* SECURITY INFO */}

          <div className="asset-security-card">

            <div className="security-icon">
              ⛓
            </div>

            <div>
              <h3>
                Blockchain Asset Protection
              </h3>

              <p>
                Every registered asset is linked
                to its ownership record and NFT
                identifier for tamper-resistant
                tracking.
              </p>
            </div>

            <div className="asset-ledger-status">
              <span className="status-dot"></span>
              Ledger Synchronized
            </div>

          </div>

        </main>
      </div>


      {/* CREATE ASSET MODAL */}

      <Modal
        isOpen={modalOpen}
        onClose={closeCreateModal}
        title="Create New Asset"
        size="medium"
      >

        <form
          className="asset-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}


          <div className="form-group">

            <label>ASSET NAME</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter asset name"
            />

          </div>


          <div className="form-group">

            <label>DESCRIPTION</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the asset"
              rows="3"
            />

          </div>


          <div className="form-row">

            <div className="form-group">

              <label>CATEGORY</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="Digital Asset">
                  Digital Asset
                </option>

                <option value="Document">
                  Document
                </option>

                <option value="Certificate">
                  Certificate
                </option>

                <option value="Intellectual Property">
                  Intellectual Property
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>


            <div className="form-group">

              <label>ESTIMATED VALUE</label>

              <input
                type="number"
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />

            </div>

          </div>


          <div className="form-group">

            <label>CURRENT OWNER</label>

            <input
              type="text"
              name="owner"
              value={form.owner}
              onChange={handleChange}
              placeholder="Owner DID or identity"
            />

          </div>


          <div className="asset-generation-info">

            <div className="asset-mini-icon">
              ◈
            </div>

            <div>
              <strong>
                NFT & Asset ID
              </strong>

              <span>
                Blockchain identifiers will be
                generated after registration.
              </span>
            </div>

          </div>


          <div className="modal-actions">

            <Button
              type="button"
              variant="ghost"
              onClick={closeCreateModal}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Register Asset
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  );
}

export default AssetManagement;