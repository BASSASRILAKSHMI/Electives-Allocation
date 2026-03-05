import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./AdminElectivesUpload.css";

const departmentMap: Record<string, string> = {
  "Computer Science and Engineering": "CSE",
  "Information Technology": "IT",
  "Electronics and Communication Engineering": "ECE",
  "Electrical and Electronics Engineering": "EEE",
  "Mechanical Engineering": "MECH",
  "Civil Engineering": "CIVIL",
  "Artificial Intelligence and Data Science": "AIDS",
  "Artificial Intelligence and Machine Learning": "AIML",
  "Biotechnology": "BT",
  "Chemical Engineering": "CHE",
  "Internet of Things": "IOT",
  "Master of Computer Applications": "MCA",
  "Master of Business Administration": "MBA",
};

const AdminElectivesUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one Excel file");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      for (let file of files) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);

        // Loop over all sheets
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<any>(worksheet);

          // Replace department names with codes
         json.forEach((row) => {
  // Read department from Excel column
  const dept = row.Department || row.department;

  if (dept && departmentMap[dept]) {
    // Overwrite Excel column with code
    row.Department = departmentMap[dept];
  }

  // Ensure backend consistency
  row.department = row.Department;
});


          // Convert back to sheet
          const newSheet = XLSX.utils.json_to_sheet(json);
          workbook.Sheets[sheetName] = newSheet;
        });

        // Convert workbook back to blob
        const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const newFile = new File([wbout], file.name, { type: file.type });
        formData.append("files", newFile);
      }

      const res = await axios.post(
        "http://98.130.122.229:5000/api/admin/electives/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage(res.data.message || "Upload successful");
      setFiles([]);
    } catch (err: any) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Upload failed. Please check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Electives</h1>

      <input
        type="file"
        multiple
        accept=".xlsx"
        onChange={handleFileChange}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AdminElectivesUpload;
