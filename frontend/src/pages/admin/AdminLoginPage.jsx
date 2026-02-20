import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { pushToast } = useToast();

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      login(response);
      pushToast("Logged in successfully.", "success");
      navigate(location.state?.from || "/admin/dashboard", { replace: true });
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <form className="glass-panel admin-login-card" onSubmit={onSubmit}>
        <p className="eyebrow">Admin</p>
        <h1>Silver Shield Console</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default AdminLoginPage;
