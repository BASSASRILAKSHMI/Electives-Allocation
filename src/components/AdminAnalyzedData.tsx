import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminAnalyzedData.css";

interface FileData {
  _id: string;
  regulation: string;
  department: string;
  semester: string;
  electiveType: string;
  filename: string;
}

interface PreferenceData {
  preference1: string;
}

interface Subject {
  code: string;
  name: string;
}

interface FileStats {
  file: FileData;
  preference1Counts: Record<string, number>;
  masterElectives: Subject[];
  allocationDone?: boolean; // Persisted: true if already allocated in DB
}

const AdminAnalyzedData = () => {
  const [fileStats, setFileStats] = useState<FileStats[]>([]);
  const [selectedElectivesMap, setSelectedElectivesMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchSelectedFilesStats();
  }, []);

  // Fetch files, preferences, master electives, and allocation status
  const fetchSelectedFilesStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const selectedIds: string[] = JSON.parse(localStorage.getItem("analyzeFiles") || "[]");

      // 1️⃣ Fetch all preference files
      const res = await axios.get("http://98.130.122.229:5000/api/admin/electives/preference-files", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const selectedFiles: FileData[] = res.data.filter((f: any) =>
        selectedIds.includes(String(f._id))
      );

      if (selectedFiles.length === 0) {
        setFileStats([]);
        return;
      }

      const stats: FileStats[] = [];

      for (const file of selectedFiles) {
        // 2️⃣ Preference-1 counts
        let preference1Counts: Record<string, number> = {};
        try {
          const prefRes = await axios.get<PreferenceData[]>(
            `http://98.130.122.229:5000/api/admin/electives/file-preferences/${file._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          prefRes.data.forEach((row) => {
            if (row.preference1) {
              preference1Counts[row.preference1] =
                (preference1Counts[row.preference1] || 0) + 1;
            }
          });
        } catch (err) {
          console.error("Preference API failed for file:", file._id);
        }

        // 3️⃣ Master electives
        let masterElectives: Subject[] = [];
        try {
          const masterRes = await axios.get<Subject[]>(
            `http://98.130.122.229:5000/api/admin/electives/master`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                regulation: file.regulation,
                department: file.department,
                semester: file.semester,
                electiveGroup: file.electiveType,
              },
            }
          );
          masterElectives = masterRes.data;
        } catch (err) {
          console.error("Master API failed for file:", file._id);
        }

        // 4️⃣ Check if this file already has allocations in DB
        let allocationDone = false;
        try {
          const allocRes = await axios.get(
            `http://98.130.122.229:5000/api/admin/electives/allocations/check/${file._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          allocationDone = allocRes.data.exists; // true/false from backend
        } catch (err) {
          console.error("Allocation check failed for file:", file._id);
        }

        stats.push({
          file,
          preference1Counts,
          masterElectives,
          allocationDone,
        });
      }

      setFileStats(stats);
    } catch (err) {
      console.error("MAIN ERROR:", err);
    }
  };

  // Handle selection checkboxes for electives
  const handleCheckboxChange = (fileId: string, code: string, checked: boolean) => {
    setSelectedElectivesMap(prev => {
      const prevSelected = prev[fileId] || [];
      const updated = checked
        ? [...prevSelected, code]
        : prevSelected.filter(c => c !== code);
      return { ...prev, [fileId]: updated };
    });
  };

  // Run allocation for selected electives
  const runAllocation = async () => {
    try {
      const token = localStorage.getItem("token");
      const allocations = Object.entries(selectedElectivesMap).map(([fileId, selectedElectives]) => ({
        fileId,
        selectedElectives,
      }));

      if (allocations.length === 0) {
        alert("No electives selected for allocation!");
        return;
      }

      await axios.post(
        "http://98.130.122.229:5000/api/admin/electives/run-allocation",
        { allocations },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Allocation completed successfully!");

      // Refresh file stats to reflect persisted allocations
      fetchSelectedFilesStats();

    } catch (err) {
      console.error("Allocation Error:", err);
      alert("Failed to run allocation. Check console.");
    }
  };

  // Download allocation Excel
  const handleDownload = async (fileId: string) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://98.130.122.229:5000/api/admin/electives/allocations/${fileId}/download`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `allocation-${fileId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download Excel", err);
      alert("Download failed. Check console.");
    }
  };

  return (
    <div className="admin-analyzed-data">
      <h2>Analyzed Files - Preference 1 Stats</h2>

      {fileStats.length === 0 ? (
        <p>No files selected for analysis.</p>
      ) : (
        <>
          {fileStats.map(({ file, preference1Counts, masterElectives, allocationDone }) => (
            <div key={file._id} className="file-stat-card">
              <h3>
                {file.regulation}-{file.department}-{file.semester}-{file.electiveType}{" "}
                {allocationDone && <span style={{ color: "green" }}>✅ Already Allocated</span>}
              </h3>

              {/* Preference-1 Table */}
              {Object.keys(preference1Counts).length === 0 ? (
                <p>No Preference-1 data found.</p>
              ) : (
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Elective Name</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(preference1Counts).map(([elective, count]) => (
                      <tr key={elective}>
                        <td>{elective}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Master electives selection */}
              {masterElectives.length > 0 && (
                <div className="master-checkboxes">
                  <h4>Select electives for allocation</h4>
                  {masterElectives.map((subj) => (
                    <div key={subj.code}>
                      <label>
                        <input
                          type="checkbox"
                          value={subj.code}
                          checked={selectedElectivesMap[file._id]?.includes(subj.code) || false}
                          onChange={(e) => handleCheckboxChange(file._id, subj.code, e.target.checked)}
                        />
                        {` ${subj.name} (${subj.code})`}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Download button if allocation exists */}
              {allocationDone && (
                <button className="download-btn" onClick={() => handleDownload(file._id)}>
                  Download Allocation Excel
                </button>
              )}
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button className="run-allocation-btn" onClick={runAllocation}>
              Run Allocation
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyzedData;
