# 🏥 Smart Hospital – Blockchain Based Medical Record System

A secure, decentralized medical record system built using **Blockchain + IPFS + FastAPI + React**.

This project allows patients to store encrypted medical records on IPFS while maintaining proof and access control via Ethereum smart contracts.

Doctors can securely access patient records only when permission is granted.

---

# 🚀 Features

## 👨‍⚕️ Patient
✅ Register & Login  
✅ Connect MetaMask Wallet  
✅ Upload encrypted medical records  
✅ Store files on IPFS  
✅ Blockchain proof of record  
✅ View complete medical history  
✅ Download records securely  

---

## 🩺 Doctor
✅ Secure login  
✅ View patient records (with wallet)  
✅ Access decentralized data  
✅ Download medical files  

---

## 🔐 Security Features

- AES-256 File Encryption  
- JWT Authentication  
- Wallet Signature Verification  
- Blockchain Record Proof  
- IPFS Distributed Storage  

👉 Even if the server is hacked — files remain encrypted.

---

# 🧱 Tech Stack

## Backend
- FastAPI
- SQLAlchemy
- JWT Authentication
- Web3.py
- AES Encryption

## Frontend
- React.js
- Axios
- MetaMask Integration
- Ethers.js

## Blockchain
- Solidity Smart Contract
- Hardhat
- Ganache / Local Ethereum Network

## Storage
- IPFS (InterPlanetary File System)

---

# 🧠 System Architecture

```
React → FastAPI → AES Encryption → IPFS
                      ↓
                   Blockchain
```

Files are:

✔ encrypted → ✔ uploaded to IPFS → ✔ hash stored on blockchain

---

# ⚙️ Installation Guide

---

## 1️⃣ Clone Project

```bash
git clone https://github.com/YOUR_USERNAME/smart-hospital.git
cd smart-hospital
```

---

## 2️⃣ Start Blockchain

### Run Hardhat Node:

```bash
npx hardhat node
```

---

## 3️⃣ Deploy Smart Contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address.

---

## 4️⃣ Backend Setup

### Install dependencies:

```bash
pip install fastapi uvicorn sqlalchemy python-dotenv web3 passlib[argon2] python-jose pycryptodome requests
```

---

### Create `.env`

```
DATABASE_URL=sqlite:///./hospital.db
GANACHE_RPC=http://127.0.0.1:8545
CHAIN_ID=1337
CONTRACT_ADDRESS=PASTE_DEPLOYED_ADDRESS
BACKEND_PRIVATE_KEY=GANACHE_PRIVATE_KEY
SECRET_KEY=supersecretkey
```

---

### Start FastAPI:

```bash
uvicorn app:app --reload
```

Server runs at:

```
http://127.0.0.1:8000
```

---

## 5️⃣ Start IPFS

Install IPFS and run:

```bash
ipfs daemon
```

---

## 6️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Runs on:

```
http://localhost:3000
```

---

# 🦊 MetaMask Setup

Add Local Network:

| Field | Value |
|--------|--------|
| Network Name | Hardhat |
| RPC URL | http://127.0.0.1:8545 |
| Chain ID | 1337 |
| Currency | ETH |

Import one Hardhat account private key.

---

# 📊 Database Schema

## Users
- id  
- name  
- email  
- password  
- role  
- wallet  

## Medical Records
- id  
- patient_id  
- ipfs_hash  
- file_name  
- aes_key  
- uploaded_at  

---

# 🔗 API Endpoints

## Auth
```
POST /register
POST /login
```

## Wallet
```
POST /bind-wallet
```

## Medical Records
```
POST /upload-medical-record
GET /patient/history
GET /doctor/patient-history/{wallet}
POST /download-record
```

---

# 🔥 Why Blockchain?

Traditional hospital systems:

❌ Centralized  
❌ Hackable  
❌ Data manipulation risk  

Our system:

✅ Immutable  
✅ Transparent  
✅ Tamper-proof  
✅ Patient-controlled  

---

# 🧪 Future Improvements

✔ Doctor access approval smart contract  
✔ Admin dashboard  
✔ Appointment booking  
✔ AI diagnosis assistant  
✔ Multi-hospital support  
✔ Cloud deployment (AWS)  
✔ Mobile App  

---

# 🎯 Learning Outcomes

This project demonstrates real-world knowledge of:

- Blockchain Development  
- Smart Contracts  
- Web3 Integration  
- Encryption  
- Secure Backend Design  
- Full Stack Development  

---

# 👨‍💻 Author

**Your Name**

Final Year Project – Smart Hospital  
Blockchain Based Medical Record System  

---

# ⭐ If You Like This Project

Give it a ⭐ on GitHub!
