import { useEffect, useMemo, useState } from "react";
import PageTransition from "../../components/PageTransition";
import { apiFetch, apiUrl, resolveMediaUrl } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { Info, Image, Video, Save, Eye, Globe, Award, Zap } from "lucide-react";

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
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ image: false, video: false });

  useEffect(() => {
    let mounted = true;
    apiFetch("/about", { token })
      .then((response) => {
        if (mounted) setFormData((p) => ({ ...p, ...(response.data || {}) }));
      })
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token, pushToast]); // ✅ added pushToast for safety

  const heroImage = useMemo(() => resolveMediaUrl(formData.heroImage), [formData.heroImage]);

  const uploadFile = async (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading((p) => ({ ...p, [kind]: true }));
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch(apiUrl("/upload/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      const nextUrl = data.relativeUrl || data.url;
      setFormData((p) => ({
        ...p,
        [kind === "image" ? "heroImage" : "videoUrl"]: nextUrl,
      }));
      pushToast(`${kind.toUpperCase()} uploaded successfully.`, "success");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setUploading((p) => ({ ...p, [kind]: false }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/about", { method: "PUT", token, body: formData });
      pushToast("Global 'About' content synchronized.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <PageTransition>
        <div className="p-12">
          <LoadingSkeleton className="h-[600px] rounded-[40px]" />
        </div>
      </PageTransition>
    );

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              Brand Identity
            </span>
            <h2 className="text-3xl font-black text-slate-900 m-0 uppercase tracking-tighter leading-tight">
              Public Narrative
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            <Globe size={14} className="text-indigo-600" /> Primary landing page content
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* ── Editor Panel ── */}
          <div className="xl:col-span-7">
            <form
              className="bg-white shadow-xl border border-gray-200 rounded-2xl p-10 flex flex-col gap-10"
              onSubmit={onSubmit}
            >
              <header className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <Info size={20} />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest m-0 leading-tight">
                  Master Story Editor
                </h3>
              </header>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
                    Hero Title
                  </label>
                  <input
                    className="w-full bg-gray-100 border-none py-3.5 px-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
                    Main Narrative
                  </label>
                  <textarea
                    className="w-full bg-gray-100 border-none p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold min-h-[200px] leading-relaxed"
                    value={formData.storyContent}
                    onChange={(e) => setFormData((p) => ({ ...p, storyContent: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Award size={12} /> Mission
                    </label>
                    <textarea
                      className="w-full bg-gray-100 border-none p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold min-h-[100px]"
                      value={formData.mission}
                      onChange={(e) => setFormData((p) => ({ ...p, mission: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Zap size={12} /> Vision
                    </label>
                    <textarea
                      className="w-full bg-gray-100 border-none p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold min-h-[100px]"
                      value={formData.vision}
                      onChange={(e) => setFormData((p) => ({ ...p, vision: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
                      Background Image
                    </label>
                    <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gray-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors border-2 border-dashed border-gray-300 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                      <Image size={16} /> {uploading.image ? "Uploading..." : "Replace Image"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => uploadFile(e, "image")}
                      />
                    </label>
                    <input
                      className="w-full bg-gray-100 border-none py-2 px-4 rounded-lg text-[9px] font-mono text-gray-400"
                      value={formData.heroImage}
                      readOnly
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
                      Video Resource
                    </label>
                    <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gray-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors border-2 border-dashed border-gray-300 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                      <Video size={16} /> {uploading.video ? "Uploading..." : "Replace Video"}
                      <input
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={(e) => uploadFile(e, "video")}
                      />
                    </label>
                    <input
                      className="w-full bg-gray-100 border-none py-2 px-4 rounded-lg text-[9px] font-mono text-gray-400"
                      value={formData.videoUrl}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] px-12 py-4 rounded-2xl shadow-lg border-none cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? "Syncing..." : "Save Narrative"}
                </button>
              </div>
            </form>
          </div>

          {/* ── Preview Panel ── */}
          <div className="xl:col-span-5 h-full">
            <div className="bg-slate-900 rounded-[40px] p-1 shadow-sm overflow-hidden h-full flex flex-col min-h-[600px]">
              <div className="flex items-center gap-2 p-6 border-b border-white/5">
                <Eye size={16} className="text-indigo-400" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                  Live View Preview
                </span>
              </div>
              <div className="flex-grow bg-gray-100 rounded-[38px] overflow-y-auto p-10 flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter m-0">
                    {formData.title || "Silver Shield"}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium m-0">
                    {formData.storyContent || "No content defined."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-indigo-100 rounded-3xl border border-indigo-200">
                    <span className="text-[9px] font-black text-indigo-800 uppercase tracking-widest block mb-2">
                      Our Mission
                    </span>
                    <p className="text-xs text-gray-900 font-bold m-0 leading-tight">
                      {formData.mission || "TBA"}
                    </p>
                  </div>
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200">
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block mb-2">
                      Our Vision
                    </span>
                    <p className="text-xs text-gray-900 font-bold m-0 leading-tight">
                      {formData.vision || "TBA"}
                    </p>
                  </div>
                </div>

                {heroImage && (
                  <div className="rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                    <img
                      src={heroImage}
                      className="w-full aspect-video object-cover"
                      alt="Hero Preview"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default AdminAboutPage;