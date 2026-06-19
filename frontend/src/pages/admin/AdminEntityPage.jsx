import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  Plus, Edit2, Trash2, Upload, X, Globe, Image, RotateCcw, ExternalLink
} from "lucide-react";
import PageTransition from "../../components/PageTransition";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PaginationControls from "../../components/PaginationControls";
import { apiFetch, apiUrl, resolveMediaUrl } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";

// ── Constants (unchanged) ──
const numericFields = new Set(["parentId", "goalAmount", "raisedAmount", "value", "trend", "orderIndex"]);
const arrayFields = new Set(["tags", "galleryImages"]);
const imageFields = new Set(["heroImage", "coverImage", "galleryImages", "logoUrl", "videoUrl", "image", "photo", "avatar", "profileImage", "picture", "thumbnail"]);
const largeTextFields = new Set(["description", "content", "summary", "excerpt", "bio", "details", "message", "notes"]);
const dateTimeFields = new Set(["eventDate", "publishedAt"]);
const previewColumnsByEndpoint = {
  "/programs": ["title", "category", "status", "summary"],
  "/sub-programs": ["title", "parentId", "status", "summary"],
  "/blog": ["title", "status", "author", "category"],
  "/events": ["title", "status", "eventDate", "location"],
  "/stories": ["title", "status", "author", "category"],
  "/partners": ["name", "websiteUrl", "orderIndex"],
  "/volunteers": ["fullName", "email", "location", "availability"],
  "/impact/stats": ["metricKey", "label", "value", "orderIndex"],
  "/team": ["fullName", "role", "email", "orderIndex"],
};

const statusOptionsByEndpoint = {
  "/programs": ["active", "draft", "archived"],
  "/sub-programs": ["active", "draft", "archived"],
  "/blog": ["published", "draft"],
  "/stories": ["published", "draft"],
  "/events": ["upcoming", "ongoing", "completed", "draft"],
  "/volunteers": ["new", "reviewed", "contacted", "archived"],
  "/partners": ["active", "hidden"],
};

// ── Pure helpers (unchanged) ──
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
  if (title.endsWith("ies")) return `${title.slice(0, -3)}y`;
  if (title.endsWith("s")) return title.slice(0, -1);
  return title;
}

function toDateTimeInput(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  try {
    return parsed.toISOString().slice(0, 16);
  } catch {
    return text;
  }
}

function toDisplayValue(field, value) {
  if (value == null || value === "") return "-";
  if (Array.isArray(value)) return value.join(", ") || "-";
  if (dateTimeFields.has(field)) {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString() : String(value);
  }
  return String(value);
}

