import API from "./api";

// get records of a patient
export const getDoctorRecords = (patientWallet) =>
  API.get(`/doctor/get-records/${patientWallet}`);
