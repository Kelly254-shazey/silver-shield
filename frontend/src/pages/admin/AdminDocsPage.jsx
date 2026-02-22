import { useEffect, useState } from "react";
import PageTransition from "../../components/PageTransition";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";

function AdminDocsPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();
  const [docs, setDocs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "general",
    content: "",
    isPublished: true,
  });

  const loadDocs = async () => {
    const response = await apiFetch("/docs", { token });
    setDocs(response.data || []);
  };

  useEffect(() => {
    loadDocs().catch((error) => pushToast(error.message, "error"));
  }, [token, pushToast]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "general",
      content: "",
      isPublished: true,
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      showConfirm({
        title: "Update Document?",
        message: "Save your changes to this document and re-index it for AI responses?",
        confirmText: "Update",
        cancelText: "Cancel",
        variant: "primary",
        onConfirm: async () => {
          try {
            await apiFetch(`/docs/${editingId}`, {
              method: "PUT",
              token,
              body: formData,
            });
            pushToast("Document updated and re-indexed.", "success");
            await loadDocs();
            resetForm();
          } catch (error) {
            pushToast(error.message, "error");
          }
        },
      });
      return;
    }

    try {
      await apiFetch("/docs", {
        method: "POST",
        token,
        body: formData,
      });
      pushToast("Document created and indexed.", "success");
      await loadDocs();
      resetForm();
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const onEdit = (doc) => {
    setEditingId(doc.id);
    setFormData({
      title: doc.title || "",
      category: doc.category || "general",
      content: doc.content || "",
      isPublished: Boolean(doc.isPublished),
    });
  };

  const onDelete = async (id) => {
    showConfirm({
      title: "Delete Document?",
      message: "This action cannot be undone. The document will be permanently removed from the system.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          await apiFetch(`/docs/${id}`, {
            method: "DELETE",
            token,
          });
          pushToast("Document deleted.", "success");
          await loadDocs();
          if (editingId === id) {
            resetForm();
          }
        } catch (error) {
          pushToast(error.message, "error");
        }
      },
    });
  };

  const onReindex = async (id) => {
    try {
      await apiFetch(`/docs/${id}/reindex`, {
        method: "POST",
        token,
      });
      pushToast("Document re-indexed.", "success");
      await loadDocs();
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  return (
    <PageTransition className="admin-page">
      <section className="admin-section">
        <h1>Documentation (AI Grounding)</h1>
        <div className="admin-crud-layout">
          <form className="glass-card admin-form" onSubmit={onSubmit}>
            <h2>{editingId ? "Edit Document" : "Add Document"}</h2>
            <input
              placeholder="Title"
              value={formData.title}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <input
              placeholder="Category"
              value={formData.category}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, category: event.target.value }))
              }
            />
            <small>
              Suggested categories: <strong>newsletter</strong>, <strong>ai</strong>,{" "}
              <strong>contact</strong>, <strong>donations</strong>, <strong>about</strong>
            </small>
            <textarea
              rows={10}
              placeholder="Approved documentation content"
              value={formData.content}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, content: event.target.value }))
              }
            />
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, isPublished: event.target.checked }))
                }
              />
              Published for AI responses
            </label>
            <div className="inline-actions">
              <button className="btn btn-primary" type="submit">
                {editingId ? "Update" : "Create"}
              </button>
              <button className="btn btn-outline" type="button" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>

          <div className="glass-card admin-table-wrap">
            <div className="admin-mobile-list">
              {docs.map((doc) => (
                <article key={doc.id} className="simple-list-item">
                  <p>
                    <strong>ID:</strong> {doc.id}
                  </p>
                  <p>
                    <strong>Title:</strong> {doc.title}
                  </p>
                  <p>
                    <strong>Category:</strong> {doc.category}
                  </p>
                  <p>
                    <strong>Chunks:</strong> {doc.chunksCount || 0}
                  </p>
                  <p>
                    <strong>Published:</strong> {doc.isPublished ? "Yes" : "No"}
                  </p>
                  <div className="inline-actions">
                    <button type="button" className="link-btn" onClick={() => onEdit(doc)}>
                      Edit
                    </button>
                    <button type="button" className="link-btn" onClick={() => onReindex(doc.id)}>
                      Reindex
                    </button>
                    <button
                      type="button"
                      className="link-btn danger"
                      onClick={() => onDelete(doc.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="admin-desktop-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Chunks</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td>{doc.title}</td>
                      <td>{doc.category}</td>
                      <td>{doc.chunksCount || 0}</td>
                      <td>{doc.isPublished ? "Yes" : "No"}</td>
                      <td>
                        <button type="button" className="link-btn" onClick={() => onEdit(doc)}>
                          Edit
                        </button>
                        <button type="button" className="link-btn" onClick={() => onReindex(doc.id)}>
                          Reindex
                        </button>
                        <button
                          type="button"
                          className="link-btn danger"
                          onClick={() => onDelete(doc.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

export default AdminDocsPage;