// ── Main component ──
function AdminEntityPage({ title, endpoint, fields }) {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();
  const formRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(() => toInitialForm(fields));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState(fields[0] || "id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const entityName = useMemo(() => toEntityName(title), [title]);
  const statusOptions = useMemo(() => statusOptionsByEndpoint[endpoint] || null, [endpoint]);

  // ✅ Memoized load function — avoids stale closures
  const load = useCallback(async () => {
    const querySuffix = ["/programs", "/sub-programs", "/blog", "/stories", "/events", "/volunteers", "/impact/stats", "/partners"].includes(endpoint) ? "?admin=true" : "";
    const response = await apiFetch(`${endpoint}${querySuffix}`, { token });
    // Adjust this if your API wraps data differently (e.g., response.data || response.result)
    setItems(response.data || response || []);
  }, [endpoint, token]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    load()
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [load, pushToast]);

  // ── File upload handlers (unchanged logic) ──
  const handleFileUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading((prev) => ({ ...prev, [field]: true }));
      const fd = new FormData();
      fd.append("file", file);
      const response = await fetch(apiUrl("/upload/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      const newUrl = data.relativeUrl || data.url;
      if (field === "galleryImages") {
        const current = String(formData[field] || "").split(",").map(i => i.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, [field]: [...current, newUrl].join(", ") }));
      } else {
        setFormData(prev => ({ ...prev, [field]: newUrl }));
      }
      pushToast("Media uploaded successfully", "success");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleInlineImageUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const uploadKey = `inline_${field}`;
    try {
      setUploading((prev) => ({ ...prev, [uploadKey]: true }));
      const fd = new FormData();
      fd.append("file", file);
      const response = await fetch(apiUrl("/upload/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      const newUrl = data.relativeUrl || data.url;
      
      const imgTag = `\n<img src="${resolveMediaUrl(newUrl)}" alt="Embedded Image" class="w-full rounded-3xl my-8 object-cover shadow-sm" />\n`;
      
      setFormData(prev => ({ 
        ...prev, 
        [field]: (prev[field] || "") + imgTag 
      }));
      pushToast("Image snippet inserted into content area.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  // ── CRUD operations ──
  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = toPayload(formData);
    try {
      if (editingId !== null) {
        await apiFetch(`${endpoint}/${editingId}`, { method: "PUT", token, body: payload });
        pushToast(`${entityName} updated.`, "success");
      } else {
        await apiFetch(endpoint, { method: "POST", token, body: payload });
        pushToast(`${entityName} created.`, "success");
      }
      await load();
      resetForm();
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(toInitialForm(fields));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortField(fields[0] || "id");
    setSortDirection("asc");
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(toInitialForm(fields));
  };

  const onEdit = (item) => {
    setEditingId(Number(item.id));
    const next = {};
    for (const field of fields) {
      const val = item[field];
      next[field] = Array.isArray(val) ? val.join(", ") : dateTimeFields.has(field) ? toDateTimeInput(val) : (val ?? "");
    }
    setFormData(next);
  };

  const onDelete = (id) => {
    showConfirm({
      title: `Delete ${entityName}?`,
      message: `This action will permanently remove this ${entityName.toLowerCase()}.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await apiFetch(`${endpoint}/${id}`, { method: "DELETE", token });
          pushToast(`${entityName} deleted.`, "success");
          await load();
          if (editingId === id) { setEditingId(null); setFormData(toInitialForm(fields)); }
        } catch (error) { pushToast(error.message, "error"); }
      },
    });
  };

  // ── Derived state ──
  const displayColumns = useMemo(() => {
    const preferred = previewColumnsByEndpoint[endpoint] || fields;
    return preferred.filter((f) => fields.includes(f)).slice(0, 4);
  }, [endpoint, fields]);

  useEffect(() => {
    setSortField(fields[0] || "id");
    setStatusFilter("all");
    setSearchTerm("");
    setPage(1);
  }, [endpoint, fields]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const next = items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : String(item.status || "").toLowerCase() === statusFilter;
      const haystack = fields
        .map((field) => toDisplayValue(field, item[field]))
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });

    return [...next].sort((a, b) => {
      const aValue = numericFields.has(sortField)
        ? Number(a[sortField] || 0)
        : String(toDisplayValue(sortField, a[sortField])).toLowerCase();
      const bValue = numericFields.has(sortField)
        ? Number(b[sortField] || 0)
        : String(toDisplayValue(sortField, b[sortField])).toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [fields, items, searchTerm, sortDirection, sortField, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sortField, sortDirection, pageSize]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // ── Render ──
  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
              Management
            </span>
            <h2 className="text-2xl font-black text-slate-900 m-0 uppercase tracking-tight leading-tight">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hidden sm:block">
              {filteredItems.length} Entries
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-3 px-8 rounded-xl shadow-lg border-none cursor-pointer transition-colors"
            >
              <Plus size={18} /> New {entityName}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
          <input
            className="bg-gray-50 border border-gray-200 py-3 px-5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 flex-grow min-w-[240px] text-sm font-semibold"
            type="search"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label={`Search ${title}`}
          />
          {fields.includes("status") && (
            <select
              className="bg-gray-50 border border-gray-200 py-3 px-5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-700 cursor-pointer"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label={`Filter ${title} by status`}
            >
              <option value="all">All statuses</option>
              {(statusOptions || [...new Set(items.map((item) => item.status).filter(Boolean))]).map((status) => (
                <option key={status} value={String(status).toLowerCase()}>
                  {String(status).toUpperCase()}
                </option>
              ))}
            </select>
          )}
          <select
            className="bg-gray-50 border border-gray-200 py-3 px-5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-700 cursor-pointer"
            value={sortField}
            onChange={(event) => setSortField(event.target.value)}
            aria-label={`Sort ${title} by field`}
          >
            {fields.map((field) => (
              <option key={field} value={field}>
                {toFieldLabel(field)}
              </option>
            ))}
          </select>
          <select
            className="bg-gray-50 border border-gray-200 py-3 px-5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-700 cursor-pointer"
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value)}
            aria-label={`Sort ${title} direction`}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <button 
            onClick={resetFilters}
            className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-slate-900 transition-colors shadow-sm"
            title="Reset Filters"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Content: Form + Table */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Form Panel */}
          <div ref={formRef} className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-24">
            <form className="flex flex-col bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden max-h-[calc(100vh-120px)]" onSubmit={onSubmit}>
              <header className="flex items-center gap-4 p-8 border-b border-gray-200 bg-gray-50">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  {editingId !== null ? <Edit2 size={20}/> : <Plus size={20}/>}
                </div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest m-0">
                  {editingId !== null ? `Modify ${entityName}` : `New ${entityName}`}
                </h2>
              </header>

              <div className="flex flex-col gap-6 p-8 overflow-y-auto">
                {fields.map((field) => {
                  const label = toFieldLabel(field);
                  const isLarge = largeTextFields.has(field);
                  const isImage = imageFields.has(field);

                  return (
                    <div key={field} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{label}</label>
                        {isLarge && (
                          <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
                            <Image size={12} />
                            {uploading[`inline_${field}`] ? "Uploading..." : "Insert Image"}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleInlineImageUpload(e, field)}
                              disabled={uploading[`inline_${field}`]}
                            />
                          </label>
                        )}
                      </div>
                      
                      {field === "status" && statusOptions ? (
                        <select 
                          className="w-full bg-gray-100 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                          value={formData[field]}
                          onChange={(e) => setFormData(p => ({ ...p, [field]: e.target.value }))}
                        >
                          <option value="">Select Status</option>
                          {statusOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                        </select>
                      ) : isImage ? (
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gray-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors border-2 border-dashed border-gray-300 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                            <Upload size={16} /> {uploading[field] ? "Uploading..." : "Select File"}
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, field)} disabled={uploading[field]} />
                          </label>
                          {formData[field] && (
                            <div className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 aspect-video">
                              <img src={resolveMediaUrl(String(formData[field]).split(',')[0])} className="w-full h-32 object-cover" alt="Preview" />
                              <button 
                                type="button" 
                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                                onClick={() => setFormData(p => ({ ...p, [field]: "" }))}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : isLarge ? (
                        <textarea 
                          className="w-full bg-gray-100 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold min-h-[200px] leading-relaxed"
                          value={formData[field]}
                          onChange={(e) => setFormData(p => ({ ...p, [field]: e.target.value }))}
                          placeholder={`Compose ${label.toLowerCase()} content...`}
                        />
                      ) : (
                        <input 
                          type={dateTimeFields.has(field) ? "datetime-local" : numericFields.has(field) ? "number" : "text"}
                          className="w-full bg-gray-100 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                          value={formData[field]}
                          onChange={(e) => setFormData(p => ({ ...p, [field]: e.target.value }))}
                          placeholder={`Enter ${label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4 p-8 border-t border-gray-200 bg-white">
                <button type="submit" className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-lg border-none cursor-pointer transition-colors">
                  {editingId !== null ? "Save Changes" : "Confirm Entry"}
                </button>
                {editingId !== null && (
                  <button 
                    type="button" 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-2xl border-none cursor-pointer transition-colors"
                    onClick={() => { setEditingId(null); setFormData(toInitialForm(fields)); }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Panel */}
          <div className="flex-grow min-w-0 flex flex-col gap-6">
            <div className="bg-white rounded-[40px] border border-gray-200 shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-12 flex flex-col gap-6">
                  {Array(5).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-16 rounded-2xl" />)}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-400">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 m-0">No entries found</h3>
                  <p className="text-sm text-gray-500 font-medium">Get started by adding your first {entityName.toLowerCase()}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">ID</th>
                        {displayColumns.map(col => (
                          <th key={col} className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">{toFieldLabel(col)}</th>
                        ))}
                        <th className="text-right py-5 px-6 text-[10px] font-black uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pagedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors group">
                          <td className="py-6 px-8 text-xs font-black text-slate-800">#{item.id}</td>
                          {displayColumns.map(col => (
                            <td key={col} className="py-6 px-8">
                              <div className="flex flex-col max-w-[240px]">
                                <span className="text-xs font-bold text-gray-900 truncate">
                                  {toDisplayValue(col, item[col])}
                                </span>
                              </div>
                            </td>
                          ))}
                          <td className="py-5 px-6">
                            <div className="flex justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.slug && (
                                <a 
                                  href={`${endpoint.replace('/admin', '')}/${item.slug}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2.5 text-gray-400 hover:text-slate-900 transition-colors"
                                  title="View Public Link"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                              <button 
                                onClick={() => onEdit(item)}
                                className="p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => onDelete(item.id)}
                                className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {!loading && filteredItems.length > 0 && (
              <PaginationControls
                page={page}
                pageSize={pageSize}
                totalItems={filteredItems.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                label={title.toLowerCase()}
              />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default AdminEntityPage;