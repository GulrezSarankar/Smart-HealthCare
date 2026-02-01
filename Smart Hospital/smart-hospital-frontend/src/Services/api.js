import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// ✅ Attach JWT automatically
API.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= AUTH =================

export const registerUser = (data) =>
  API.post("/register", null, { params: data });

export const loginUser = async (data) => {

  const res = await API.post("/login", null, {
    params: data,
  });

  localStorage.setItem("token", res.data.access_token);
  localStorage.setItem("role", res.data.role);

  return res;
};

// ================= WALLET =================

export const bindWallet = (wallet_address, signature) =>
  API.post("/bind-wallet", null, {
    params: { wallet_address, signature },
  });

// ================= PATIENT =================

// ⭐ FIXED multipart upload
export const uploadMedicalRecord = (file) => {

  const formData = new FormData();
  formData.append("file", file);

  return API.post("/upload-medical-record", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getPatientRecords = () =>
  API.get("/blockchain/get-records");

export const downloadMedicalRecord = (ipfs_hash, aes_key) =>
  API.post("/download-record", null, {
    params: { ipfs_hash, aes_key },
  });

export default API;
