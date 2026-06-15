import { useEffect, useState } from "react";
import PageTransition from "../../components/PageTransition";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";
import { FileText, Edit2, Trash2, RefreshCw, CheckCircle2, XCircle, Globe, Info } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton";

function AdminDocsPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    loadDocs()
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, [token]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", category: "general", content: "", isPublished: true });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      showConfirm({
        title: "Update Document?",
        message: "Synchronize these changes with the AI knowledge base?",
        confirmText: "Update",
        onConfirm: async () => {
          try {
            await apiFetch(`/docs/${editingId}`, { method: "PUT", token, body: formData });
            pushToast("Knowledge base updated.", "success");
            await loadDocs();
            resetForm();
          } catch (error) { pushToast(error.message, "error"); }
        },
      });
      return;
    }

    try {
      await apiFetch("/docs", { method: "POST", token, body: formData });
      pushToast("New documentation indexed.", "success");
      await loadDocs();
      resetForm();
    } catch (error) { pushToast(error.message, "error"); }
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
      title: "Remove Documentation?",
      message: "This will permanently delete the resource from the AI engine.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await apiFetch(`/docs/${id}`, { method: "DELETE", token });
          pushToast("Document purged.", "success");
          await loadDocs();
          if (editingId === id) resetForm();
        } catch (error) { pushToast(error.message, "error"); }
      },
    });
  };

  const onReindex = async (id) => {
    try {
      await apiFetch(`/docs/${id}/reindex`, { method: "POST", token });
      pushToast("Forced re-indexing complete.", "success");
      await loadDocs();
    } catch (error) { pushToast(error.message, "error"); }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Intelligence</span>
            <h2 className="text-3xl font-black text-brand-900 m-0 uppercase tracking-tighter leading-tight">AI Knowledge Base</h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-text-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-border-subtle shadow-sm">
            <Info size={14} className="text-brand-600" /> Assistant grounding data
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Form Panel */}
          <div className="xl:col-span-5 xl:sticky xl:top-24">
            <form className="bg-white p-8 rounded-[32px] border border-border-subtle shadow-sm flex flex-col gap-6" onSubmit={onSubmit}>
              <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800">
                  <FileText size={20}/>
                </div>
                <h2 className="text-sm font-black text-brand-900 uppercase tracking-widest m-0 leading-tight">
                  {editingId ? "Modify Resource" : "Index New Resource"}
                </h2>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Document Title</label>
                  <input
                    className="w-full bg-surface-200 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold"
                    placeholder="e.g. Donation Policy 2024"
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Context Category</label>
                  <input
                    className="w-full bg-surface-200 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold"
                    placeholder="e.g. donations, programs, faq"
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    required
                  />
                  <p className="text-[10px] text-text-400 font-bold uppercase tracking-tighter mt-1 px-1 m-0">
                    Internal use: newsletter, ai, contact, donations, about
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Source Content (Markdown)</label>
                  <textarea
                    className="w-full bg-surface-200 border-none p-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold min-h-[240px] leading-relaxed"
                    placeholder="Paste official documentation content here..."
                    value={formData.content}
                    onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                    required
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group px-1">
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.isPublished ? 'bg-success' : 'bg-surface-300'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPublished ? 'translate-x-4' : ''}`} />
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(p => ({ ...p, isPublished: e.target.checked }))}
                  />
                  <span className="text-[10px] font-black text-text-700 uppercase tracking-widest">Active for AI responses</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-border-subtle">
                <button type="submit" className="btn btn-primary flex-grow py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg border-none cursor-pointer">
                  {editingId ? "Update Index" : "Confirm & Index"}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 border-none cursor-pointer">
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Table Panel */}
          <div className="xl:col-span-7">
            <div className="bg-white rounded-[40px] border border-border-subtle shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 flex flex-col gap-6">
                  {Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-16 rounded-2xl" />)}
                </div>
              ) : docs.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-400">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-brand-900 m-0 uppercase tracking-widest">Knowledge base empty</h3>
                  <p className="text-sm text-text-500 font-medium m-0">Add source materials to power the assistant.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-brand-900 text-white">
                        <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">ID</th>
                        <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">Resource</th>
                        <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                        <th className="text-right py-5 px-6 text-[10px] font-black uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {docs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-surface-200 transition-colors group">
                          <td className="py-5 px-6 text-xs font-black text-brand-800">#{doc.id}</td>
                          <td className="py-5 px-6">
                            <div className="flex flex-col leading-tight">
                              <span className="text-xs font-bold text-text-900">{doc.title}</span>
                              <span className="text-[9px] text-text-400 font-black uppercase tracking-widest mt-1">
                                {doc.category} • {doc.chunksCount || 0} Chunks
                              </span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            {doc.isPublished ? (
                              <span className="flex items-center gap-1.5 text-[9px] font-black text-success uppercase tracking-widest">
                                <CheckCircle2 size={12} /> Training
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[9px] font-black text-text-400 uppercase tracking-widest">
                                <XCircle size={12} /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => onEdit(doc)}
                                className="p-2 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => onReindex(doc.id)}
                                className="p-2 text-accent-600 hover:bg-accent-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                title="Re-index"
                              >
                                <RefreshCw size={16} />
                              </button>
                              <button 
                                onClick={() => onDelete(doc.id)}
                                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
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
          </div>

        </div>
      </div>
    </PageTransition>
  );
}

export default AdminDocsPage;
