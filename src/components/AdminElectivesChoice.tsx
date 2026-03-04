import { useNavigate } from "react-router-dom";
import "./AdminElectivesChoice.css";

const AdminElectivesChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="electives-choice-container">
      <h1>Electives Management</h1>

      <div className="choice-buttons">
        <button onClick={() => navigate("/admin/electives-upload")}>
          📤 Upload Electives
        </button>

        <button onClick={() => navigate("/admin/electives-check-update")}>
          🔍 Check / Update Electives
        </button>
      </div>
    </div>
  );
};

export default AdminElectivesChoice;
