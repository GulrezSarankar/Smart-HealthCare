import { useState } from "react";
import { registerUser } from "../Services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, HeartPulse, CheckCircle2 } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 overflow-hidden">
      {/* LEFT SIDE: Visual/Info */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-indigo-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-emerald-900/40 z-0" />
        
        <div className="relative z-10 max-w-md text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <HeartPulse className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">SmartCare <span className="text-emerald-400">OS</span></h1>
            </div>

            <h2 className="text-4xl font-bold mb-8 leading-tight">
              Start your journey into <span className="text-emerald-400">digital health.</span>
            </h2>

            <div className="space-y-6">
              {[
                "Personalized Health Insights",
                "Blockchain Secured Records",
                "Direct Doctor Communication"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-indigo-100 font-medium">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10">
              <p className="text-sm text-indigo-200 italic">
                "The most advanced hospital management system I've used. The security and speed are unmatched."
              </p>
              <p className="mt-4 text-sm font-bold">— Dr. Sarah Chen, Chief of Medicine</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Register Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-xl"
        >
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <HeartPulse className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">SmartCare</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-4xl font-extrabold text-gray-900 mb-3">Create Account</h3>
            <p className="text-gray-500 text-lg">Join thousands of healthcare professionals and patients.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input
                  name="name"
                  type="text"
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">I am a...</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Staff / Admin</option>
                </select>
              </div>
            </div>

            <p className="md:col-span-2 text-xs text-gray-500 px-1">
              By registering, you agree to our <span className="text-emerald-600 cursor-pointer">Terms</span> and <span className="text-emerald-600 cursor-pointer">Privacy Policy</span>.
            </p>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="md:col-span-2 relative w-full overflow-hidden group bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-70 mt-4"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create My Account
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}