import { useEffect, useState } from "react";
import PageTransition from "../../components/PageTransition";
import { API_BASE_URL, apiFetch } from "../../app/api";
import { resolveMediaUrl } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";

const teamFormDefaults = {
  name: "",
  role: "",
  email: "",
  phone: "",
  bio: "",
  profileImage: "",
  department: "general",
  linkedinUrl: "",
  orderIndex: 0,
  status: "active",
};

const boardFormDefaults = {
  name: "",
  role: "",
  credentials: "",
  profileImage: "",
  linkedinUrl: "",
  orderIndex: 0,
  status: "active",
};

function AdminTeamPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();

  const [teamMembers, setTeamMembers] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("team");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, boardRes] = await Promise.all([
        apiFetch("/team/members/admin", { token }),
        apiFetch("/team/board/admin", { token }),
      ]);
      setTeamMembers(teamRes.data || []);
      setBoardMembers(boardRes.data || []);
    } catch (error) {
      pushToast(error.message || "Failed to load team data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData(member);
    setImagePreview(resolveMediaUrl(member.profileImage) || null);
  };

  const handleAddNew = () => {
    setEditingId("new");
    setFormData(tab === "team" ? teamFormDefaults : boardFormDefaults);
    setImagePreview(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setImagePreview(null);
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    handleCancel();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      pushToast("Image must be less than 5MB.", "error");
      return;
    }

    if (!file.type.startsWith("image/")) {
      pushToast("Please select an image file.", "error");
      return;
    }

    try {
      setUploading(true);
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const imageUrl = resolveMediaUrl(data.url || data.relativeUrl || data.data?.url);

      if (!imageUrl) {
        throw new Error("Upload returned no URL");
      }

      setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
      setImagePreview(imageUrl);
      pushToast("Image uploaded successfully.", "success");
    } catch (error) {
      pushToast(error.message || "Failed to upload image.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const isTeam = tab === "team";
    const endpoint = isTeam ? "/team/members" : "/team/board";

    if (!formData.name || !formData.role) {
      pushToast("Name and role are required.", "error");
      return;
    }
    if (isTeam && (!formData.email || !formData.bio)) {
      pushToast("Email and bio are required for team members.", "error");
      return;
    }
    if (!isTeam && !formData.credentials) {
      pushToast("Credentials are required for board members.", "error");
      return;
    }
    if (!formData.profileImage) {
      pushToast("Please upload a profile image.", "error");
      return;
    }

    const payload = {
      ...formData,
      orderIndex: Number(formData.orderIndex || 0),
    };

    try {
      if (editingId === "new") {
        await apiFetch(endpoint, { method: "POST", token, body: payload });
        pushToast(`${isTeam ? "Team member" : "Board member"} added successfully.`, "success");
      } else {
        await apiFetch(`${endpoint}/${editingId}`, {
          method: "PUT",
          token,
          body: payload,
        });
        pushToast(`${isTeam ? "Team member" : "Board member"} updated successfully.`, "success");
      }
      handleCancel();
      await fetchData();
    } catch (error) {
      pushToast(error.message || "Failed to save member.", "error");
    }
  };

  const handleDelete = (id) => {
    const isTeam = tab === "team";
    showConfirm({
      title: "Delete Member?",
      message: `Are you sure you want to delete this ${isTeam ? "team member" : "board member"}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          const endpoint = isTeam ? `/team/members/${id}` : `/team/board/${id}`;
          await apiFetch(endpoint, { method: "DELETE", token });
          pushToast("Deleted successfully.", "success");
          await fetchData();
        } catch (error) {
          pushToast(error.message || "Failed to delete member.", "error");
        }
      },
    });
  };

  const currentData = tab === "team" ? teamMembers : boardMembers;
  const isTeam = tab === "team";

  if (loading) {
    return (
      <PageTransition className="admin-page">
        <section className="admin-section">
          <h1>Team Management</h1>
          <p>Loading...</p>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="admin-page">
      <section className="admin-section">
        <header className="admin-page-header">
          <h1>Team Management</h1>
          <button className="btn btn-primary" type="button" onClick={handleAddNew}>
            Add {isTeam ? "Team Member" : "Board Member"}
          </button>
        </header>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === "team" ? "active" : ""}`}
            type="button"
            onClick={() => handleTabChange("team")}
          >
            Leadership Team ({teamMembers.length})
          </button>
          <button
            className={`admin-tab ${tab === "board" ? "active" : ""}`}
            type="button"
            onClick={() => handleTabChange("board")}
          >
            Board Members ({boardMembers.length})
          </button>
        </div>

        {editingId && (
          <div className="glass-card form-panel edit-form">
            <h3>{editingId === "new" ? "Add New" : "Edit"} {isTeam ? "Team Member" : "Board Member"}</h3>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSave();
              }}
            >
              <div className="form-section">
                <h4>Profile Photo</h4>
                <div className="image-upload-wrapper">
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                  <div className="upload-input-wrapper">
                    <input
                      type="file"
                      id="profileImageInput"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="profileImageInput" className="btn btn-secondary">
                      {uploading ? "Uploading..." : "Choose Image"}
                    </label>
                    {formData.profileImage && <p>Image selected</p>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={formData.name || ""}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Role/Position *"
                    value={formData.role || ""}
                    onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                    required
                  />

                  {isTeam ? (
                    <>
                      <input
                        type="email"
                        placeholder="Email *"
                        value={formData.email || ""}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={formData.phone || ""}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                      />
                      <select
                        value={formData.department || "general"}
                        onChange={(event) =>
                          setFormData({ ...formData, department: event.target.value })
                        }
                      >
                        <option value="general">General</option>
                        <option value="programs">Programs</option>
                        <option value="finance">Finance</option>
                        <option value="operations">Operations</option>
                        <option value="education">Education</option>
                        <option value="fundraising">Fundraising</option>
                      </select>
                      <textarea
                        placeholder="Professional Bio *"
                        value={formData.bio || ""}
                        onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
                        rows={4}
                        required
                      />
                    </>
                  ) : (
                    <textarea
                      placeholder="Professional Credentials *"
                      value={formData.credentials || ""}
                      onChange={(event) =>
                        setFormData({ ...formData, credentials: event.target.value })
                      }
                      rows={4}
                      required
                    />
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4>Additional Information</h4>
                <div className="form-grid">
                  <input
                    type="url"
                    placeholder="LinkedIn URL (optional)"
                    value={formData.linkedinUrl || ""}
                    onChange={(event) =>
                      setFormData({ ...formData, linkedinUrl: event.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Display Order"
                    value={formData.orderIndex ?? 0}
                    onChange={(event) =>
                      setFormData({ ...formData, orderIndex: Number(event.target.value) })
                    }
                  />
                  <select
                    value={formData.status || "active"}
                    onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-table-container">
          {currentData.length === 0 ? (
            <div className="empty-state">
              <p>No {isTeam ? "team members" : "board members"} found.</p>
              <p>Use the button above to add your first {isTeam ? "team member" : "board member"}.</p>
            </div>
          ) : (
            <div className="leader-admin-grid">
              {currentData.map((member) => (
                <article key={member.id} className="leader-admin-card">
                  <div className="leader-card-head">
                    <img
                      src={resolveMediaUrl(member.profileImage)}
                      alt={member.name}
                      className="leader-card-image"
                    />
                    <div>
                      <h3>{member.name}</h3>
                      <p>{member.role}</p>
                    </div>
                  </div>

                  <div className="leader-card-meta">
                    {isTeam && <p><strong>Department:</strong> {member.department || "-"}</p>}
                    {isTeam && <p><strong>Email:</strong> {member.email || "-"}</p>}
                    {!isTeam && <p><strong>Credentials:</strong> {member.credentials || "-"}</p>}
                    <p><strong>Order:</strong> {member.orderIndex}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status-badge status-${member.status}`}>{member.status}</span>
                    </p>
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-secondary"
                      type="button"
                      onClick={() => handleEdit(member)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      type="button"
                      onClick={() => handleDelete(member.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}

export default AdminTeamPage;
