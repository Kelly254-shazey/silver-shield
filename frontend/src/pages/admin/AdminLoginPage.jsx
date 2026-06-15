import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LogoBrand from "../../components/LogoBrand";

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
      pushToast("Welcome back, administrator.", "success");
      navigate(location.state?.from || "/admin/dashboard", { replace: true });
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-200 relative overflow-hidden p-6">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-600 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <LogoBrand variant="minimal" className="justify-center mb-6" />
          <h1 className="h2 text-brand-900 mb-2">Administrator Access</h1>
          <p className="text-sm text-text-500 font-medium uppercase tracking-widest">Silver Shield Management Console</p>
        </div>

        <form className="card p-10 flex flex-col gap-8 shadow-premium" onSubmit={onSubmit}>
          <header className="flex flex-col gap-2 border-b border-border-subtle pb-6">
            <h2 className="text-lg font-black text-brand-900 uppercase tracking-tight m-0">Authentication</h2>
            <p className="text-[10px] font-bold text-text-400 uppercase tracking-widest m-0">Identity Verification Required</p>
          </header>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-400" size={18} />
                <input
                  type="email"
                  placeholder="admin@silvershield.org"
                  className="input-field py-4 pl-12 pr-4 text-sm font-semibold"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-brand-800 uppercase tracking-widest">Password</label>
                <Link to="/contact" className="text-[9px] font-black text-accent-600 hover:underline uppercase no-underline tracking-tighter">Forgot Access?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-400" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field py-4 pl-12 pr-4 text-sm font-semibold"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
          </div>

          <footer className="flex flex-col gap-4 mt-2">
            <button className="btn btn-primary btn-lg w-full font-black text-[10px] uppercase tracking-widest" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign Into Console"}
            </button>

            <Link to="/" className="text-center text-[10px] font-black text-text-400 hover:text-brand-900 uppercase tracking-widest transition-colors no-underline">
              Return to Public Website
            </Link>
          </footer>
        </form>

        <div className="mt-12 flex items-center justify-center gap-2 text-text-400">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Administration Environment</span>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLoginPage;
