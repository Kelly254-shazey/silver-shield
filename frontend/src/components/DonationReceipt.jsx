import { Printer, X, Heart, ShieldCheck } from "lucide-react";
import DocumentHeader from "./DocumentHeader";

function DonationReceipt({
  donationId,
  donorName,
  donorEmail,
  amount,
  currency = "KES",
  method,
  date,
  programName,
  transactionId,
  status,
  onPrint,
  onClose,
}) {
  const formattedDate = date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString();
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-6 bg-brand-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-[60px] shadow-premium overflow-hidden flex flex-col relative my-auto font-body">
        
        {/* Actions Bar */}
        <div className="bg-brand-900 p-6 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-accent-500" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Digital Ledger</span>
          </div>
          <div className="flex gap-4">
            <button onClick={onPrint} className="btn glass-dark py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-white/10 hover:bg-white/10 flex items-center gap-2 border border-solid text-white cursor-pointer transition-all">
              <Printer size={16}/> Print Records
            </button>
            <button onClick={onClose} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all border-none cursor-pointer text-white">
              <X size={20}/>
            </button>
          </div>
        </div>

        <div className="p-12 lg:p-20 flex flex-col gap-12 overflow-y-auto max-h-[80vh]">
          <DocumentHeader variant="receipt" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-text-400 uppercase tracking-widest leading-none mb-1">Contributor Identification</span>
                <h3 className="text-xl font-black text-brand-900 uppercase tracking-tight m-0">{donorName}</h3>
                <p className="text-xs text-text-500 font-bold uppercase tracking-tighter m-0 mt-1">{donorEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border-subtle">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-black text-text-400 uppercase tracking-widest leading-none mb-1">Entry Date</span>
                   <span className="text-xs font-bold text-text-700 uppercase">{formattedDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-black text-text-400 uppercase tracking-widest leading-none mb-1">Payment Route</span>
                   <span className="text-xs font-bold text-text-700 uppercase">{method}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-200 p-10 rounded-[40px] border border-border-subtle flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden shadow-inner">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Heart size={60}/></div>
               <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest relative z-10 leading-none">Net Contribution</span>
               <h2 className="text-4xl font-black text-brand-900 m-0 leading-none relative z-10 tracking-tighter">{formattedAmount}</h2>
               <div className="px-3 py-1 bg-success text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm relative z-10 leading-none">
                  <ShieldCheck size={12}/> {status || "Verified"}
               </div>
            </div>

          </div>

          <div className="bg-brand-100 p-10 rounded-[40px] border border-brand-800/10 flex flex-col gap-6">
             <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-800"/>
                <h4 className="text-[10px] font-black text-brand-900 uppercase tracking-widest m-0 leading-none">Official Allocation</h4>
             </div>
             <div className="flex justify-between items-center px-1 gap-4">
                <span className="text-xs font-bold text-text-700 uppercase tracking-tight leading-tight">{programName || "General Impact Fund"}</span>
                <span className="text-[10px] font-mono text-text-400 font-bold leading-none">TX_REF: {transactionId || "INTERNAL_ALLOC"}</span>
             </div>
          </div>

          <div className="flex flex-col gap-6 pt-10 border-t border-border-subtle">
             <p className="text-xs text-text-500 font-medium leading-relaxed m-0 text-center max-w-2xl mx-auto italic">
                Silver Shield Organisation is a registered Non-Governmental Organization in Kenya. This receipt serves as an official record of your contribution to our community development initiatives.
             </p>
             <div className="flex items-center justify-center gap-2 text-[9px] font-black text-brand-400 uppercase tracking-[0.3em]">
                Authenticity Verified • SHIELD SECURE • RECORD #{donationId}
             </div>
          </div>
        </div>

        {/* Footer Accent */}
        <div className="bg-surface-200 p-8 border-t border-border-subtle flex justify-center flex-shrink-0">
           <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-black text-brand-900 uppercase tracking-widest leading-none">SILVER SHIELD</span>
              <span className="text-[9px] font-bold text-accent-600 uppercase tracking-widest m-0 leading-none">Shaping Lives</span>
           </div>
        </div>
      </div>
    </div>
  );
}

export default DonationReceipt;
