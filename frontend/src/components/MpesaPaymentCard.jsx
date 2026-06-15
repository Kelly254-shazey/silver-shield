import { useEffect, useState } from "react";
import { Smartphone, Copy, Check, ShieldCheck, Zap } from "lucide-react";
import { apiFetch } from "../app/api";

const fallbackDetails = {
  paybill: "522522",
  accountNumber: "1342183193",
};

function MpesaPaymentCard() {
  const [mpesaDetails, setMpesaDetails] = useState(fallbackDetails);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    apiFetch("/donations/mpesa/details")
      .then(res => setMpesaDetails(res?.data || fallbackDetails))
      .finally(() => setLoading(false));
  }, []);

  const copy = async (val, field) => {
    await navigator.clipboard.writeText(val);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="card p-10 animate-pulse h-64" />;

  return (
    <div className="card p-10 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center shadow-lg">
          <Smartphone size={24} />
        </div>
        <div>
          <h3 className="text-sm font-black text-brand-900 uppercase tracking-widest m-0 leading-tight">M-Pesa Express</h3>
          <p className="text-[10px] font-bold text-text-400 uppercase m-0 mt-1">Manual Deployment</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 p-5 bg-surface-200 rounded-2xl border border-transparent hover:border-brand-800/10 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-text-400 uppercase tracking-widest">Business No</span>
            <span className="text-lg font-black text-brand-900 font-mono tracking-tighter leading-none">{mpesaDetails.paybill}</span>
          </div>
          <button onClick={() => copy(mpesaDetails.paybill, 'pb')} className="p-3 bg-white rounded-xl text-brand-800 shadow-sm hover:bg-brand-900 hover:text-white transition-all border-none cursor-pointer">
            {copied === 'pb' ? <Check size={16}/> : <Copy size={16}/>}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 p-5 bg-surface-200 rounded-2xl border border-transparent hover:border-brand-800/10 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-text-400 uppercase tracking-widest">Account ID</span>
            <span className="text-lg font-black text-brand-900 font-mono tracking-tighter leading-none">{mpesaDetails.accountNumber}</span>
          </div>
          <button onClick={() => copy(mpesaDetails.accountNumber, 'acc')} className="p-3 bg-white rounded-xl text-brand-800 shadow-sm hover:bg-brand-900 hover:text-white transition-all border-none cursor-pointer">
            {copied === 'acc' ? <Check size={16}/> : <Copy size={16}/>}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-6 bg-brand-100 rounded-[28px] border border-brand-800/5">
        <h4 className="text-[10px] font-black text-brand-800 uppercase tracking-widest m-0 flex items-center gap-2">
          <Zap size={14} className="text-accent-600"/> Quick Path
        </h4>
        <ol className="m-0 p-0 pl-4 space-y-1">
          <li className="text-[10px] font-bold text-text-700">Dial *334# or use M-Pesa App</li>
          <li className="text-[10px] font-bold text-text-700">Enter Paybill: {mpesaDetails.paybill}</li>
          <li className="text-[10px] font-bold text-text-700">Account: {mpesaDetails.accountNumber}</li>
        </ol>
      </div>

      <div className="flex items-center justify-center gap-2 text-text-400">
        <ShieldCheck size={14} className="text-success" />
        <span className="text-[9px] font-bold uppercase tracking-widest">GSMA Certified Gateway</span>
      </div>
    </div>
  );
}

export default MpesaPaymentCard;
