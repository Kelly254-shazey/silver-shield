import { useEffect, useMemo, useState } from "react";
import PageTransition from "../../components/PageTransition";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { apiFetch, API_BASE_URL, resolveMediaUrl } from "../../app/api";
import { PROGRAM_NAV_ITEMS } from "../../app/programCatalog";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";

const numericFields = new Set(["goalAmount", "raisedAmount", "value", "trend", "orderIndex"]);
const arrayFields = new Set(["tags", "galleryImages"]);
const imageFields = new Set(["heroImage", "coverImage", "galleryImages", "logoUrl", "videoUrl"]);
const largeTextFields = new Set(["description", "content", "summary", "excerpt"]);
const dateTimeFields = new Set(["eventDate", "publishedAt"]);
const urlLikeFields = new Set([
  "reportUrl",
  "registrationUrl",
  "websiteUrl",
  "videoUrl",
  "heroImage",
  "coverImage",
  "logoUrl",
]);

const previewColumnsByEndpoint = {
  "/programs": ["title", "category", "status", "summary", "location"],
  "/events": ["title", "status", "eventDate", "location", "description"],
  "/stories": ["title", "status", "author", "category", "excerpt"],
  "/impact/stats": ["label", "metricKey", "value", "unit", "trend"],
};

const statusOptionsByEndpoint = {
  "/programs": ["active", "draft", "archived"],
  "/stories": ["published", "draft"],
  "/events": ["upcoming", "ongoing", "completed", "draft"],
};

function toInitialForm(fields) {
  return fields.reduce((acc, field) => ({ ...acc, [field]: "" }), {});
}

