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

        <form className="bg-white p-10 rounded-[40px] shadow-premium border border-border-subtle flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-brand-800 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-400" size={20} />
              <input
                type="email"
                placeholder="admin@silvershield.org"
                className="w-full bg-surface-200 border-none py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-600 outline-none transition-all text-sm font-semibold"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-brand-800 uppercase tracking-wider">Password</label>
              <Link to="/contact" className="text-[10px] font-bold text-accent-600 hover:underline uppercase no-underline">Forgot Access?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-400" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface-200 border-none py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-600 outline-none transition-all text-sm font-semibold"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full py-4 mt-2 rounded-2xl shadow-xl font-black text-sm uppercase tracking-widest border-none cursor-pointer" type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Sign Into Console"}
          </button>

          <Link to="/" className="text-center text-xs font-bold text-text-400 hover:text-brand-600 transition-colors mt-2 no-underline">
            Return to Public Website
          </Link>
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
