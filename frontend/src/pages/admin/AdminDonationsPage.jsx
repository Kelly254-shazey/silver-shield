import { useEffect, useState } from "react";
import { API_BASE_URL, apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageTransition from "../../components/PageTransition";

function AdminDonationsPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [donations, setDonations] = useState([]);
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
    loadDonations().catch((error) => pushToast(error.message, "error"));
  }, [filters.status, filters.method, token, pushToast]);

  const onExport = () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.method) params.set("method", filters.method);
    params.set("export", "csv");
    const url = `${API_BASE_URL}/donations?${params.toString()}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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

  return (
    <PageTransition className="admin-page">
      <section className="admin-section">
        <h1>Donations</h1>
        <div className="filter-row">
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, status: event.target.value }))
            }
          >
            <option value="">All statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
          <select
            value={filters.method}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, method: event.target.value }))
            }
          >
            <option value="">All methods</option>
            <option value="MPESA">MPESA</option>
            <option value="PAYPAL">PAYPAL</option>
          </select>
          <button className="btn btn-outline" type="button" onClick={onExport}>
            Export CSV
          </button>
        </div>

        <div className="glass-card admin-table-wrap">
          <div className="admin-mobile-list">
            {donations.map((item) => (
              <article key={item.id} className="simple-list-item">
                <p>
                  <strong>ID:</strong> {item.id}
                </p>
                <p>
                  <strong>Donor:</strong> {item.donorName}
                </p>
                <p>
                  <strong>Amount:</strong> {item.currency} {Number(item.amount).toLocaleString()}
                </p>
                <p>
                  <strong>Method:</strong> {item.method}
                </p>
                <p>
                  <strong>Status:</strong> {item.status}
                </p>
                <p>
                  <strong>Reference:</strong> {item.providerReference || "-"}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(item.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>

          <div className="admin-desktop-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.donorName}</td>
                    <td>
                      {item.currency} {Number(item.amount).toLocaleString()}
                    </td>
                    <td>{item.method}</td>
                    <td>{item.status}</td>
                    <td>{item.providerReference || "-"}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

export default AdminDonationsPage;
