import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPreferencesFiles.css";

interface FileData {
  _id: string;          // ✅ important
  regulation: string;
  department: string;
  semester: string;
  electiveType: string;
  filename: string;
}

const AdminPreferencesFiles = () => {

  const [files, setFiles] = useState<FileData[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  /* ================= FETCH FILES ================= */

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://98.130.122.229:5000/api/admin/electives/preference-files",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SELECT SINGLE ================= */

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  /* ================= SELECT ALL ================= */

  const toggleSelectAll = () => {
    if (selected.length === files.length) {
      setSelected([]);
    } else {
      setSelected(files.map(f => f._id));   // ✅ use id
    }
  };

  /* ================= ANALYSE ================= */

  const handleAnalyse = () => {
    if (selected.length === 0) return;

    // store selected file IDs
    localStorage.setItem(
      "analyzeFiles",
      JSON.stringify(selected)
    );

    window.location.href = "/admin/analyzed-data";
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (selected.length === 0) return;

    const confirmDelete = window.confirm("Delete selected files?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://98.130.122.229:5000/api/admin/electives/delete-preference-files",
        { files: selected },          // ids
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelected([]);
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="admin-preferences-files">

      <h2>Preferences Files</h2>

      {/* ACTION BUTTONS */}
      <div className="action-bar">

        <button
          className="analyse-btn"
          disabled={selected.length === 0}
          onClick={handleAnalyse}
        >
          Analyse
        </button>

        <button
          className="delete-btn"
          disabled={selected.length === 0}
          onClick={handleDelete}
        >
          Delete
        </button>

      </div>

      {/* TABLE */}
      <table>

        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  files.length > 0 &&
                  selected.length === files.length
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th>Regulation</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Elective Type</th>
            <th>File</th>
          </tr>
        </thead>

        <tbody>
          {files.map((f) => (
            <tr key={f._id}>

              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(f._id)}
                  onChange={() => toggleSelect(f._id)}
                />
              </td>

              <td>{f.regulation}</td>
              <td>{f.department}</td>
              <td>{f.semester}</td>
              <td>{f.electiveType}</td>

              <td>
                <a
                  href={`http://98.130.122.229:5000/uploads/${f.filename}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
};

export default AdminPreferencesFiles;
