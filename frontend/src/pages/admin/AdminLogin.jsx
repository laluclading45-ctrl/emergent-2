import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back.");
      nav("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center px-6" data-testid="admin-login">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-14 h-14 border border-[#D4AF37] mx-auto mb-6 flex items-center justify-center">
            <Lock className="text-[#D4AF37]" size={20} />
          </div>
          <div className="eyebrow mb-2">LALU CLADING</div>
          <h1 className="font-serif text-4xl text-[#F8F8F6]">Admin Panel</h1>
        </div>
        <form onSubmit={submit} className="space-y-4 p-8 border border-white/10 bg-[#14161B]">
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} data-testid="login-email" />
          </div>
          <div>
            <label className="eyebrow block mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} data-testid="login-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full justify-center" data-testid="login-submit">
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
