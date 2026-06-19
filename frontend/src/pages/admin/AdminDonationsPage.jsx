import { useEffect, useState, useCallback } from "react";
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

  const queryString = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.method) params.set("method", filters.method);
    return params.toString() ? `?${params.toString()}` : "";
  }, [filters.status, filters.method]);

  const loadDonations = useCallback(async () => {
    const response = await apiFetch(`/donations${queryString()}`, { token });
    setDonations(response.data || []);
  }, [queryString, token]);

  useEffect(() => {
    setLoading(true);
    loadDonations()
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, [loadDonations, pushToast]);

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
      SUCCESS: "bg-green-600 text-white",
      PENDING: "bg-amber-500 text-white",
      FAILED: "bg-red-600 text-white",
    };
    return (
      <span
        className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
          styles[s] || "bg-gray-300 text-gray-500"
        }`}
      >
        {s}
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
              Finances
            </span>
            <h2 className="text-2xl font-black text-slate-900 m-0 uppercase tracking-tight leading-tight">
              Support Ledger
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <select
                className="bg-transparent border-none py-2 px-4 text-xs font-black uppercase tracking-widest outline-none text-gray-700 cursor-pointer"
                value={filters.status}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
              <div className="w-px h-4 bg-gray-200" />
              <select
                className="bg-transparent border-none py-2 px-4 text-xs font-black uppercase tracking-widest outline-none text-gray-700 cursor-pointer"
                value={filters.method}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, method: e.target.value }))
                }
              >
                <option value="">All Methods</option>
                <option value="MPESA">MPESA</option>
                <option value="PAYPAL">PAYPAL</option>
              </select>
            </div>

            <button
              onClick={onExport}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl shadow-sm border-none cursor-pointer transition-colors"
            >
              <Download size={16} /> Export Records
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col gap-6">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <LoadingSkeleton key={i} className="h-16 rounded-xl" />
                ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-400">
                <DollarSign size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 m-0 uppercase tracking-widest">
                No donations found
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Try adjusting your filters or checking back later.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">
                      ID
                    </th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">
                      Contributor
                    </th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">
                      Amount
                    </th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">
                      Source
                    </th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">
                      Status
                    </th>
                    <th className="text-left py-5 px-6 text-[10px] font-black uppercase tracking-widest">
                      Reference
                    </th>
                    <th className="text-right py-5 px-6 text-[10px] font-black uppercase tracking-widest">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donations.map((dn) => (
                    <tr
                      key={dn.id}
                      className="hover:bg-indigo-50/50 transition-colors group"
                    >
                      <td className="py-5 px-6 text-xs font-black text-slate-800">
                        #{dn.id}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-bold text-gray-900">
                            {dn.donorName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                            {dn.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-xs font-black text-slate-900">
                          {dn.currency}{" "}
                          {Number(dn.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                          {dn.method}
                        </span>
                      </td>
                      <td className="py-5 px-6">{getStatusBadge(dn.status)}</td>
                      <td className="py-5 px-6">
                        <span className="text-[11px] font-medium text-gray-500 font-mono tracking-tighter truncate max-w-[120px] block opacity-60 group-hover:opacity-100 transition-opacity">
                          {dn.providerReference || "N/A"}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(dn.createdAt).toLocaleDateString()}
                        </span>
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