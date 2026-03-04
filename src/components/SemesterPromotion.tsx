// import { useState } from "react";
// import "./SemesterPromotion.css";

// const departments = [
//   "CSE",
//   "IT",
//   "ECE",
//   "EEE",
//   "MECH",
//   "CIVIL",
//   "AIDS",
//   "AIML",
//   "CHE",
//   "BIOTECH",
//   "MCA",
//   "MBA",
//   "IOT",
// ];

// export default function SemesterPromotion() {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [selectedDept, setSelectedDept] = useState<string | null>(null);
//   const [selectedSem, setSelectedSem] = useState<number | null>(null);

//   const handlePromote = async (dept: string, sem: number) => {
//     setLoading(true);
//     setMessage("");

//     const response = await fetch("http://localhost:5000/api/promote", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ department: dept, semester: sem }),
//     });

//     const data = await response.json();
//     setMessage(data.message);
//     setLoading(false);
//   };

//   return (
//     <div className="promotion-page">
//       <h1 className="promotion-title">🎓 Semester Promotion</h1>
//       {message && <p className="message">{message}</p>}

//       <div className="dept-grid">
//         {departments.map((dept) => (
//           <div
//             key={dept}
//             className={`dept-card ${selectedDept === dept ? "active" : ""}`}
//           >
//             <h2
//               className="dept-header"
//               onClick={() =>
//                 setSelectedDept(selectedDept === dept ? null : dept)
//               }
//             >
//               {dept} {selectedDept === dept ? "▲" : "▼"}
//             </h2>

//             {selectedDept === dept && (
//               <div className="dropdown-section">
//                 <select
//                   className="sem-dropdown"
//                   onChange={(e) => setSelectedSem(Number(e.target.value))}
//                   defaultValue=""
//                 >
//                   <option value="" disabled>
//                     Select Semester
//                   </option>
//                   {Array.from(
//                     { length: ["MCA", "MBA"].includes(dept) ? 4 : 8 },
//                     (_, i) => i + 1
//                   ).map((sem) => (
//                     <option key={sem} value={sem}>
//                       {sem === (["MCA", "MBA"].includes(dept) ? 4 : 8)
//                         ? "Mark Completed"
//                         : `Promote Sem ${sem} → ${sem + 1}`}
//                     </option>
//                   ))}
//                 </select>

//                 <button
//                   className="promote-btn"
//                   disabled={loading || !selectedSem}
//                   onClick={() => selectedSem && handlePromote(dept, selectedSem)}
//                 >
//                   {loading ? "Processing..." : "Promote"}
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import "./SemesterPromotion.css";

const departments = [
  "CSE", "IT", "ECE", "EEE", "MECH", "CIVIL",
  "AIDS", "AIML", "CHE", "BIOTECH", "MCA", "MBA", "IOT"
];

export default function SemesterPromotion() {
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [detainedFile, setDetainedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePromote = async () => {
    if (!selectedDept || !selectedSem) {
      alert("Please select both department and semester");
      return;
    }

    const formData = new FormData();
    formData.append("department", selectedDept);
    formData.append("semester", selectedSem);

    if (detainedFile) {
      formData.append("file", detainedFile);
    }

    setLoading(true);
    setMessage("");

    const response = await fetch("http://localhost:5000/api/promote", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setMessage(data.message);
    setLoading(false);
  };

  return (
    <div className="promotion-page">

      <h1 className="promotion-title">Semester Promotion</h1>

      {message && <p className="message">{message}</p>}

      {/* Department Select */}
      <select
        className="sem-dropdown"
        value={selectedDept}
        onChange={(e) => setSelectedDept(e.target.value)}
      >
        <option value="">Select Department</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Semester Select */}
      {selectedDept && (
        <select
          className="sem-dropdown"
          value={selectedSem}
          onChange={(e) => setSelectedSem(e.target.value)}
        >
          <option value="">Select Semester</option>

          {Array.from(
            { length: ["MCA", "MBA"].includes(selectedDept) ? 4 : 8 },
            (_, i) => i + 1
          ).map((sem) => (
            <option key={sem} value={sem}>
              Promote Sem {sem} → {sem + 1}
            </option>
          ))}
        </select>
      )}

      {/* File Upload */}
      {selectedSem && (
        <div className="upload-box">
  <p>Upload Detained Students File (CSV / XLSX)</p>

  <button
    className="upload-btn"
    onClick={() => document.getElementById("detainedFile")?.click()}
  >
    Choose File
  </button>

  <input
    id="detainedFile"
    type="file"
    accept=".csv,.xlsx"
    style={{ display: "none" }}
    onChange={(e) => setDetainedFile(e.target.files?.[0] || null)}
  />

  {detainedFile && <p className="file-name">{detainedFile.name}</p>}
</div>

      )}

      {/* Promote Button */}
      <button
        className="promote-btn"
        disabled={loading || !selectedSem}
        onClick={handlePromote}
      >
        {loading ? "Processing..." : "Promote"}
      </button>
    </div>
  );
}

