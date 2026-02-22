import { useEffect, useMemo, useState } from "react";
import PageTransition from "../../components/PageTransition";
import { API_BASE_URL, apiFetch, resolveMediaUrl } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";

const initialForm = {
  title: "About Silver Shield",
  storyContent: "",
  mission: "",
  vision: "",
  heroImage: "",
  videoUrl: "",
};

function AdminAboutPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ image: false, video: false });

  useEffect(() => {
    let mounted = true;
    apiFetch("/about", { token })
      .then((response) => {
        if (mounted) {
          setFormData((prev) => ({ ...prev, ...(response.data || {}) }));
        }
      })
      .catch((error) => pushToast(error.message || "Unable to load about content.", "error"))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [token, pushToast]);

  const heroImage = useMemo(() => resolveMediaUrl(formData.heroImage), [formData.heroImage]);
  const videoUrl = useMemo(() => resolveMediaUrl(formData.videoUrl), [formData.videoUrl]);

  const uploadFile = async (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [kind]: true }));
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      const nextUrl = resolveMediaUrl(data.url || data.relativeUrl);
      if (kind === "image") {
        setFormData((prev) => ({ ...prev, heroImage: nextUrl }));
      } else {
        setFormData((prev) => ({ ...prev, videoUrl: nextUrl }));
      }
      pushToast(`${kind === "image" ? "Image" : "Video"} uploaded successfully.`, "success");
    } catch (error) {
      pushToast(error.message || "Upload failed.", "error");
    } finally {
      setUploading((prev) => ({ ...prev, [kind]: false }));
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    showConfirm({
      title: "Update About Page?",
      message: "Save these About page changes now?",
      confirmText: "Save Changes",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: async () => {
        setSaving(true);
        try {
          const response = await apiFetch("/about", {
            method: "PUT",
            token,
            body: formData,
          });
          setFormData((prev) => ({ ...prev, ...(response.data || {}) }));
          pushToast("About page updated.", "success");
        } catch (error) {
          pushToast(error.message || "Unable to save about content.", "error");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <PageTransition className="admin-page">
        <section className="admin-section">
          <h1>About Page</h1>
          <p>Loading...</p>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="admin-page">
      <section className="admin-section">
        <h1>About Page Content</h1>
        <div className="admin-crud-layout">
          <form className="glass-card admin-form" onSubmit={onSubmit}>
            <h2>Update Story, Photo, and Video</h2>

            <input
              placeholder="Page title"
              value={formData.title || ""}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, title: event.target.value }))
              }
            />

            <textarea
              rows={7}
              placeholder="Our Story"
              value={formData.storyContent || ""}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, storyContent: event.target.value }))
              }
            />

            <textarea
              rows={3}
              placeholder="Mission"
              value={formData.mission || ""}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, mission: event.target.value }))
              }
            />

            <textarea
              rows={3}
              placeholder="Vision"
              value={formData.vision || ""}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, vision: event.target.value }))
              }
            />

            <div className="media-upload-row">
              <label>Upload Photo</label>
              <input type="file" accept="image/*" onChange={(event) => uploadFile(event, "image")} />
              {uploading.image && <small>Uploading image...</small>}
            </div>
            <input
              placeholder="Photo URL"
              value={formData.heroImage || ""}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, heroImage: event.target.value }))
              }
            />

            <div className="media-upload-row">
              <label>Upload Video</label>
              <input type="file" accept="video/*" onChange={(event) => uploadFile(event, "video")} />
              {uploading.video && <small>Uploading video...</small>}
            </div>
            <input
              placeholder="Video URL (MP4, YouTube, Vimeo, etc.)"
              value={formData.videoUrl || ""}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, videoUrl: event.target.value }))
              }
            />

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save About Page"}
            </button>
          </form>

          <div className="glass-card admin-table-wrap">
            <h2>Preview</h2>
            <div className="simple-list">
              <div className="simple-list-item">
                <strong>{formData.title || "About Silver Shield"}</strong>
                <p>{formData.storyContent || "No story content yet."}</p>
              </div>
              <div className="simple-list-item">
                <strong>Mission</strong>
                <p>{formData.mission || "-"}</p>
              </div>
              <div className="simple-list-item">
                <strong>Vision</strong>
                <p>{formData.vision || "-"}</p>
              </div>
              {heroImage && (
                <div className="simple-list-item">
                  <strong>Photo</strong>
                  <img src={heroImage} alt="About" style={{ width: "100%", borderRadius: "12px" }} />
                </div>
              )}
              {videoUrl && (
                <div className="simple-list-item">
                  <strong>Video URL</strong>
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                    {videoUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

export default AdminAboutPage;
