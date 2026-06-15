import { useEffect, useState } from "react";
import { apiFetch, apiUrl } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageTransition from "../../components/PageTransition";
import { Download, DollarSign } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton";

function AdminDonationsPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    method: "",
  });

  const queryString = () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.method) params.set("method", filters.method);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const loadDonations = async () => {
    const response = await apiFetch(`/donations${queryString()}`, { token });
    setDonations(response.data || []);
  };

  useEffect(() => {
    setLoading(true);
    loadDonations()
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, [filters.status, filters.method, token]);

  const onExport = () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.method) params.set("method", filters.method);
    params.set("export", "csv");
    const url = apiUrl(`/donations?${params.toString()}`);

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `silver-shield-donations-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      })
      .catch((error) => pushToast(error.message, "error"));
  };

  const getStatusBadge = (status) => {
    const s = String(status).toUpperCase();
    const styles = {
      SUCCESS: "bg-success text-white",
      PENDING: "bg-warning text-white",
      FAILED: "bg-danger text-white",
    };
    return (
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${styles[s] || "bg-surface-300 text-text-500"}`}>
        {s}
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Finances</span>
            <h2 className="text-3xl font-black text-brand-900 m-0 uppercase tracking-tighter leading-tight">Support Ledger</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-border-subtle shadow-sm">
              <select
                className="bg-transparent border-none py-2 px-4 text-[10px] font-black uppercase tracking-widest outline-none text-text-700 cursor-pointer"
                value={filters.status}
                onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
              <div className="w-px h-4 bg-border-subtle" />
              <select
                className="bg-transparent border-none py-2 px-4 text-[10px] font-black uppercase tracking-widest outline-none text-text-700 cursor-pointer"
                value={filters.method}
                onChange={(e) => setFilters(p => ({ ...p, method: e.target.value }))}
              >
                <option value="">All Methods</option>
                <option value="MPESA">MPESA</option>
                <option value="PAYPAL">PAYPAL</option>
              </select>
            </div>

            <button 
              onClick={onExport}
              className="btn btn-secondary py-3 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-none cursor-pointer"
            >
              <Download size={16} /> Export Records
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-border-subtle shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col gap-6">
              {Array(5).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : donations.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-400">
                <DollarSign size={32} />
              </div>
              <h3 className="text-lg font-bold text-brand-900 m-0 uppercase tracking-widest">No donations found</h3>
              <p className="text-sm text-text-500 font-medium">Try adjusting your filters or checking back later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-brand-900 text-white">
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">ID</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">Contributor</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">Amount</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">Source</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">Reference</th>
                    <th className="text-right py-5 px-6 text-[10px] font-black uppercase tracking-widest">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {donations.map((dn) => (
                    <tr key={dn.id} className="hover:bg-surface-200 transition-colors">
                      <td className="py-5 px-6 text-xs font-black text-brand-800">#{dn.id}</td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-bold text-text-900">{dn.donorName}</span>
                          <span className="text-[10px] text-text-400 font-medium uppercase tracking-tighter">{dn.email}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-xs font-black text-brand-900">{dn.currency} {Number(dn.amount).toLocaleString()}</span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-[10px] font-black text-text-500 uppercase tracking-widest bg-surface-300 px-2 py-0.5 rounded-lg">{dn.method}</span>
                      </td>
                      <td className="py-5 px-6">{getStatusBadge(dn.status)}</td>
                      <td className="py-5 px-6">
                        <span className="text-[10px] font-medium text-text-500 font-mono tracking-tighter truncate max-w-[120px] block">{dn.providerReference || "N/A"}</span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="text-[10px] font-bold text-text-400 uppercase tracking-tighter">{new Date(dn.createdAt).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}

export default AdminDonationsPage;
