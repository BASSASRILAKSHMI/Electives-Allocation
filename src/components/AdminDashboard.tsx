import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        <div className="button-container">
          <button onClick={() => navigate("/student-registration")}>
            Register Students
          </button>

          <button onClick={() => navigate("/semester-promotion")}>
            Semester Promotion
          </button>

          <button onClick={() => navigate("/admin/electives-choice")}>
            Electives UPLOAD
          </button>

           
          <button onClick={() => navigate("/admin/electives-circulate")}>
  Electives Circulation
</button>

<button onClick={() => navigate("/admin/preferences-files")}>
Preferences Files
</button>

<button onClick={() => navigate("/admin/analyzed-data")}>
Analyzed Data
</button>



        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
