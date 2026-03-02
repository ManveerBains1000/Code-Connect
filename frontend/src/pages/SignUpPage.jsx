import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { SparklesIcon, ArrowRightIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, isLoading, isSignedIn } = useAuth();
  const navigate = useNavigate();

  if (isSignedIn) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim()) return toast.error("Username is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");

    try {
      await signup(form.username.trim(), form.email.trim(), form.password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f0e] px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#111715] border border-white/10 shadow-2xl px-8 py-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-4">
          <div className="size-9 rounded-lg bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center">
            <SparklesIcon className="size-5 text-black" />
          </div>
          <span className="font-black text-xl bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-mono">
            CodeConnect
          </span>
        </Link>

        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-1">
          Create Account
        </h2>
        <p className="text-white/60 mb-4 text-sm">
          Join and start coding together
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Username */}
          <div>
            <label className="text-xs text-white/70">Username</label>
            <input
              type="text"
              placeholder="code_master"
              className="mt-1 w-full rounded-lg bg-[#0b0f0e] border border-white/10 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-white/70">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg bg-[#0b0f0e] border border-white/10 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-white/70">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg bg-[#0b0f0e] border border-white/10 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs text-white/70">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg bg-[#0b0f0e] border border-white/10 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 py-2.5 font-semibold text-black hover:opacity-90 transition"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                Create Account
                <ArrowRightIcon className="size-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-white/50">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}