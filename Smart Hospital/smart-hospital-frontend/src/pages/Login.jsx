import { useState } from "react";
import { loginUser } from "../Services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 overflow-hidden">
      {/* LEFT SIDE: Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-emerald-500/40 z-0" />
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-400 rounded-full blur-[120px] opacity-20" />
        
        <div className="relative z-10 max-w-lg text-white">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Activity className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">SmartCare <span className="text-emerald-400">OS</span></h1>
            </div>
            <h2 className="text-5xl font-light leading-tight mb-6">
              Modern Management for <span className="font-semibold italic">Modern Healthcare.</span>
            </h2>
            <p className="text-lg text-blue-100/80 mb-8">
              Access your clinical dashboard, manage patient records, and streamline workflows with our secure infrastructure.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 text-sm font-medium text-blue-100">
                <ShieldCheck className="text-emerald-400 w-5 h-5" /> HIPAA Compliant
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-blue-100">
                <Lock className="text-emerald-400 w-5 h-5" /> 256-bit Encryption
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="p-4 bg-emerald-600 rounded-2xl shadow-xl mb-4">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Smart Hospital</h2>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h3>
            <p className="text-gray-500">Welcome back! Please enter your credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200"
                  placeholder="name@hospital.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <label htmlFor="remember" className="text-sm text-gray-600 font-medium">Keep me signed in</label>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="relative w-full overflow-hidden group bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-70"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign Into Portal
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500">
              New to the platform?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
              >
                Create staff account
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}