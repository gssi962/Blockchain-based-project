import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";

import { fetchAuditTrail } from "../services/api";

function AuditTrail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadAuditTrail();
  }, []);

  const loadAuditTrail = async () => {
    try {
      setLoading(true);

      const response = await fetchAuditTrail();

      setEvents(
        response?.data ??
        response ??
        []
      );
    } catch (error) {
      console.error(
        "Audit trail loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const query = search.toLowerCase();

      const text = [
        event.action,
        event.type,
        event.actor,
        event.user,
        event.description,
        event.assetId,
        event.assetName,
        event.txId,
        event.transactionId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const type = String(
        event.type ||
        event.eventType ||
        event.actionType ||
        ""
      ).toUpperCase();

      const matchesSearch =
        !query || text.includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [events, search, typeFilter]);

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

    const text = String(value);

    if (text.length <= start + end) {
      return text;
    }

    return `${text.slice(
      0,
      start
    )}...${text.slice(-end)}`;
  };

  const getEventType = (event) => {
    return String(
      event.type ||
      event.eventType ||
      event.actionType ||
      "SYSTEM"
    ).toUpperCase();
  };

  const getEventClass = (type) => {
    if (
      type.includes("IDENTITY") ||
      type.includes("USER")
    ) {
      return "audit-identity";
    }

    if (type.includes("ROLE")) {
      return "audit-role";
    }

    if (
      type.includes("ASSET") ||
      type.includes("CREATE")
    ) {
      return "audit-asset";
    }

    if (
      type.includes("TRANSFER") ||
      type.includes("OWNERSHIP")
    ) {
      return "audit-transfer";
    }

    if (
      type.includes("NFT") ||
      type.includes("MINT")
    ) {
      return "audit-nft";
    }

    return "audit-system";
  };

  const getEventIcon = (type) => {
    if (
      type.includes("IDENTITY") ||
      type.includes("USER")
    ) {
      return "◉";
    }

    if (type.includes("ROLE")) {
      return "◆";
    }

    if (type.includes("TRANSFER")) {
      return "⇄";
    }

    if (type.includes("NFT") ||
        type.includes("MINT")) {
      return "◇";
    }

    if (type.includes("ASSET")) {
      return "◈";
    }

    return "●";
  };

  const identityEvents = events.filter((event) => {
    const type = getEventType(event);

    return (
      type.includes("IDENTITY") ||
      type.includes("USER")
    );
  }).length;

  const assetEvents = events.filter((event) => {
    const type = getEventType(event);

    return type.includes("ASSET");
  }).length;

  const transferEvents = events.filter((event) => {
    const type = getEventType(event);

    return (
      type.includes("TRANSFER") ||
      type.includes("OWNERSHIP")
    );
  }).length;

  const openEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
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
          title="Audit Trail"
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="page-content">

          {/* HEADER */}

          <div className="page-header">

            <div>

              <div className="page-eyebrow">
                CRYPTA SHIELD / SECURITY AUDIT
              </div>

              <h1>
                Audit Trail
              </h1>

              <p>
                Track every security-sensitive
                operation recorded across the platform.
              </p>

            </div>

            <Button
              variant="secondary"
              onClick={loadAuditTrail}
              loading={loading}
            >
              ↻ Refresh Audit
            </Button>

          </div>


          {/* SUMMARY */}

          <div className="audit-summary">

            <div className="audit-summary-card">

              <div className="audit-summary-icon gold">
                ◉
              </div>

              <div>
                <span>
                  TOTAL EVENTS
                </span>

                <strong>
                  {events.length}
                </strong>
              </div>

            </div>


            <div className="audit-summary-card">

              <div className="audit-summary-icon cyan">
                ◈
              </div>

              <div>
                <span>
                  IDENTITY EVENTS
                </span>

                <strong>
                  {identityEvents}
                </strong>
              </div>

            </div>


            <div className="audit-summary-card">

              <div className="audit-summary-icon gold">
                ◆
              </div>

              <div>
                <span>
                  ASSET EVENTS
                </span>

                <strong>
                  {assetEvents}
                </strong>
              </div>

            </div>


            <div className="audit-summary-card">

              <div className="audit-summary-icon cyan">
                ⇄
              </div>

              <div>
                <span>
                  TRANSFERS
                </span>

                <strong>
                  {transferEvents}
                </strong>
              </div>

            </div>

          </div>


          {/* AUDIT CARD */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">
                  IMMUTABLE SECURITY RECORD
                </span>

                <h2>
                  System Activity
                </h2>

              </div>

              <div className="audit-integrity">
                <span className="status-dot"></span>
                INTEGRITY VERIFIED
              </div>

            </div>


            {/* FILTERS */}

            <div className="audit-toolbar">

              <div className="audit-search">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search audit events..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>


              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
              >
                <option value="ALL">
                  All Events
                </option>

                <option value="IDENTITY">
                  Identity
                </option>

                <option value="ROLE">
                  Role
                </option>

                <option value="ASSET">
                  Asset
                </option>

                <option value="NFT">
                  NFT
                </option>

                <option value="TRANSFER">
                  Transfer
                </option>
              </select>

            </div>


            {/* TIMELINE */}

            {loading ? (

              <div className="audit-loading">

                <div className="loading-spinner"></div>

                <span>
                  Loading immutable audit records...
                </span>

              </div>

            ) : filteredEvents.length === 0 ? (

              <div className="audit-empty">

                <div>
                  ◇
                </div>

                <h3>
                  No Audit Events Found
                </h3>

                <p>
                  No security events match the
                  current filters.
                </p>

              </div>

            ) : (

              <div className="audit-timeline">

                {filteredEvents.map(
                  (event, index) => {

                    const type =
                      getEventType(event);

                    const eventClass =
                      getEventClass(type);

                    return (
                      <div
                        className="audit-event"
                        key={
                          event.id ||
                          event.eventId ||
                          event.txId ||
                          index
                        }
                      >

                        <div className="audit-event-line">

                          <div
                            className={`audit-event-icon ${eventClass}`}
                          >
                            {getEventIcon(type)}
                          </div>

                        </div>


                        <div className="audit-event-body">

                          <div className="audit-event-top">

                            <div>

                              <span
                                className={`audit-type ${eventClass}`}
                              >
                                {type}
                              </span>

                              <h3>
                                {event.action ||
                                  event.title ||
                                  "Security event recorded"}
                              </h3>

                            </div>

                            <time>
                              {formatDate(
                                event.timestamp ||
                                event.createdAt
                              )}
                            </time>

                          </div>


                          <p>
                            {event.description ||
                              event.message ||
                              "A blockchain security operation was recorded."}
                          </p>


                          <div className="audit-event-meta">

                            <span>
                              <b>ACTOR</b>{" "}
                              {event.actor ||
                                event.userName ||
                                event.user ||
                                "System"}
                            </span>

                            {(event.assetId ||
                              event.assetName) && (
                              <span>
                                <b>ASSET</b>{" "}
                                {event.assetName ||
                                  event.assetId}
                              </span>
                            )}

                            {(event.txId ||
                              event.transactionId) && (
                              <span>
                                <b>TX</b>{" "}
                                {shortenHash(
                                  event.txId ||
                                  event.transactionId
                                )}
                              </span>
                            )}

                            <button
                              className="audit-details-button"
                              onClick={() =>
                                openEvent(event)
                              }
                            >
                              Details →
                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </section>


          {/* INTEGRITY CARD */}

          <div className="audit-integrity-card">

            <div className="audit-chain-icon">
              ⛓
            </div>

            <div>

              <h3>
                Tamper-Resistant Audit History
              </h3>

              <p>
                Audit events are linked to blockchain
                transactions, providing traceability
                for identity, authorization, asset and
                ownership operations.
              </p>

            </div>

            <div className="audit-chain-status">
              <span className="status-dot"></span>
              Fabric Ledger Connected
            </div>

          </div>

        </main>
      </div>


      {/* EVENT DETAILS */}

      <Modal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title="Audit Event Details"
        size="large"
      >

        {selectedEvent && (

          <div className="audit-detail">

            <div className="audit-detail-heading">

              <div
                className={`audit-detail-icon ${getEventClass(
                  getEventType(selectedEvent)
                )}`}
              >
                {getEventIcon(
                  getEventType(selectedEvent)
                )}
              </div>

              <div>

                <span className="card-eyebrow">
                  {getEventType(selectedEvent)}
                </span>

                <h2>
                  {selectedEvent.action ||
                    selectedEvent.title ||
                    "Security Event"}
                </h2>

              </div>

            </div>


            <div className="audit-detail-grid">

              <div>
                <span>EVENT ID</span>

                <strong>
                  {selectedEvent.eventId ||
                    selectedEvent.id ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>ACTOR</span>

                <strong>
                  {selectedEvent.actor ||
                    selectedEvent.userName ||
                    selectedEvent.user ||
                    "System"}
                </strong>
              </div>

              <div>
                <span>TIMESTAMP</span>

                <strong>
                  {formatDate(
                    selectedEvent.timestamp ||
                    selectedEvent.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>ASSET</span>

                <strong>
                  {selectedEvent.assetName ||
                    selectedEvent.assetId ||
                    "—"}
                </strong>
              </div>

              <div className="audit-detail-full">
                <span>TRANSACTION ID</span>

                <strong className="audit-hash">
                  {selectedEvent.txId ||
                    selectedEvent.transactionId ||
                    "—"}
                </strong>
              </div>

            </div>


            <div className="audit-description">

              <span>
                EVENT DESCRIPTION
              </span>

              <p>
                {selectedEvent.description ||
                  selectedEvent.message ||
                  "No additional description available."}
              </p>

            </div>


            <div className="audit-verified">

              <div>
                ✓
              </div>

              <section>

                <strong>
                  Audit record verified
                </strong>

                <p>
                  This event is associated with
                  the platform's blockchain-backed
                  transaction history.
                </p>

              </section>

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

        )}

      </Modal>

    </div>
  );
}

export default AuditTrail;