function toPayload(formData) {
  const payload = {};
  for (const [key, value] of Object.entries(formData)) {
    if (numericFields.has(key)) {
      payload[key] = Number(value || 0);
    } else if (arrayFields.has(key)) {
      payload[key] = String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else {
      payload[key] = value;
    }
  }
  return payload;
}

function toFieldLabel(field) {
  return String(field || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function toEntityName(title) {
  if (title === "Impact Stats") {
    return "Impact Metric";
  }
  if (title.endsWith("ies")) {
    return `${title.slice(0, -3)}y`;
  }
  if (title.endsWith("s")) {
    return title.slice(0, -1);
  }
  return title;
}

function toDateTimeInput(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  const exactMatch = text.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  if (exactMatch) {
    return `${exactMatch[1]}T${exactMatch[2]}`;
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return text;
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toDisplayValue(field, value) {
  if (value == null || value === "") {
    return "-";
  }
  if (Array.isArray(value)) {
    const joined = value.join(", ");
    return joined || "-";
  }
  if (dateTimeFields.has(field)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString();
    }
  }
  return String(value);
}

function toPreviewValue(field, value, limit = 120) {
  const text = toDisplayValue(field, value);
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, Math.max(0, limit - 3))}...`;
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function AdminEntityPage({ title, endpoint, fields }) {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(() => toInitialForm(fields));
  const [programOptions, setProgramOptions] = useState(() =>
    PROGRAM_NAV_ITEMS.map((item) => ({ slug: item.slug, title: item.title })),
  );

  const hasProgramSlugField = useMemo(() => fields.includes("programSlug"), [fields]);
  const entityName = useMemo(() => toEntityName(title), [title]);
  const statusOptions = useMemo(() => statusOptionsByEndpoint[endpoint] || null, [endpoint]);

  const load = async () => {
    const querySuffix =
      endpoint === "/programs" || endpoint === "/stories" || endpoint === "/events"
        ? "?admin=true"
        : "";
    const response = await apiFetch(`${endpoint}${querySuffix}`, { token });
    setItems(response.data || []);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    load()
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [endpoint, token, pushToast]);

  useEffect(() => {
    if (!hasProgramSlugField) {
      return;
    }

    apiFetch("/programs?admin=true", { token })
      .then((response) => {
        const remotePrograms = (response.data || [])
          .filter((item) => item?.slug)
          .map((item) => ({
            slug: item.slug,
            title: item.title || item.slug,
          }));
        const merged = [...PROGRAM_NAV_ITEMS.map((item) => ({ slug: item.slug, title: item.title })), ...remotePrograms];
        const deduped = merged.filter(
          (item, index) => merged.findIndex((entry) => entry.slug === item.slug) === index,
        );
        setProgramOptions(deduped);
      })
      .catch(() => {
        setProgramOptions(PROGRAM_NAV_ITEMS.map((item) => ({ slug: item.slug, title: item.title })));
      });
  }, [hasProgramSlugField, token]);

  const handleFileUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [field]: true }));
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToUpload,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await response.json();
      const newUrl = resolveMediaUrl(data.url || data.relativeUrl);

      if (field === "galleryImages") {
        const currentImages = String(formData[field] || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const updatedImages = [...currentImages, newUrl].join(", ");
        setFormData((prev) => ({ ...prev, [field]: updatedImages }));
        pushToast("Image added to gallery", "success");
      } else {
        setFormData((prev) => ({ ...prev, [field]: newUrl }));
        pushToast("Media uploaded", "success");
      }
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(toInitialForm(fields));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = toPayload(formData);

    if (editingId !== null) {
      showConfirm({
        title: `Update ${entityName}?`,
        message: `Save the changes you made to this ${entityName.toLowerCase()}?`,
        confirmText: "Update",
        cancelText: "Cancel",
        variant: "primary",
        onConfirm: async () => {
          try {
            await apiFetch(`${endpoint}/${editingId}`, {
              method: "PUT",
              token,
              body: payload,
            });
            pushToast(`${entityName} updated.`, "success");
            await load();
            resetForm();
          } catch (error) {
            pushToast(error.message, "error");
          }
        },
      });
      return;
    }

    try {
      await apiFetch(endpoint, {
        method: "POST",
        token,
        body: payload,
      });
      pushToast(`${entityName} created.`, "success");
      await load();
      resetForm();
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const onEdit = (item) => {
    setEditingId(Number(item.id));
    const next = {};
    for (const field of fields) {
      const value = item[field];
      if (Array.isArray(value)) {
        next[field] = value.join(", ");
      } else if (dateTimeFields.has(field)) {
        next[field] = toDateTimeInput(value);
      } else {
        next[field] = value ?? "";
      }
    }
    setFormData(next);
  };

  const onDelete = (id) => {
    showConfirm({
      title: `Delete ${entityName}?`,
      message: `This action cannot be undone. The ${entityName.toLowerCase()} will be permanently removed.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          await apiFetch(`${endpoint}/${id}`, {
            method: "DELETE",
            token,
          });
          pushToast(`${entityName} deleted.`, "success");
          await load();
          if (Number(editingId) === Number(id)) {
            resetForm();
          }
        } catch (error) {
          pushToast(error.message, "error");
        }
      },
    });
  };

  const displayColumns = useMemo(() => {
    const preferred = previewColumnsByEndpoint[endpoint] || fields;
    return preferred.filter((field) => fields.includes(field)).slice(0, 5);
  }, [endpoint, fields]);

  return (
    <PageTransition className="admin-page">
      <section className="admin-section">
        <h1>{title}</h1>
        <div className="admin-crud-layout">
          <form className="glass-card admin-form" onSubmit={onSubmit}>
            <h2>{editingId !== null ? `Edit ${entityName}` : `Add ${entityName}`}</h2>
            {fields.map((field) => {
              const isLarge = largeTextFields.has(field);
              const isImage = imageFields.has(field);
              const fieldLabel = toFieldLabel(field);
              const fieldId = `${endpoint}-${field}`.replace(/[^a-zA-Z0-9-_]/g, "");

              if (field === "programSlug") {
                return (
                  <div key={field} className="form-group">
                    <label htmlFor={fieldId}>{fieldLabel}</label>
                    <input
                      id={fieldId}
                      list={`${fieldId}-options`}
                      value={formData[field]}
                      placeholder="Select or type a program slug"
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                    />
                    <datalist id={`${fieldId}-options`}>
                      {programOptions.map((program) => (
                        <option key={program.slug} value={program.slug}>
                          {program.title}
                        </option>
                      ))}
                    </datalist>
                  </div>
                );
              }

              if (field === "status" && statusOptions) {
                return (
                  <div key={field} className="form-group">
                    <label htmlFor={fieldId}>{fieldLabel}</label>
                    <select
                      id={fieldId}
                      value={formData[field]}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                    >
                      <option value="">Select status</option>
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (isImage) {
                const isGallery = field === "galleryImages";
                const isVideo = field === "videoUrl";
                const currentUrls = String(formData[field] || "")
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);

                return (
                  <div key={field} className="form-group">
                    <label htmlFor={fieldId}>{fieldLabel}</label>
                    <div className="file-upload-wrapper">
                      <input
                        id={fieldId}
                        type="file"
                        accept={isVideo ? "video/*,image/*" : "image/*"}
                        onChange={(eventValue) => handleFileUpload(eventValue, field)}
                        disabled={uploading[field]}
                        title={`Upload ${fieldLabel}`}
                      />
                      {uploading[field] && <span className="upload-status">Uploading...</span>}
                    </div>
                    {isGallery ? (
                      <div className="image-gallery-preview">
                        {currentUrls.map((url, index) => (
                          <div key={url || index} className="image-preview-item">
                            <img src={url} alt={`Gallery ${index + 1}`} />
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() => {
                                const updated = currentUrls.filter((_, idx) => idx !== index).join(", ");
                                setFormData((prev) => ({ ...prev, [field]: updated }));
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : currentUrls.length > 0 ? (
                      <div className="image-preview-single">
                        {isVideo ? (
                          <video controls src={currentUrls[0]} style={{ width: "100%", borderRadius: "8px" }} />
                        ) : (
                          <img src={currentUrls[0]} alt={fieldLabel} />
                        )}
                        <small>{currentUrls[0]}</small>
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (isLarge) {
                return (
                  <div key={field} className="form-group">
                    <label htmlFor={fieldId}>{fieldLabel}</label>
                    <textarea
                      id={fieldId}
                      rows={4}
                      placeholder={fieldLabel}
                      value={formData[field]}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                    />
                  </div>
                );
              }

              return (
                <div key={field} className="form-group">
                  <label htmlFor={fieldId}>{fieldLabel}</label>
                  <input
                    id={fieldId}
                    type={
                      dateTimeFields.has(field)
                        ? "datetime-local"
                        : numericFields.has(field)
                          ? "number"
                          : urlLikeFields.has(field)
                            ? "url"
                            : "text"
                    }
                    step={numericFields.has(field) ? "any" : undefined}
                    placeholder={fieldLabel}
                    value={formData[field]}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
                    }
                  />
                </div>
              );
            })}
            <div className="inline-actions">
              <button className="btn btn-primary" type="submit">
                {editingId !== null ? `Update ${entityName}` : `Create ${entityName}`}
              </button>
              <button className="btn btn-outline" type="button" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>

          <div className="glass-card admin-table-wrap">
            {loading ? (
              <LoadingSkeleton className="admin-table-skeleton" />
            ) : items.length === 0 ? (
              <div className="admin-entity-empty">
                <p>No {title.toLowerCase()} found yet.</p>
                <small>Create your first {entityName.toLowerCase()} using the form.</small>
              </div>
            ) : (
              <>
                <div className="admin-mobile-list admin-entity-grid">
                  {items.map((item) => (
                    <article key={item.id} className="admin-entity-card">
                      <div className="admin-entity-head">
                        <p className="admin-entity-id">#{item.id}</p>
                        {item.status ? (
                          <span className={`status-badge status-${String(item.status).toLowerCase()}`}>
                            {item.status}
                          </span>
                        ) : null}
                      </div>

                      <div className="admin-entity-preview">
                        {displayColumns.map((column) => (
                          <p key={`${item.id}-${column}`} className="admin-entity-line" title={toDisplayValue(column, item[column])}>
                            <strong>{toFieldLabel(column)}:</strong>
                            <span>{toPreviewValue(column, item[column], 160)}</span>
                          </p>
                        ))}
                      </div>

                      <details className="admin-entity-details">
                        <summary>View full content</summary>
                        <div className="admin-entity-field-grid">
                          {fields.map((field) => {
                            const rawValue = item[field];
                            const displayValue = toDisplayValue(field, rawValue);
                            const rawText = Array.isArray(rawValue) ? rawValue.join(", ") : String(rawValue ?? "");

                            return (
                              <p key={`${item.id}-detail-${field}`} className="admin-entity-line full">
                                <strong>{toFieldLabel(field)}:</strong>
                                {isHttpUrl(rawText) ? (
                                  <a href={rawText} target="_blank" rel="noopener noreferrer">
                                    {toPreviewValue(field, rawText, 150)}
                                  </a>
                                ) : (
                                  <span>{displayValue}</span>
                                )}
                              </p>
                            );
                          })}
                        </div>
                      </details>

                      <div className="inline-actions">
                        <button type="button" className="link-btn" onClick={() => onEdit(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-btn danger"
                          onClick={() => onDelete(item.id)}
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
                        {displayColumns.map((column) => (
                          <th key={column}>{toFieldLabel(column)}</th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          {displayColumns.map((column) => (
                            <td key={`${item.id}-${column}`} title={toDisplayValue(column, item[column])}>
                              <span className="admin-cell-text">{toPreviewValue(column, item[column], 120)}</span>
                            </td>
                          ))}
                          <td>
                            <div className="admin-cell-actions">
                              <button type="button" className="link-btn" onClick={() => onEdit(item)}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="link-btn danger"
                                onClick={() => onDelete(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

export default AdminEntityPage;
