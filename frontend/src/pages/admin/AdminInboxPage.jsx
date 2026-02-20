import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import PageTransition from "../../components/PageTransition";
import { API_BASE_URL, apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";

const socketBaseUrl = API_BASE_URL.replace(/\/api$/, "");

function AdminInboxPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();
  const [filter, setFilter] = useState("ALL");
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  const loadList = async () => {
    const suffix = filter === "ALL" ? "" : `?status=${filter}`;
    const response = await apiFetch(`/messages${suffix}`, { token });
    setMessages(response.data || []);
  };

  const loadDetails = async (id) => {
    const response = await apiFetch(`/messages/${id}`, { token });
    setSelected(response.data);
  };

  useEffect(() => {
    let mounted = true;
    loadList()
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const socket = io(socketBaseUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
    });
    socket.emit("subscribe:admin");

    const refresh = () => {
      loadList().catch(() => undefined);
      if (selected?.id) {
        loadDetails(selected.id).catch(() => undefined);
      }
    };

    socket.on("message:new", refresh);
    socket.on("message:update", refresh);
    socket.on("message:deleted", refresh);

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [filter, token, pushToast, selected?.id]);

  const onReply = async () => {
    if (!selected?.id || !replyText.trim()) {
      return;
    }

    try {
      await apiFetch(`/messages/${selected.id}/reply`, {
        method: "POST",
        token,
        body: { replyText },
      });
      pushToast("Reply sent.", "success");
      setReplyText("");
      await loadDetails(selected.id);
      await loadList();
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const onArchive = async () => {
    if (!selected?.id) {
      return;
    }
    showConfirm({
      title: "Archive Message?",
      message: "This message will be moved to archive. You can retrieve it later if needed.",
      confirmText: "Archive",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: async () => {
        try {
          await apiFetch(`/messages/${selected.id}/archive`, {
            method: "POST",
            token,
          });
          pushToast("Message archived.", "success");
          setSelected(null);
          await loadList();
        } catch (error) {
          pushToast(error.message, "error");
        }
      },
    });
  };

  const onDelete = async () => {
    if (!selected?.id) {
      return;
    }
    showConfirm({
      title: "Delete Message?",
      message: "This action cannot be undone. The message will be permanently removed from the system.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          await apiFetch(`/messages/${selected.id}`, {
            method: "DELETE",
            token,
          });
          pushToast("Message deleted.", "success");
          setSelected(null);
          await loadList();
        } catch (error) {
          pushToast(error.message, "error");
        }
      },
    });
  };

  return (
    <PageTransition className="admin-page">
      <section className="admin-section">
        <h1>Inbox</h1>
        <div className="filter-row">
          {["ALL", "UNREAD", "READ", "ARCHIVED"].map((status) => (
            <button
              key={status}
              type="button"
              className={status === filter ? "chip-btn active" : "chip-btn"}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="admin-inbox-layout">
          <article className="glass-card inbox-list">
            {loading ? (
              <p>Loading messages...</p>
            ) : (
              <>
                <div className="inbox-mobile-list">
                  {messages.map((message) => (
                    <button
                      key={message.id}
                      type="button"
                      className={selected?.id === message.id ? "inbox-item active" : "inbox-item"}
                      onClick={() => loadDetails(message.id)}
                    >
                      <strong>{message.subject}</strong>
                      <small>
                        {message.fullName} - {message.status}
                      </small>
                    </button>
                  ))}
                </div>

                <div className="inbox-desktop-table-wrap">
                  <table className="admin-table inbox-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Sender</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((message) => (
                        <tr
                          key={message.id}
                          className={selected?.id === message.id ? "inbox-row active" : "inbox-row"}
                          onClick={() => loadDetails(message.id)}
                        >
                          <td>{message.id}</td>
                          <td>{message.subject}</td>
                          <td>{message.fullName}</td>
                          <td>{message.status}</td>
                          <td>{new Date(message.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </article>

          <article className="glass-card inbox-detail">
            {!selected ? (
              <p>Select a message to view details.</p>
            ) : (
              <>
                <h2>{selected.subject}</h2>
                <p>
                  <strong>From:</strong> {selected.fullName} ({selected.email})
                </p>
                <p>
                  <strong>Phone:</strong> {selected.phone || "Not provided"}
                </p>
                <p>{selected.message}</p>
                <hr />
                <h3>Reply</h3>
                <textarea
                  rows={5}
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Type response to sender..."
                />
                <div className="inline-actions">
                  <button className="btn btn-primary" type="button" onClick={onReply}>
                    Reply
                  </button>
                  <button className="btn btn-outline" type="button" onClick={onArchive}>
                    Archive
                  </button>
                  <button className="btn btn-outline danger" type="button" onClick={onDelete}>
                    Delete
                  </button>
                </div>
                <h3>Reply History</h3>
                <div className="simple-list">
                  {(selected.replies || []).map((reply) => (
                    <div key={reply.id} className="simple-list-item">
                      <p>{reply.replyText}</p>
                      <small>
                        {reply.adminName || "Admin"} - {new Date(reply.sentAt).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              </>
            )}
          </article>
        </div>
      </section>
    </PageTransition>
  );
}

export default AdminInboxPage;

