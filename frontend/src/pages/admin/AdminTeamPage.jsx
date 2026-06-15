import { useEffect, useState } from "react";
import PageTransition from "../../components/PageTransition";
import { apiFetch, apiUrl, resolveMediaUrl } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";
import { Users, UserCircle, Plus, Edit2, Trash2, Mail, Briefcase, ExternalLink, X, Upload } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { motion } from "framer-motion";

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
    } catch (error) { pushToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData(member);
  };

  const handleAddNew = () => {
    setEditingId("new");
    setFormData(tab === "team" ? teamFormDefaults : boardFormDefaults);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

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
      const imageUrl = data.relativeUrl || data.url;
      setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
      pushToast("Profile synced.", "success");
    } catch (error) { pushToast(error.message, "error"); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    const isTeam = tab === "team";
    const endpoint = isTeam ? "/team/members" : "/team/board";
    const payload = { ...formData, orderIndex: Number(formData.orderIndex || 0) };

    try {
      if (editingId !== "new") {
        await apiFetch(`${endpoint}/${editingId}`, { method: "PUT", token, body: payload });
        pushToast("Member records updated.", "success");
      } else {
        await apiFetch(endpoint, { method: "POST", token, body: payload });
        pushToast("Member added to roster.", "success");
      }
      handleCancel();
      await fetchData();
    } catch (error) { pushToast(error.message, "error"); }
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
          const endpoint = isTeam ? `/team/members/${id}` : `/team/board/${id}`;
          await apiFetch(endpoint, { method: "DELETE", token });
          pushToast("Member removed.", "success");
          await fetchData();
        } catch (error) { pushToast(error.message, "error"); }
      },
    });
  };

  const currentData = tab === "team" ? teamMembers : boardMembers;
  const isTeam = tab === "team";

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Human Resources</span>
            <h2 className="text-3xl font-black text-brand-900 m-0 uppercase tracking-tighter leading-tight">People Management</h2>
          </div>
          <button 
            onClick={handleAddNew}
            className="btn btn-primary py-3.5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-none cursor-pointer shadow-lg"
          >
            <Plus size={18} /> Enroll Member
          </button>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-border-subtle shadow-sm w-fit">
          <button
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
              tab === "team" ? "bg-brand-900 text-white shadow-md" : "text-text-400 hover:text-brand-900 bg-transparent"
            }`}
            onClick={() => { setTab("team"); handleCancel(); }}
          >
            Leadership Team
          </button>
          <button
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
              tab === "board" ? "bg-brand-900 text-white shadow-md" : "text-text-400 hover:text-brand-900 bg-transparent"
            }`}
            onClick={() => { setTab("board"); handleCancel(); }}
          >
            Board of Directors
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Member List */}
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-64 rounded-[32px]" />) :
              currentData.length === 0 ? (
                <div className="md:col-span-2 p-20 text-center flex flex-col items-center gap-4 bg-white rounded-[40px] border border-border-subtle shadow-sm">
                  <Users size={48} className="text-brand-100" />
                  <h3 className="text-sm font-bold text-brand-900 uppercase">No Members Found</h3>
                </div>
              ) : currentData.map((m) => (
                <motion.article 
                  key={m.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-[32px] border border-border-subtle shadow-sm flex flex-col gap-6 relative group"
                >
                  <div className="flex items-center gap-4">
                    <img src={resolveMediaUrl(m.profileImage)} className="w-16 h-16 rounded-2xl object-cover bg-surface-200 border border-border-subtle shadow-sm" alt="" />
                    <div className="flex flex-col leading-tight min-w-0">
                      <h3 className="text-lg font-black text-brand-900 uppercase tracking-tighter m-0 truncate">{m.name}</h3>
                      <p className="text-[10px] font-bold text-accent-600 uppercase tracking-widest m-0 truncate">{m.role}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4 border-t border-border-subtle">
                    {isTeam ? (
                      <>
                        <div className="flex items-center gap-2 text-xs font-medium text-text-500 truncate"><Mail size={14} className="flex-shrink-0"/> {m.email}</div>
                        <div className="flex items-center gap-2 text-xs font-medium text-text-500 truncate"><Briefcase size={14} className="flex-shrink-0"/> {m.department}</div>
                      </>
                    ) : (
                      <p className="text-xs font-medium text-text-500 leading-relaxed italic m-0 line-clamp-2">{m.credentials}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${m.status === 'active' ? 'bg-success text-white' : 'bg-surface-300 text-text-500'}`}>
                        {m.status}
                      </span>
                      {m.linkedinUrl && <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-800 transition-colors"><ExternalLink size={16}/></a>}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(m)} className="p-2 bg-brand-100 text-brand-800 rounded-lg border-none cursor-pointer hover:bg-brand-200 transition-colors" title="Edit"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 bg-danger/10 text-danger rounded-lg border-none cursor-pointer hover:bg-danger/20 transition-colors" title="Remove"><Trash2 size={14}/></button>
                  </div>
                </motion.article>
              ))
            }
          </div>

          {/* Editor Panel */}
          {editingId && (
            <div className="xl:col-span-4 xl:sticky xl:top-24">
              <form className="bg-white p-8 rounded-[40px] border border-border-subtle shadow-sm flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="flex items-center justify-between pb-4 border-b border-border-subtle gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800 flex-shrink-0">
                      <UserCircle size={20}/>
                    </div>
                    <h3 className="text-sm font-black text-brand-900 uppercase tracking-widest m-0 leading-tight">
                      {editingId === 'new' ? "New Enrollment" : "Update Profile"}
                    </h3>
                  </div>
                  <button type="button" onClick={handleCancel} className="p-2 text-text-400 hover:text-brand-900 bg-transparent border-none cursor-pointer"><X size={20}/></button>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 items-center">
                    <div className="relative group">
                      <img 
                        src={formData.profileImage ? resolveMediaUrl(formData.profileImage) : "https://i.pravatar.cc/150?u=silver"} 
                        className="w-24 h-24 rounded-3xl object-cover bg-surface-200 border-4 border-white shadow-xl" 
                        alt="Profile Preview"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-brand-900/60 opacity-0 group-hover:opacity-100 rounded-3xl cursor-pointer transition-opacity">
                        <Upload size={24} className="text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                      </label>
                    </div>
                    <span className="text-[9px] font-black text-text-400 uppercase tracking-widest">{uploading ? "Uploading..." : "Click image to change"}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Full Name</label>
                    <input className="w-full bg-surface-200 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold" value={formData.name || ""} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Professional Role</label>
                    <input className="w-full bg-surface-200 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold" value={formData.role || ""} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))} required />
                  </div>

                  {isTeam ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Department</label>
                        <select className="w-full bg-surface-200 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold cursor-pointer" value={formData.department || "general"} onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}>
                          <option value="general">GENERAL</option>
                          <option value="programs">PROGRAMS</option>
                          <option value="finance">FINANCE</option>
                          <option value="operations">OPERATIONS</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Email Address</label>
                        <input className="w-full bg-surface-200 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold" type="email" value={formData.email || ""} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} required />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Credentials / Bio</label>
                      <textarea className="w-full bg-surface-200 border-none p-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold min-h-[100px] leading-relaxed" value={formData.credentials || ""} onChange={(e) => setFormData(p => ({ ...p, credentials: e.target.value }))} required />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">LinkedIn URL</label>
                    <input className="w-full bg-surface-200 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold" type="url" value={formData.linkedinUrl || ""} onChange={(e) => setFormData(p => ({ ...p, linkedinUrl: e.target.value }))} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border-subtle">
                  <button type="submit" className="btn btn-primary flex-grow py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg border-none cursor-pointer">
                    {editingId === 'new' ? "Confirm Enrollment" : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}

export default AdminTeamPage;
