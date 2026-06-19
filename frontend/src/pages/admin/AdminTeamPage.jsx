import { useEffect, useState, useCallback } from "react";
import PageTransition from "../../components/PageTransition";
import { apiFetch, apiUrl, resolveMediaUrl } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";
import {
  Users, UserCircle, Plus, Edit2, Trash2, Mail,
  ExternalLink, X, Upload, Phone,
} from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { motion } from "framer-motion";

const teamFormDefaults = {
  name: "", role: "", email: "", phone: "", bio: "",
  profileImage: "", department: "general", linkedinUrl: "",
  twitterUrl: "", facebookUrl: "", instagramUrl: "", websiteUrl: "",
  orderIndex: 0, status: "active",
};

const boardFormDefaults = {
  name: "", role: "", credentials: "", bio: "",
  profileImage: "", linkedinUrl: "",
  twitterUrl: "", facebookUrl: "", instagramUrl: "", websiteUrl: "",
  orderIndex: 0, status: "active",
};

/* ── Hover-aware card image section ── */
function MemberCardPhoto({ member, isTeam, onEdit, onDelete }) {
  return (
    <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden group">
      <img
        src={resolveMediaUrl(member.profileImage)}
        alt={member.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 block"
      />
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button
          onClick={() => onEdit(member)}
          className="w-12 h-12 rounded-2xl bg-white text-slate-900 shadow-xl flex items-center justify-center border-none cursor-pointer hover:scale-110 active:scale-95 transition-all"
          title="Edit Profile"
        >
          <Edit2 size={20} />
        </button>
        <button
          onClick={() => onDelete(member.id)}
          className="w-12 h-12 rounded-2xl bg-red-600 text-white shadow-xl flex items-center justify-center border-none cursor-pointer hover:scale-110 active:scale-95 transition-all"
          title="Remove Record"
        >
          <Trash2 size={20} />
        </button>
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <span className="inline-block px-4 py-1.5 bg-indigo-50 text-[10px] font-black text-indigo-800 uppercase tracking-wide rounded-lg shadow-sm border border-indigo-200">
          {isTeam ? (member.department || "Executive") : "Director"}
        </span>
      </div>
    </div>
  );
}

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
  const [uploading, setUploading] = useState(false);

  // ✅ Extracted fetch function – stable reference, can be called anywhere
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        apiFetch("/team/members/admin", { token }),
        apiFetch("/team/board/admin", { token }),
      ]);
      if (results[0].status === "fulfilled") setTeamMembers(results[0].value.data || []);
      if (results[1].status === "fulfilled") setBoardMembers(results[1].value.data || []);
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [token, pushToast]);

  // ✅ useEffect only depends on fetchData (stable)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (member) => {
    setEditingId(Number(member.id));
    setFormData({ ...member });
  };

  const handleAddNew = () => {
    setEditingId("new");
    setFormData(tab === "team" ? { ...teamFormDefaults } : { ...boardFormDefaults });
  };

  const handleCancel = () => { setEditingId(null); setFormData({}); };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch(apiUrl("/upload/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setFormData((prev) => ({ ...prev, profileImage: data.relativeUrl || data.url }));
      pushToast("Profile image updated.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const isTeam = tab === "team";
    const endpoint = isTeam ? "/team/members" : "/team/board";
    const payload = {
      ...formData,
      orderIndex: Number(formData.orderIndex || 0),
    };

    try {
      if (editingId !== "new") {
        await apiFetch(`${endpoint}/${editingId}`, { method: "PUT", token, body: payload });
        pushToast("Member records updated.", "success");
      } else {
        await apiFetch(endpoint, { method: "POST", token, body: payload });
        pushToast("Member added to roster.", "success");
      }
      handleCancel();
      await fetchData(); // ✅ now works
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const handleDelete = (id) => {
    const isTeam = tab === "team";
    showConfirm({
      title: "Remove Member?",
      message: "This will remove the person from the official roster.",
      confirmText: "Remove",
      variant: "danger",
      onConfirm: async () => {
        try {
          await apiFetch(isTeam ? `/team/members/${id}` : `/team/board/${id}`, { method: "DELETE", token });
          pushToast("Member removed.", "success");
          await fetchData(); // ✅ now works
        } catch (error) {
          pushToast(error.message, "error");
        }
      },
    });
  };

  const currentData = tab === "team" ? teamMembers : boardMembers;
  const isTeam = tab === "team";

  const fieldClass = "w-full bg-gray-100 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold";
  const labelClass = "text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1";

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Human Resources</span>
            <h2 className="text-3xl font-black text-slate-900 m-0 uppercase tracking-tighter leading-tight">People Management</h2>
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest py-3.5 px-8 rounded-2xl shadow-lg border-none cursor-pointer transition-colors">
            <Plus size={18} /> Enroll Member
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm w-fit">
          {[["team", "Leadership Team"], ["board", "Board of Directors"]].map(([t, label]) => (
            <button key={t}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${tab === t ? "bg-slate-900 text-white shadow-md" : "text-gray-400 hover:text-slate-900 bg-transparent"}`}
              onClick={() => { setTab(t); handleCancel(); }}
            >{label}</button>
          ))}
        </div>

        {/* Layout */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* Editor Panel */}
          {editingId && (
            <div className="w-full xl:w-[420px] shrink-0 xl:sticky xl:top-24">
              <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-8 md:p-10 flex flex-col gap-8">
                <div className="flex items-center justify-between pb-6 border-b border-gray-200 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0">
                      <UserCircle size={24} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest m-0 leading-tight">
                      {editingId === "new" ? "New Enrollment" : "Update Profile"}
                    </h3>
                  </div>
                  <button type="button" onClick={handleCancel} className="p-2 text-gray-400 hover:text-slate-900 bg-transparent border-none cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                {/* Avatar upload */}
                <div className="flex flex-col gap-3 items-center">
                  <div className="relative inline-block group">
                    <img
                      src={formData.profileImage ? resolveMediaUrl(formData.profileImage) : "https://i.pravatar.cc/150?u=silver"}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl bg-gray-100"
                      alt="Profile Preview"
                    />
                    <label className="absolute inset-0 rounded-3xl flex items-center justify-center bg-slate-900/60 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={24} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                    </label>
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {uploading ? "Uploading…" : "Click image to change"}
                  </span>
                </div>

                {/* Form fields (unchanged) */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Full Name</label>
                    <input className={fieldClass} value={formData.name || ""} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required placeholder="e.g. Dr. Sarah Johnson" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Official Role</label>
                    <input className={fieldClass} value={formData.role || ""} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))} required placeholder="e.g. Executive Director" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Email</label>
                      <input className={fieldClass} type="email" value={formData.email || ""} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="sarah@example.com" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Phone</label>
                      <input className={fieldClass} value={formData.phone || ""} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="07XXXXXXXX" />
                    </div>
                  </div>
                  {isTeam ? (
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Department</label>
                      <input className={fieldClass} value={formData.department || ""} onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))} placeholder="e.g. Leadership, Finance, Operations" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Board Credentials</label>
                      <textarea className={`${fieldClass} min-h-[80px] resize-none p-4`} value={formData.credentials || ""} onChange={(e) => setFormData((p) => ({ ...p, credentials: e.target.value }))} placeholder="e.g. MBA, PhD - University of Nairobi" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Biography</label>
                    <textarea className={`${fieldClass} min-h-[120px] resize-none p-4 leading-relaxed`} value={formData.bio || ""} onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))} placeholder="Professional background and expertise…" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>LinkedIn Profile</label>
                    <input className={fieldClass} value={formData.linkedinUrl || ""} onChange={(e) => setFormData((p) => ({ ...p, linkedinUrl: e.target.value }))} placeholder="https://linkedin.com/in/…" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Twitter (X) URL</label>
                      <input className={fieldClass} value={formData.twitterUrl || ""} onChange={(e) => setFormData((p) => ({ ...p, twitterUrl: e.target.value }))} placeholder="https://x.com/…" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Facebook URL</label>
                      <input className={fieldClass} value={formData.facebookUrl || ""} onChange={(e) => setFormData((p) => ({ ...p, facebookUrl: e.target.value }))} placeholder="https://facebook.com/…" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Instagram URL</label>
                    <input className={fieldClass} value={formData.instagramUrl || ""} onChange={(e) => setFormData((p) => ({ ...p, instagramUrl: e.target.value }))} placeholder="https://instagram.com/…" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Display Order</label>
                      <input className={fieldClass} type="number" value={formData.orderIndex ?? 0} onChange={(e) => setFormData((p) => ({ ...p, orderIndex: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Status</label>
                      <select className={`${fieldClass} cursor-pointer`} value={formData.status || "active"} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}>
                        <option value="active">ACTIVE</option>
                        <option value="inactive">INACTIVE</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest py-4 mt-4 rounded-2xl shadow-lg border-none cursor-pointer transition-colors">
                    {editingId === "new" ? "Confirm Enrollment" : "Update Records"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="flex-grow min-w-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-[480px] rounded-3xl" />)
            ) : currentData.length === 0 ? (
              <div className="md:col-span-2 p-20 text-center flex flex-col items-center gap-4 bg-white rounded-[40px] border border-gray-200 shadow-sm">
                <Users size={48} className="text-indigo-100" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">No Members Found</h3>
                <p className="text-xs text-gray-400 font-medium">Add the first member to your official roster.</p>
              </div>
            ) : currentData.map((m) => (
              <motion.article key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col transition-all hover:border-indigo-300"
                style={{ minWidth: 0 }}
              >
                <MemberCardPhoto member={m} isTeam={isTeam} onEdit={handleEdit} onDelete={handleDelete} />
                <div className="p-10 flex flex-col flex-grow" style={{ minWidth: 0 }}>
                  <div className="mb-4" style={{ minWidth: 0 }}>
                    <h3 className="text-xl font-black text-slate-900 m-0 uppercase tracking-tighter leading-tight truncate">{m.name}</h3>
                    <div className="flex items-center gap-2 mt-1" style={{ minWidth: 0 }}>
                      <div className="h-0.5 w-6 shrink-0 bg-indigo-500 rounded-full" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{m.role}</span>
                    </div>
                  </div>
                  {m.bio && <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-3 mb-4">{m.bio}</p>}
                  <div className="mt-auto pt-6 border-t border-gray-200 flex flex-col gap-3" style={{ minWidth: 0 }}>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-tight" style={{ minWidth: 0 }}>
                      <Mail size={12} className="text-indigo-600 shrink-0" />
                      <span className="truncate lowercase">{m.email || "Contact unset"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 gap-3 flex-wrap">
                      <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0 ${m.status === "active" ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"}`}>{m.status}</span>
                      <div className="flex items-center gap-3">
                        {m.linkedinUrl && <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 opacity-60 hover:text-slate-900 transition-all" title="LinkedIn"><ExternalLink size={14} /></a>}
                        {m.twitterUrl && <a href={m.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 opacity-60 hover:text-slate-900 transition-all" title="Twitter/X"><ExternalLink size={14} /></a>}
                        {m.facebookUrl && <a href={m.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 opacity-60 hover:text-slate-900 transition-all" title="Facebook"><ExternalLink size={14} /></a>}
                        {m.instagramUrl && <a href={m.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 opacity-60 hover:text-slate-900 transition-all" title="Instagram"><ExternalLink size={14} /></a>}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default AdminTeamPage;