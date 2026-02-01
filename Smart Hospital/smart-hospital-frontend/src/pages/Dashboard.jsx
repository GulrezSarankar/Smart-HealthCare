import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === "admin") navigate("/admin");
    else if (role === "doctor") navigate("/doctor");
    else if (role === "patient") navigate("/patient");
    else navigate("/login");
  }, [navigate]);

  return null;
}
