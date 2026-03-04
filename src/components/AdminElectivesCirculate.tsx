import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminElectivesCirculate.css";

interface ElectiveMeta {
  regulation: string;
  department: string;
  semester: string;
  isActive?: boolean; // whether currently circulated
}

const AdminElectivesCirculate: React.FC = () => {
  const [electivesMeta, setElectivesMeta] = useState<ElectiveMeta[]>([]);
  const [toCirculate, setToCirculate] = useState<string[]>([]);
  const [toStop, setToStop] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchElectivesMeta = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "http://localhost:5000/api/admin/electives/meta",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Separate into active and inactive
        const allElectives = res.data.map((e: ElectiveMeta) => ({
          ...e,
          isActive: e.isActive || false,
        }));

        setElectivesMeta(allElectives);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchElectivesMeta();
  }, []);

  // ------------------ Helpers ------------------
  const toggleOne = (value: string, type: "circulate" | "stop") => {
    if (type === "circulate") {
      setToCirculate((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else {
      setToStop((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  };

  const toggleSelectAll = (type: "circulate" | "stop") => {
    if (type === "circulate") {
      if (toCirculate.length === electivesMeta.filter(e => !e.isActive).length) {
        setToCirculate([]);
      } else {
        const allValues = electivesMeta
          .filter(e => !e.isActive)
          .map(e => `${e.regulation}-${e.department}-${e.semester}`);
        setToCirculate(allValues);
      }
    } else {
      if (toStop.length === electivesMeta.filter(e => e.isActive).length) {
        setToStop([]);
      } else {
        const allValues = electivesMeta
          .filter(e => e.isActive)
          .map(e => `${e.regulation}-${e.department}-${e.semester}`);
        setToStop(allValues);
      }
    }
  };

  // ------------------ Actions ------------------
  const handleCirculate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/admin/electives/circulate",
        { selected: toCirculate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Electives circulated successfully!");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to circulate electives");
    }
  };

  const handleStop = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/admin/electives/stop-circulation",
        { selected: toStop },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Electives stopped successfully!");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to stop circulation");
    }
  };

  if (loading) return <p>Loading electives...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // ------------------ Split electives ------------------
  const inactiveElectives = electivesMeta.filter(e => !e.isActive);
  const activeElectives = electivesMeta.filter(e => e.isActive);

  return (
    <div className="electives-circulate-container">
      <h1>Electives Circulation</h1>

      {/* ---------------- Inactive Electives (To Circulate) ---------------- */}
      <div className="section">
        <h2>Electives to Circulate</h2>
        {inactiveElectives.length > 0 && (
          <button className="select-all-btn" onClick={() => toggleSelectAll("circulate")}>
            {toCirculate.length === inactiveElectives.length ? "Unselect All" : "Select All"}
          </button>
        )}

        {inactiveElectives.length === 0 ? (
          <p>All electives are currently circulated.</p>
        ) : (
          <ul className="electives-list">
            {inactiveElectives.map((e, idx) => {
              const value = `${e.regulation}-${e.department}-${e.semester}`;
              return (
                <li key={idx}>
                  <label className="elective-card">
                    <input
                      type="checkbox"
                      checked={toCirculate.includes(value)}
                      onChange={() => toggleOne(value, "circulate")}
                    />
                    <span>{value}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        {inactiveElectives.length > 0 && (
          <button className="circulate-btn" disabled={toCirculate.length === 0} onClick={handleCirculate}>
            Circulate
          </button>
        )}
      </div>

      {/* ---------------- Active Electives (Stop Circulation) ---------------- */}
      <div className="section" style={{ marginTop: "40px" }}>
        <h2>Currently Circulating Electives</h2>
        {activeElectives.length > 0 && (
          <button className="select-all-btn" onClick={() => toggleSelectAll("stop")}>
            {toStop.length === activeElectives.length ? "Unselect All" : "Select All"}
          </button>
        )}

        {activeElectives.length === 0 ? (
          <p>No electives are currently circulated.</p>
        ) : (
          <ul className="electives-list">
            {activeElectives.map((e, idx) => {
              const value = `${e.regulation}-${e.department}-${e.semester}`;
              return (
                <li key={idx}>
                  <label className="elective-card">
                    <input
                      type="checkbox"
                      checked={toStop.includes(value)}
                      onChange={() => toggleOne(value, "stop")}
                    />
                    <span>{value}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        {activeElectives.length > 0 && (
          <button className="stop-btn" disabled={toStop.length === 0} onClick={handleStop}>
            Stop Circulation
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminElectivesCirculate;
