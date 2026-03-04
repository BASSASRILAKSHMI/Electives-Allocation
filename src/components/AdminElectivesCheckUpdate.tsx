import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminElectivesCheckUpdate.css";
import { useNavigate } from "react-router-dom";

interface ElectiveMeta {
  regulation: string;
  department: string;
  semester: string;
}

const AdminElectivesCheckUpdate = () => {
  const [metaData, setMetaData] = useState<ElectiveMeta[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const token = localStorage.getItem("token"); // 🔥 Admin token
        const res = await axios.get<ElectiveMeta[]>(
          "http://localhost:5000/api/admin/electives/meta",
          {
            headers: {
              Authorization: `Bearer ${token}`, // 🔑 send token to backend
            },
          }
        );
        setMetaData(res.data);
      } catch (err) {
        console.error("Failed to fetch electives metadata", err);
      }
    };

    fetchMeta();
  }, []);

  const handleSelect = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === metaData.length) {
      setSelected([]); // unselect all
    } else {
      setSelected(metaData.map((item) => `${item.regulation}-${item.department}-${item.semester}`));
    }
  };

  const handleView = () => {
    if (selected.length === 1) {
      navigate(`/admin/electives-check-update/${selected[0]}`);
    } else if (selected.length === 0) {
      alert("Please select at least one elective to view");
    } else {
      alert("Please select only one elective to view");
    }
  };

  const handleOtherAction = () => {
  navigate("/admin/electives-upload");
};

  return (
    <div className="check-update-container">
      <h1>Electives - Check / Update</h1>

      {metaData.length === 0 ? (
        <p>No electives uploaded yet for your department.</p>
      ) : (
        <>
          <div className="select-all-container">
            <input
              type="checkbox"
              id="select-all"
              checked={selected.length === metaData.length && metaData.length > 0}
              onChange={handleSelectAll}
            />
            <label htmlFor="select-all">Select All</label>
          </div>

          <div className="checkbox-grid">
            {metaData.map((item) => {
              const key = `${item.regulation}-${item.department}-${item.semester}`;
              const isSelected = selected.includes(key);

              return (
                <div key={key} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={key}
                    checked={isSelected}
                    onChange={() => handleSelect(key)}
                  />
                  <label htmlFor={key}>
                    {item.regulation} - {item.department} - {item.semester}
                  </label>
                </div>
              );
            })}
          </div>

          <div className="action-buttons">
            <button
              onClick={handleOtherAction}
              disabled={selected.length > 0}
            >
              Other
            </button>
            <button
              onClick={handleView}
              disabled={selected.length === 0}
            >
              View
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminElectivesCheckUpdate;
