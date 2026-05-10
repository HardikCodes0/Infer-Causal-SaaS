import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_URL = "https://infer-causal-saas-1.onrender.com";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await axios.post(`${API_URL}${endpoint}`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg">
            <FlaskConical className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-950">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "Enter your credentials to access your workspace." : "Sign up to start running causal inference."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Authenticating..." : isLogin ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="font-medium text-slate-900 hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
}
