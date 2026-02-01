import { useState } from "react";
import { connectWallet } from "../utils/metamask";
import { getDoctorRecords } from "../Services/doctorapi";
import { downloadMedicalRecord } from "../Services/api";

const DoctorDashboard = () => {

  const [wallet, setWallet] = useState(
    localStorage.getItem("wallet")
  );

  const [patientWallet, setPatientWallet] = useState("");
  const [records, setRecords] = useState([]);
  const [aesKey, setAesKey] = useState("");

  // ================= CONNECT =================

  const handleConnect = async () => {

    const result = await connectWallet();

    if (!result) return;

    localStorage.setItem("wallet", result.address);
    setWallet(result.address);

    alert("✅ Doctor wallet connected!");
  };

  // ================= FETCH =================

  const fetchRecords = async () => {

    if (!patientWallet)
      return alert("Enter patient wallet");

    try {

      const res = await getDoctorRecords(patientWallet);

      setRecords(res.data.records || []);

      if (res.data.records.length === 0)
        alert("No records OR access not granted");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Access denied or patient not found"
      );
    }
  };

  // ================= DOWNLOAD =================

  const downloadRecord = async (ipfsHash) => {

    if (!aesKey)
      return alert("Enter AES key from patient");

    try {

      const res = await downloadMedicalRecord(
        ipfsHash,
        aesKey
      );

      const link = document.createElement("a");

      link.href =
        `data:application/octet-stream;base64,${res.data.file_base64}`;

      link.download = "medical_record";

      link.click();

    } catch {
      alert("Download failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* HEADER */}
      <div className="flex justify-between mb-10">

        <h1 className="text-3xl font-bold">
          🩺 Doctor Dashboard
        </h1>

        {!wallet ? (

          <button
            onClick={handleConnect}
            className="bg-purple-600 text-white px-5 py-2 rounded"
          >
            Connect MetaMask
          </button>

        ) : (

          <div className="bg-green-100 px-4 py-2 rounded">
            Wallet Connected
            <p className="text-xs break-all">
              {wallet}
            </p>
          </div>

        )}

      </div>

      {/* SEARCH PATIENT */}

      <div className="bg-white p-6 rounded shadow mb-10">

        <h2 className="text-xl font-semibold mb-4">
          View Patient Records
        </h2>

        <input
          placeholder="Enter Patient Wallet Address"
          value={patientWallet}
          onChange={(e) =>
            setPatientWallet(e.target.value)
          }
          className="border p-2 w-96 mr-4"
        />

        <button
          onClick={fetchRecords}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Fetch Records
        </button>

        <div className="mt-4">

          <input
            placeholder="Enter AES key from patient"
            value={aesKey}
            onChange={(e) =>
              setAesKey(e.target.value)
            }
            className="border p-2 w-96"
          />

        </div>

      </div>

      {/* RECORD TABLE */}

      <div className="bg-white p-6 rounded shadow">

        {records.length === 0 ? (

          <p>No records loaded</p>

        ) : (

          <table className="w-full border">

            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">
                  IPFS Hash
                </th>
                <th className="border p-2">
                  Timestamp
                </th>
                <th className="border p-2">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {records.map((r, i) => (

                <tr key={i}>

                  <td className="border p-2 break-all">
                    {r.ipfsHash}
                  </td>

                  <td className="border p-2">
                    {new Date(
                      r.timestamp * 1000
                    ).toLocaleString()}
                  </td>

                  <td className="border p-2">

                    <button
                      onClick={() =>
                        downloadRecord(r.ipfsHash)
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Download
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
};

export default DoctorDashboard;
