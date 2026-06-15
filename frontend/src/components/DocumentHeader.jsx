import LogoBrand from "./LogoBrand";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

function DocumentHeader({ variant = "standard", customContact = null }) {
  const contactInfo = customContact || {
    address: "Community Impact Centre, kandui, Kenya",
    email: "Shieldsilver105@gmail.com",
    phone: "0726 836021 / 0115 362421",
    website: "www.silvershield.org",
  };

  const titles = {
    receipt: { label: "Donation Receipt", sub: "Official Contribution Record" },
    newsletter: { label: "Shield Dispatch", sub: "Community Update" },
    invoice: { label: "Official Invoice", sub: "Service Fulfillment" },
    report: { label: "Impact Statement", sub: "Verified Outcome Report" },
    standard: { label: "Official Document", sub: "Silver Shield Organisation" }
  };

  const current = titles[variant] || titles.standard;

  return (
    <div className="flex flex-col gap-10 pb-10 border-b-2 border-brand-900 font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <LogoBrand variant="full" className="scale-110 origin-left no-underline" />
        <div className="flex flex-col md:items-end text-left md:text-right">
          <h1 className="text-4xl font-black text-brand-900 uppercase tracking-tighter m-0 leading-tight">{current.label}</h1>
          <p className="text-[10px] font-black text-accent-600 uppercase tracking-[0.3em] m-0 mt-2 leading-none">{current.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border-subtle">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-text-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> Location</span>
          <span className="text-[10px] font-bold text-text-700 uppercase leading-tight">{contactInfo.address}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-text-400 uppercase tracking-widest flex items-center gap-1"><Mail size={10}/> Email</span>
          <span className="text-[10px] font-bold text-text-700 uppercase leading-tight">{contactInfo.email}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-text-400 uppercase tracking-widest flex items-center gap-1"><Phone size={10}/> Contact</span>
          <span className="text-[10px] font-bold text-text-700 uppercase leading-tight">{contactInfo.phone}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-text-400 uppercase tracking-widest flex items-center gap-1"><Globe size={10}/> Digital</span>
          <span className="text-[10px] font-bold text-text-700 uppercase leading-tight">{contactInfo.website}</span>
        </div>
      </div>
    </div>
  );
}

export default DocumentHeader;
