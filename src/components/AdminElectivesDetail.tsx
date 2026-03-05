import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminElectivesDetail.css";

interface Elective {
  code: string;
  name: string;
}

interface ElectiveGroup {
  electiveGroup: string;
  subjects: Elective[];
}

interface ElectivesData {
  regulation: string;
  department: string;
  semester: string;
  electiveGroups: ElectiveGroup[];
}

const AdminElectivesDetail = () => {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [electivesData, setElectivesData] = useState<ElectivesData | null>(null);

  // Split key into separate parts
  const [regulation, department, semester] = key!.split("-");

  useEffect(() => {
    const fetchElectives = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<ElectivesData>(
          "http://98.130.122.229:5000/api/admin/electives",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { regulation, department, semester },
          }
        );
        console.log("Fetched electives:", res.data);
        setElectivesData(res.data);
      } catch (err) {
        console.error("Failed to fetch electives", err);
        alert("Failed to fetch electives");
      }
    };

    fetchElectives();
  }, [regulation, department, semester]);

  const handleChangeSubject = (
    groupIndex: number,
    subIndex: number,
    field: "code" | "name",
    value: string
  ) => {
    if (!electivesData) return;
    const newData = { ...electivesData };
    newData.electiveGroups[groupIndex].subjects[subIndex][field] = value;
    setElectivesData(newData);
  };

  const handleAddSubject = (groupIndex: number) => {
    if (!electivesData) return;
    const newData = { ...electivesData };
    newData.electiveGroups[groupIndex].subjects.push({ code: "", name: "" });
    setElectivesData(newData);
  };

  const handleUpdateGroup = async (groupIndex: number) => {
    if (!electivesData) return;

    try {
      const token = localStorage.getItem("token");
      const group = electivesData.electiveGroups[groupIndex];
      await axios.put(
        `http://98.130.122.229:5000/api/admin/electives/update-group`,
        { regulation, department, semester, groupIndex, group },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Group updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update group");
    }
  };

  const handleSaveAll = async () => {
    if (!electivesData) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://98.130.122.229:5000/api/admin/electives/update-all`,
        { regulation, department, semester, electivesData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("All changes saved successfully");
      navigate("/admin/electives-check-update");
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    }
  };

  if (!electivesData) return <p>Loading electives...</p>;

  return (
    <div className="electives-detail-container">
      <h2>
        {electivesData.regulation} - {electivesData.department} - {electivesData.semester}
      </h2>

      {electivesData.electiveGroups?.map((group, groupIndex) => (
        <div key={groupIndex} className="elective-group">
          <h3>{group.electiveGroup}</h3>
          {group.subjects?.map((sub, subIndex) => (
            <div key={subIndex} className="subject-row">
              <input
                type="text"
                value={sub.code}
                placeholder="Code"
                onChange={(e) =>
                  handleChangeSubject(groupIndex, subIndex, "code", e.target.value)
                }
              />
              <input
                type="text"
                value={sub.name}
                placeholder="Name"
                onChange={(e) =>
                  handleChangeSubject(groupIndex, subIndex, "name", e.target.value)
                }
              />
            </div>
          ))}
          <button onClick={() => handleAddSubject(groupIndex)}>➕ Add Subject</button>
          <button onClick={() => handleUpdateGroup(groupIndex)}>💾 Update Group</button>
        </div>
      ))}

      <button className="save-all-btn" onClick={handleSaveAll}>
        💾 Save All Changes
      </button>
    </div>
  );
};

export default AdminElectivesDetail;
