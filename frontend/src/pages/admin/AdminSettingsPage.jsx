import { useEffect, useState } from "react";
import PageTransition from "../../components/PageTransition";
import { apiFetch, apiUrl } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Settings, Save, Smartphone, Globe, Mail, MapPin, Image, Upload } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton";

function AdminSettingsPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Renamed from 'saving' to 'isSaving' for clarity
  const [uploading, setUploading] = useState({ image: false });

  useEffect(() => {
    apiFetch("/settings", { token })
      .then((res) => setSettings(res.data || {}))
      .catch((err) => pushToast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [token]);
  
  const uploadHero = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading({ image: true });
      const fd = new FormData();
      fd.append("file", file);
      const response = await fetch(apiUrl("/upload/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setSettings(prev => ({ ...prev, contactHeroImage: data.relativeUrl || data.url }));
      pushToast("Contact hero updated.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setUploading({ image: false });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/settings", { method: "PUT", token, body: settings });
      pushToast("Global settings synchronized.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageTransition><div className="p-12"><LoadingSkeleton className="h-[500px] rounded-[40px]"/></div></PageTransition>;

  return (
    <PageTransition>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div className="flex flex-col gap-1 px-1">
          <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Configuration</span>
          <h2 className="text-3xl font-black text-brand-900 m-0 uppercase tracking-tighter leading-tight">Global Controls</h2>
        </div>

        <form className="card p-10 flex flex-col gap-10" onSubmit={handleSave}>
          <section className="flex flex-col gap-6">
            <h3 className="text-xs font-black text-brand-900 uppercase tracking-widest border-b border-border-subtle pb-4 flex items-center gap-2">
              <Mail size={16} /> Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Support Email</label>
                <input className="input-field" value={settings.contactEmail || ""} onChange={e => setSettings({...settings, contactEmail: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Official Phone</label>
                <input className="input-field" value={settings.contactPhone || ""} onChange={e => setSettings({...settings, contactPhone: e.target.value})} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Office Location</label>
              <input className="input-field" value={settings.officeLocation || ""} onChange={e => setSettings({...settings, officeLocation: e.target.value})} />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Contact Page Hero</label>
              <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-surface-200 rounded-xl cursor-pointer hover:bg-brand-100 transition-colors border-2 border-dashed border-border-base text-text-500 font-bold text-[10px] uppercase tracking-widest">
                <Upload size={16} /> {uploading.image ? "Uploading..." : "Replace Contact Hero"}
                <input type="file" className="hidden" accept="image/*" onChange={uploadHero} />
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="text-xs font-black text-brand-900 uppercase tracking-widest border-b border-border-subtle pb-4 flex items-center gap-2">
              <Globe size={16} /> Identity & Tagline
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Site Tagline</label>
              <input className="input-field" value={settings.tagline || ""} onChange={e => setSettings({...settings, tagline: e.target.value})} placeholder="e.g. DIGNITY • OPPORTUNITY • MOMENTUM" />
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="text-xs font-black text-brand-900 uppercase tracking-widest border-b border-border-subtle pb-4 flex items-center gap-2">
              <Smartphone size={16} /> Payment Gateways
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">M-Pesa Paybill</label>
                <input className="input-field" value={settings.mpesaPaybill || ""} onChange={e => setSettings({...settings, mpesaPaybill: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">M-Pesa Account</label>
                <input className="input-field" value={settings.mpesaAccount || ""} onChange={e => setSettings({...settings, mpesaAccount: e.target.value})} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">PayPal Email</label>
              <input className="input-field" value={settings.paypalEmail || ""} onChange={e => setSettings({...settings, paypalEmail: e.target.value})} />
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="text-xs font-black text-brand-900 uppercase tracking-widest border-b border-border-subtle pb-4 flex items-center gap-2">
              <Globe size={16} /> Social Media Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">LinkedIn URL</label>
                <input className="input-field" value={settings.linkedinUrl || ""} onChange={e => setSettings({...settings, linkedinUrl: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Twitter/X URL</label>
                <input className="input-field" value={settings.twitterUrl || ""} onChange={e => setSettings({...settings, twitterUrl: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Facebook URL</label>
                <input className="input-field" value={settings.facebookUrl || ""} onChange={e => setSettings({...settings, facebookUrl: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Website URL</label>
                <input className="input-field" value={settings.websiteUrl || ""} onChange={e => setSettings({...settings, websiteUrl: e.target.value})} placeholder="e.g. silvershield.org" />
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-border-subtle flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary px-10 py-4 flex items-center gap-2">
              <Save size={18} /> {saving ? "Saving..." : "Apply Changes"}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}

export default AdminSettingsPage;