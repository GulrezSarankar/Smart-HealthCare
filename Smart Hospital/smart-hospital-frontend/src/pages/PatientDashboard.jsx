import { useEffect, useState, useCallback } from "react";
import {
  uploadMedicalRecord,
  getPatientRecords,
  downloadMedicalRecord,
  bindWallet,
} from "../Services/api";
import { connectWallet, signBindMessage } from "../utils/metamask";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Wallet, 
  History, 
  Key, 
  ShieldCheck, 
  Clock,
  Plus,
  Copy,
  Check, // Added for "Copied" state feedback
  LogOut,
  Loader2
} from "lucide-react";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [wallet, setWallet] = useState(localStorage.getItem("wallet"));
  const [file, setFile] = useState(null);
  const [aesKey, setAesKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [copied, setCopied] = useState(false); // State for copy feedback

  // ================= COPY LOGIC =================
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  // ================= LOGOUT LOGIC =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("wallet");
    navigate("/login");
  };

  // ================= FETCH =================
  const fetchRecords = useCallback(async () => {
    if (!wallet) return;
    try {
      const res = await getPatientRecords();
      setRecords(res.data.records || []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err);
    }
  }, [wallet]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ================= CONNECT + BIND =================
  const handleConnectWallet = async () => {
    try {
      const result = await connectWallet();
      if (!result) return;
      const signature = await signBindMessage(result.signer);
      await bindWallet(result.address, signature);
      localStorage.setItem("wallet", result.address);
      setWallet(result.address);
    } catch (err) {
      console.error(err);
      alert("Wallet linking failed");
    }
  };

  // ================= UPLOAD =================
  const uploadRecord = async () => {
    if (!wallet) return alert("Connect wallet first!");
    if (!file) return alert("Select a file");

    setLoading(true);
    try {
      const res = await uploadMedicalRecord(file);
      setAesKey(res.data.aes_key);
      setFile(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= DOWNLOAD =================
  const downloadRecord = async (ipfsHash) => {
    if (!aesKey) return alert("Please enter your AES key first!");
    
    setDownloading(ipfsHash);
    try {
      const res = await downloadMedicalRecord(ipfsHash, aesKey);
      const link = document.createElement("a");
      link.href = `data:application/octet-stream;base64,${res.data.file_base64}`;
      link.download = `Record_${ipfsHash.substring(0, 6)}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Download failed. Check if AES key is correct.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 p-6 sticky top-0 h-screen justify-between">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <ShieldCheck className="text-emerald-600" size={28} />
            <span className="text-xl font-bold text-slate-800 tracking-tight">SmartCare</span>
          </div>
          <nav className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold cursor-pointer transition-colors">
              <FileText size={20} /> My Records
            </div>
            <div className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-not-allowed">
              <Clock size={20} /> Appointments
            </div>
            <div className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-not-allowed">
              <History size={20} /> Audit Logs
            </div>
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex justify-between items-start w-full md:w-auto">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Patient Dashboard</h1>
              <p className="text-slate-500">Secure blockchain medical records management.</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="lg:hidden p-2 text-red-500 bg-red-50 rounded-lg"
            >
              <LogOut size={20} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!wallet ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnectWallet}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <Wallet size={20} /> Connect MetaMask
              </motion.button>
            ) : (
              <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Wallet Linked</p>
                  <p className="text-xs font-mono text-slate-700">{wallet.substring(0, 6)}...{wallet.slice(-4)}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Stats & AES Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Records</p>
            <h4 className="text-2xl font-bold text-slate-900">{records.length}</h4>
          </div>
          <div className="md:col-span-2 bg-indigo-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-indigo-200 text-sm font-medium mb-1">Decryption Access</p>
              <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Key size={18} className="text-emerald-400" /> AES Key Management
              </h4>
              <input 
                type="password"
                placeholder="Enter your AES key to enable downloads"
                value={aesKey}
                onChange={(e) => setAesKey(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white/20 transition-all placeholder:text-white/40"
              />
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">New Medical Upload</h2>
          </div>

          <div className={`relative border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${file ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
            <UploadCloud size={48} className={file ? 'text-emerald-500' : 'text-slate-300'} />
            <div className="text-center">
              {file ? (
                <p className="text-emerald-700 font-semibold">{file.name}</p>
              ) : (
                <>
                  <p className="text-slate-700 font-medium">Click to select or drag and drop</p>
                  <p className="text-slate-400 text-xs mt-1">PDF, JPG or PNG (max 10MB)</p>
                </>
              )}
            </div>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={uploadRecord}
            disabled={loading || !file}
            className="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm & Upload to IPFS"}
          </motion.button>

          <AnimatePresence>
            {aesKey && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-inner shadow-emerald-200/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">New AES Key Generated</span>
                  <button 
                    onClick={() => copyToClipboard(aesKey)} 
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${copied ? 'bg-emerald-200 text-emerald-800' : 'bg-white/50 text-emerald-700 hover:bg-white'}`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span className="text-xs font-bold">{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <p className="font-mono text-sm break-all text-emerald-900 bg-white/50 p-3 rounded-xl border border-emerald-200/50 select-all">
                  {aesKey}
                </p>
                <p className="text-[10px] text-emerald-600 mt-2 font-medium italic">
                  Note: This key is required to decrypt and download your record later.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Records Table */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Medical History</h2>
            <button onClick={fetchRecords} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Refresh List</button>
          </div>

          <div className="overflow-x-auto">
            {records.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-slate-500 font-medium">No medical records found.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">IPFS Hash</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {r.ipfsHash.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(r.timestamp * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => downloadRecord(r.ipfsHash)}
                          disabled={downloading === r.ipfsHash}
                          className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1 disabled:text-slate-400"
                        >
                          {downloading === r.ipfsHash ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Download size={14} />
                          )}
                          {downloading === r.ipfsHash ? "Downloading..." : "Download"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;