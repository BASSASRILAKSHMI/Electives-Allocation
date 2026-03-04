// import { useEffect, useState } from "react";
// import axios from "axios";
// import "./StudentDashboard.css";

// interface Subject {
//   code: string;
//   name: string;
// }

// interface ElectiveGroup {
//   electiveGroup: string;
//   subjects: Subject[];
// }

// interface Student {
//   name: string;
//   rollno: string;
//   department: string;
//   semester: string;
//   regulation: string;
// }

// interface Preferences {
//   [groupName: string]: {
//     [subjectCode: string]: number;
//   };
// }

// const StudentDashboard: React.FC = () => {
//   const [student, setStudent] = useState<Student | null>(null);
//   const [electives, setElectives] = useState<ElectiveGroup[]>([]);
//   const [preferences, setPreferences] = useState<Preferences>({});
//   const [alreadySubmitted, setAlreadySubmitted] = useState(false);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(true);

//   // ---------------- Fetch electives ----------------
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("studentToken");
//         if (!token) {
//           setMessage("Not logged in. Please login to see electives.");
//           setLoading(false);
//           return;
//         }

//         const res = await axios.get(
//           "http://localhost:5000/api/student/electives",
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const { student, electives, alreadySubmitted } = res.data;

//         setStudent(student);
//         setAlreadySubmitted(alreadySubmitted);

//         if (!electives || electives.length === 0) {
//           setMessage("Electives not yet circulated by admin.");
//         } else {
//           setElectives(electives);
//         }

//         if (alreadySubmitted) {
//           setMessage("✅ You have already submitted your preferences.");
//         }

//         setLoading(false);
//       } catch (err: any) {
//         console.error(err);
//         setMessage(err.response?.data?.message || "Failed to load electives");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // ---------------- Preference change handler ----------------
//   const handlePreferenceChange = (
//     groupName: string,
//     subjectCode: string,
//     value: number
//   ) => {
//     if (alreadySubmitted) return;

//     const groupPrefs = preferences[groupName] || {};

//     const usedPreferences = Object.entries(groupPrefs)
//       .filter(([code]) => code !== subjectCode)
//       .map(([, pref]) => pref);

//     if (usedPreferences.includes(value)) {
//       alert("Each preference must be unique within the group!");
//       return;
//     }

//     setPreferences((prev) => ({
//       ...prev,
//       [groupName]: {
//         ...prev[groupName],
//         [subjectCode]: value,
//       },
//     }));
//   };

//   // ---------------- Submit preferences ----------------
//   const handleSubmit = async () => {
//     for (let group of electives) {
//       const groupPrefs = preferences[group.electiveGroup] || {};

//       for (let subject of group.subjects) {
//         if (!groupPrefs[subject.code]) {
//           alert(
//             `Please set preference for ${subject.name} in ${group.electiveGroup}`
//           );
//           return;
//         }
//       }
//     }

//     try {
//       const token = localStorage.getItem("studentToken");

//       await axios.post(
//         "http://localhost:5000/api/student/electives/preferences",
//         { preferences },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert("Preferences submitted successfully!");
//       setAlreadySubmitted(true);
//       setMessage("✅ You have already submitted your preferences.");
//     } catch (err: any) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to submit preferences");
//     }
//   };

//   if (loading) return <p>Loading electives...</p>;

//   return (
//     <div className="student-dashboard-container">
//       {student && (
//         <div className="student-info">
//           <h2>Welcome, {student.name}</h2>
//           <p>
//             <strong>Roll No:</strong> {student.rollno} <br />
//             <strong>Department:</strong> {student.department} <br />
//             <strong>Semester:</strong> {student.semester} <br />
//             <strong>Regulation:</strong> {student.regulation}
//           </p>
//         </div>
//       )}

//       <hr className="divider" />

//       {message && <p className="status-message">{message}</p>}

//       {!message &&
//         electives.map((group, idx) => (
//           <div className="elective-group-card" key={idx}>
//             <h3>{group.electiveGroup}</h3>

//             <table className="elective-table">
//               <thead>
//                 <tr>
//                   <th>Code</th>
//                   <th>Name</th>
//                   <th>Preference</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {group.subjects.map((sub) => (
//                   <tr key={sub.code}>
//                     <td>{sub.code}</td>
//                     <td>{sub.name}</td>
//                     <td>
//                       <select
//                         disabled={alreadySubmitted}
//                         value={
//                           preferences[group.electiveGroup]?.[sub.code] || ""
//                         }
//                         onChange={(e) =>
//                           handlePreferenceChange(
//                             group.electiveGroup,
//                             sub.code,
//                             Number(e.target.value)
//                           )
//                         }
//                       >
//                         <option value="">--Select--</option>
//                         {Array.from(
//                           { length: group.subjects.length },
//                           (_, i) => i + 1
//                         ).map((num) => (
//                           <option key={num} value={num}>
//                             {num}
//                           </option>
//                         ))}
//                       </select>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ))}

//       {electives.length > 0 && !alreadySubmitted && (
//         <button className="submit-btn" onClick={handleSubmit}>
//           Submit Preferences
//         </button>
//       )}
//     </div>
//   );
// };

// export default StudentDashboard;

import { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDashboard.css";

interface Subject {
  code: string;
  name: string;
}

interface ElectiveGroup {
  electiveGroup: string;
  subjects: Subject[];
}

interface Student {
  name: string;
  rollno: string;
  department: string;
  semester: string;
  regulation: string;
}

interface Preferences {
  [groupName: string]: {
    [subjectCode: string]: number;
  };
}

interface AllocatedElective {
  semester: string;
  electiveType: string;
  allocatedElective: {
    code: string;
    name: string;
  };
}

const StudentDashboard: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [electives, setElectives] = useState<ElectiveGroup[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [allocatedElectives, setAllocatedElectives] = useState<AllocatedElective[]>([]);

  // ---------------- Fetch electives & allocations ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token) {
          setMessage("Not logged in. Please login to see electives.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "http://localhost:5000/api/student/electives",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { student, electives, alreadySubmitted, allocatedElectives } = res.data;

        setStudent(student);
        setAlreadySubmitted(alreadySubmitted);

        if (!electives || electives.length === 0) {
          setMessage("Electives not yet circulated by admin.");
        } else {
          setElectives(electives);
        }

        if (alreadySubmitted) {
          setMessage("✅ You have already submitted your preferences.");
        }

        if (allocatedElectives && allocatedElectives.length > 0) {
          setAllocatedElectives(allocatedElectives);
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setMessage(err.response?.data?.message || "Failed to load electives");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------- Preference change handler ----------------
  const handlePreferenceChange = (
    groupName: string,
    subjectCode: string,
    value: number
  ) => {
    if (alreadySubmitted) return;

    // Disable changing allocated electives
    const isAllocated = allocatedElectives.some(
      (a) =>
        a.electiveType === groupName &&
        a.allocatedElective.code === subjectCode &&
        a.semester === student?.semester
    );
    if (isAllocated) return;

    const groupPrefs = preferences[groupName] || {};
    const usedPreferences = Object.entries(groupPrefs)
      .filter(([code]) => code !== subjectCode)
      .map(([, pref]) => pref);

    if (usedPreferences.includes(value)) {
      alert("Each preference must be unique within the group!");
      return;
    }

    setPreferences((prev) => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [subjectCode]: value,
      },
    }));
  };

  // ---------------- Submit preferences ----------------
  const handleSubmit = async () => {
    for (let group of electives) {
      const groupPrefs = preferences[group.electiveGroup] || {};

      for (let subject of group.subjects) {
        const isAllocated = allocatedElectives.some(
          (a) =>
            a.electiveType === group.electiveGroup &&
            a.allocatedElective.code === subject.code &&
            a.semester === student?.semester
        );
        if (isAllocated) continue;

        if (!groupPrefs[subject.code]) {
          alert(
            `Please set preference for ${subject.name} in ${group.electiveGroup}`
          );
          return;
        }
      }
    }

    try {
      const token = localStorage.getItem("studentToken");

      await axios.post(
        "http://localhost:5000/api/student/electives/preferences",
        { preferences },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Preferences submitted successfully!");
      setAlreadySubmitted(true);
      setMessage("✅ You have already submitted your preferences.");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit preferences");
    }
  };

  if (loading) return <p>Loading electives...</p>;

  return (
    <div className="student-dashboard-container">
      {student && (
        <div className="student-info">
          <h2>Welcome, {student.name}</h2>
          <p>
            <strong>Roll No:</strong> {student.rollno} <br />
            <strong>Department:</strong> {student.department} <br />
            <strong>Semester:</strong> {student.semester} <br />
            <strong>Regulation:</strong> {student.regulation}
          </p>
        </div>
      )}

      <hr className="divider" />

      {/* Allocated electives table */}
      {allocatedElectives.length > 0 && (
        <div className="allocated-electives-table">
          <h3>ASSIGNED ELECTIVES</h3>
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>Elective Type</th>
                <th>Allocated Elective</th>
              </tr>
            </thead>
            <tbody>
              {allocatedElectives.map((a, idx) => (
                <tr key={idx}>
                  <td>{a.semester}</td>
                  <td>{a.electiveType}</td>
                  <td>
                    {a.allocatedElective.name} ({a.allocatedElective.code})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && <p className="status-message">{message}</p>}

      {/* Preference form */}
      {!message &&
        electives.map((group, idx) => (
          <div className="elective-group-card" key={idx}>
            <h3>{group.electiveGroup}</h3>

            <table className="elective-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Preference</th>
                </tr>
              </thead>
              <tbody>
                {group.subjects.map((sub) => {
                  const isAllocated = allocatedElectives.some(
                    (a) =>
                      a.electiveType === group.electiveGroup &&
                      a.allocatedElective.code === sub.code &&
                      a.semester === student?.semester
                  );
                  return (
                    <tr key={sub.code}>
                      <td>{sub.code}</td>
                      <td>{sub.name}</td>
                      <td>
                        {isAllocated ? (
                          <span>Allocated ✅</span>
                        ) : (
                          <select
                            disabled={alreadySubmitted}
                            value={
                              preferences[group.electiveGroup]?.[sub.code] || ""
                            }
                            onChange={(e) =>
                              handlePreferenceChange(
                                group.electiveGroup,
                                sub.code,
                                Number(e.target.value)
                              )
                            }
                          >
                            <option value="">--Select--</option>
                            {Array.from(
                              { length: group.subjects.length },
                              (_, i) => i + 1
                            ).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

      {electives.length > 0 && !alreadySubmitted && (
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Preferences
        </button>
      )}
    </div>
  );
};

export default StudentDashboard;
