import { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import "./StudentRegistration.css";

const StudentRegistration: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setUploading(true);

    try {
      // Read Excel File
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Parsed Data:", jsonData);

      // Send to backend
      const res = await axios.post("http://localhost:5000/api/admin/upload-students", {
        students: jsonData,
      });

      alert(res.data.message || "Students uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Error uploading file. Please check the file format.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="student-registration-container">
      <h2 className="page-title">Upload Student Registration File</h2>

      <form className="upload-form" onSubmit={handleUpload}>
        <label className="upload-box">
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
          <span>
            {file ? (
              <strong>{file.name}</strong>
            ) : (
              <>
                📂 Click to choose Excel file <br />
                or drag and drop here
              </>
            )}
          </span>
        </label>

        <button type="submit" className="upload-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default StudentRegistration;
