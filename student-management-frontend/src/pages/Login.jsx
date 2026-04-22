import { useState } from "react";
import { login } from "../services/authService";
import Button from "../components/Button";

export default function Login({ onLoginSuccess, onNavigateSignup }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(credentials);
      if (result.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Log in to manage your students</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input 
              name="email" 
              type="email"
              placeholder="admin@example.com" 
              onChange={handleChange} 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              name="password" 
              type="password"
              placeholder="••••••••" 
              onChange={handleChange} 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
            />
          </div>
          <button 
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold py-3 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all`}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <button onClick={onNavigateSignup} className="text-indigo-600 font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </main>
  );
}
