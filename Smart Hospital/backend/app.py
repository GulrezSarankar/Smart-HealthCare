from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from eth_account.messages import encode_defunct
from web3 import Web3
from dotenv import load_dotenv
import json, base64, requests, os
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes


# ================= LOAD ENV =================

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GANACHE_RPC = os.getenv("GANACHE_RPC")
CHAIN_ID = int(os.getenv("CHAIN_ID"))
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
BACKEND_PRIVATE_KEY = os.getenv("BACKEND_PRIVATE_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")


# ================= DATABASE =================

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)
    password = Column(String(300))
    role = Column(String(20))
    wallet = Column(String(200), nullable=True)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= SECURITY =================

ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


def create_token(data: dict):
    data["exp"] = datetime.utcnow() + timedelta(hours=2)
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
    except JWTError:
        raise HTTPException(401, "Invalid token")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(404, "User not found")

    return user


# ================= BLOCKCHAIN =================

w3 = Web3(Web3.HTTPProvider(GANACHE_RPC))

if not w3.is_connected():
    raise RuntimeError("❌ Cannot connect to blockchain")

backend_account = w3.eth.account.from_key(BACKEND_PRIVATE_KEY)

with open("medical_records_abi.json") as f:
    contract_abi = json.load(f)

code = w3.eth.get_code(Web3.to_checksum_address(CONTRACT_ADDRESS))

if code == b'':
    raise RuntimeError("❌ CONTRACT NOT DEPLOYED")

contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=contract_abi
)

print("✅ Blockchain Connected")


MESSAGE_TO_SIGN = "Bind this wallet to my medical account"


# ================= IPFS =================

IPFS_API = "http://127.0.0.1:5001/api/v0"


def ipfs_add_json(data: dict):

    file_bytes = json.dumps(data).encode("utf-8")

    r = requests.post(
        f"{IPFS_API}/add",
        files={"file": ("data.json", file_bytes)}
    )

    r.raise_for_status()

    return r.json()["Hash"]


def ipfs_get_json(ipfs_hash: str):

    r = requests.post(
        f"{IPFS_API}/cat",
        params={"arg": ipfs_hash}
    )

    r.raise_for_status()

    return json.loads(r.text)


# ================= AES =================

def encrypt_file(data: bytes):

    key = get_random_bytes(32)
    cipher = AES.new(key, AES.MODE_GCM)

    ciphertext, tag = cipher.encrypt_and_digest(data)

    return {
        "ciphertext": base64.b64encode(ciphertext).decode(),
        "nonce": base64.b64encode(cipher.nonce).decode(),
        "tag": base64.b64encode(tag).decode(),
        "key": base64.b64encode(key).decode()
    }


def decrypt_file(payload: dict, key_b64: str):

    key = base64.b64decode(key_b64)

    cipher = AES.new(
        key,
        AES.MODE_GCM,
        nonce=base64.b64decode(payload["nonce"])
    )

    return cipher.decrypt_and_verify(
        base64.b64decode(payload["ciphertext"]),
        base64.b64decode(payload["tag"])
    )


# ================= FASTAPI =================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= AUTH =================

@app.post("/register")
def register(name: str, email: str, password: str, role: str,
             db: Session = Depends(get_db)):

    if role not in ["admin", "doctor", "patient"]:
        raise HTTPException(400, "Invalid role")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "Email exists")

    user = User(
        name=name,
        email=email,
        password=hash_password(password),
        role=role
    )

    db.add(user)
    db.commit()

    return {"message": "Registered successfully"}


@app.post("/login")
def login(email: str, password: str,
          db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(401, "Invalid credentials")

    return {
        "access_token": create_token(
            {"email": user.email, "role": user.role}
        ),
        "role": user.role
    }


# ================= WALLET =================

@app.post("/bind-wallet")
def bind_wallet(wallet_address: str, signature: str,
                current_user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):

    message = encode_defunct(text=MESSAGE_TO_SIGN)

    recovered = w3.eth.account.recover_message(message, signature=signature)

    if recovered.lower() != wallet_address.lower():
        raise HTTPException(401, "Signature mismatch")

    current_user.wallet = Web3.to_checksum_address(wallet_address)
    db.commit()

    return {"message": "Wallet linked successfully"}


# ================= UPLOAD =================

@app.post("/upload-medical-record")
def upload_medical_record(file: UploadFile = File(...),
                          current_user: User = Depends(get_current_user)):

    if not current_user.wallet:
        raise HTTPException(400, "Connect wallet first")

    encrypted = encrypt_file(file.file.read())

    ipfs_hash = ipfs_add_json({
        "ciphertext": encrypted["ciphertext"],
        "nonce": encrypted["nonce"],
        "tag": encrypted["tag"]
    })

    nonce = w3.eth.get_transaction_count(backend_account.address)

    tx = contract.functions.addRecord(ipfs_hash).build_transaction({
        "from": backend_account.address,
        "nonce": nonce,
        "chainId": CHAIN_ID,
        "gas": 300000,
        "gasPrice": w3.to_wei("20", "gwei")
    })

    signed_tx = w3.eth.account.sign_transaction(tx, BACKEND_PRIVATE_KEY)

    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    return {
        "ipfs_hash": ipfs_hash,
        "aes_key": encrypted["key"],
        "tx_hash": tx_hash.hex()
    }


# ================= PATIENT =================

@app.get("/blockchain/get-records")
def get_records(current_user: User = Depends(get_current_user)):

    if not current_user.wallet:
        raise HTTPException(400, "Wallet not linked")

    wallet = Web3.to_checksum_address(current_user.wallet)

    records = contract.functions.getRecords(wallet).call({
        "from": wallet
    })

    return {
        "records": [
            {"ipfsHash": r[0], "timestamp": r[1]}
            for r in records
        ]
    }


# ================= DOCTOR =================

@app.get("/doctor/get-records/{patient_wallet}")
def doctor_get_records(patient_wallet: str,
                       current_user: User = Depends(get_current_user)):

    if current_user.role != "doctor":
        raise HTTPException(403, "Doctors only")

    if not current_user.wallet:
        raise HTTPException(400, "Doctor wallet not linked")

    doctor_wallet = Web3.to_checksum_address(current_user.wallet)
    patient_wallet = Web3.to_checksum_address(patient_wallet)

    records = contract.functions.getRecords(patient_wallet).call({
        "from": doctor_wallet
    })

    return {
        "records": [
            {"ipfsHash": r[0], "timestamp": r[1]}
            for r in records
        ]
    }


# ================= DOWNLOAD =================

@app.post("/download-record")
def download_record(ipfs_hash: str, aes_key: str):

    payload = ipfs_get_json(ipfs_hash)

    data = decrypt_file(payload, aes_key)

    return {
        "file_base64": base64.b64encode(data).decode()
    }
