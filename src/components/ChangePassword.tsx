import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [identifier, setIdentifier] = useState(""); // rollno or email
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://98.130.122.229:5000/api/change-password", {
        role,
        identifier,
        newPassword,
      });

      setMessage(res.data.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>Change Password</h2>

        {/* Role Toggle */}
        <div
          className={`toggle-container ${
            role === "student" ? "student-active" : "admin-active"
          }`}
        >
          <button onClick={() => setRole("student")}>Student</button>
          <button onClick={() => setRole("admin")}>Admin</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={role === "student" ? "Roll Number" : "Email"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Change Password</button>
        </form>

        {/* Message */}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
