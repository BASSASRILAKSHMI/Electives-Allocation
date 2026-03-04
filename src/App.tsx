// import axios from "axios";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./App.css";

// function App() {
//   const navigate = useNavigate();
//   const [role, setRole] = useState<"student" | "admin">("student");
//   const [isRegister, setIsRegister] = useState(false);

//   // Student fields
//   const [fullName, setFullName] = useState("");
//   const [rollNumber, setRollNumber] = useState("");
//   const [department, setDepartment] = useState("");
//   const [semester, setSemester] = useState("");
//   const [section, setSection] = useState("");

//   // Admin fields
//   const [facultyId, setFacultyId] = useState("");
//   const [name, setName] = useState("");
//   const [adminDepartment, setAdminDepartment] = useState("");

//   // Common
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // Message for feedback
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (isRegister) {
//         // ------------------ REGISTER ------------------
//         if (role === "student") {
//           const res = await axios.post("http://localhost:5000/api/auth/register/student", {
//             fullName,
//             rollNumber,
//             department,
//             semester,
//             section,
//             email,
//             password,
//           });
//           setMessage(res.data.message);
//         } else {
//           const res = await axios.post("http://localhost:5000/api/auth/register/admin", {
//             facultyId,
//             name,
//             department: adminDepartment,
//             email,
//             password,
//           });
//           setMessage(res.data.message);
//         }
//       } else {
//         // ------------------ LOGIN ------------------
//         if (role === "student") {
//   const res = await axios.post("http://localhost:5000/api/auth/login/student", {
//     email,
//     password,
//   });

//   setMessage(res.data.message);

//   if (res.status === 200 && res.data.student) {
//     // ✅ Save complete student info in localStorage
//     localStorage.setItem(
//       "student",
//       JSON.stringify({
//         id: res.data.student.id,
//         fullName: res.data.student.fullName,
//         rollNumber: res.data.student.rollNumber,
//         department: res.data.student.department,
//         semester: res.data.student.semester,
//         section: res.data.student.section,
//         email: res.data.student.email,
//       })
//     );

//     // ✅ Navigate to student electives
//     navigate("/student-electives");
//   }
// }
//  else {
//           const res = await axios.post("http://localhost:5000/api/auth/login/admin", {
//             email,
//             password,
//           });
//           setMessage(res.data.message);
//           if (res.status === 200) {
//   localStorage.setItem("admin", JSON.stringify(res.data.admin));

//   // ✅ Redirect to Admin Dashboard instead
//   navigate("/admin/dashboard");
// }

//         }
//       }
//     } catch (err: any) {
//       setMessage(err.response?.data?.error || "Something went wrong");
//     }
//   };

//   return (
//     <div className="homepage">
//       <div className="overlay">
//         <div className="container">
//           {/* Project Title */}
//           <h1 className="project-title">
//             Elective Preference <span>&</span> Allocation System
//           </h1>
//           <br />

//           {/* Role Toggle */}
//           <div className="toggle-container">
//             <div className={`toggle ${role === "student" ? "student-active" : "admin-active"}`}>
//               <button
//                 className={`toggle-btn ${role === "student" ? "active" : ""}`}
//                 onClick={() => setRole("student")}
//               >
//                 Student
//               </button>
//               <button
//                 className={`toggle-btn ${role === "admin" ? "active" : ""}`}
//                 onClick={() => setRole("admin")}
//               >
//                 Admin
//               </button>
//             </div>
//           </div>

//           {/* Login/Register Toggle */}
//           <div className="login-register-toggle">
//             <span
//               className={`toggle-text ${!isRegister ? "active" : ""}`}
//               onClick={() => setIsRegister(false)}
//             >
//               Login
//             </span>
//             <span
//               className={`toggle-text ${isRegister ? "active" : ""}`}
//               onClick={() => setIsRegister(true)}
//             >
//               Register
//             </span>
//           </div>

//           {/* Form */}
//           <div className="form-container">
//             <h2>
//               {isRegister ? "Register" : "Login"} as{" "}
//               {role === "student" ? "Student" : "Admin"}
//             </h2>

//             <form onSubmit={handleSubmit}>
//               {isRegister && role === "student" && (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Full Name"
//                     value={fullName}
//                     onChange={(e) => setFullName(e.target.value)}
//                     required
//                   />
//                   <input
//                     type="text"
//                     placeholder="Roll Number"
//                     value={rollNumber}
//                     onChange={(e) => setRollNumber(e.target.value)}
//                     required
//                   />
//                   <input
//                     type="text"
//                     placeholder="Department"
//                     value={department}
//                     onChange={(e) => setDepartment(e.target.value)}
//                     required
//                   />
//                   <input
//                     type="text"
//                     placeholder="Semester"
//                     value={semester}
//                     onChange={(e) => setSemester(e.target.value)}
//                     required
//                   />
//                   <input
//                     type="text"
//                     placeholder="Section"
//                     value={section}
//                     onChange={(e) => setSection(e.target.value)}
//                     required
//                   />
//                 </>
//               )}

//               {isRegister && role === "admin" && (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Faculty ID"
//                     value={facultyId}
//                     onChange={(e) => setFacultyId(e.target.value)}
//                     required
//                   />
//                   <input
//                     type="text"
//                     placeholder="Name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required
//                   />
//                   <input
//                     type="text"
//                     placeholder="Department"
//                     value={adminDepartment}
//                     onChange={(e) => setAdminDepartment(e.target.value)}
//                     required
//                   />
//                 </>
//               )}

//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />

//               <button type="submit">
//                 {isRegister
//                   ? `Register as ${role === "student" ? "Student" : "Admin"}`
//                   : `Login as ${role === "student" ? "Student" : "Admin"}`}
//               </button>
//             </form>

//             {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "admin">("student");

  // 🧠 Replace email with rollno for student login
  const [rollno, setRollno] = useState("");
  const [email, setEmail] = useState(""); // still needed for admin login
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (role === "student") {
  const res = await axios.post("http://localhost:5000/api/auth/login/student", {
    rollno,
    password,
  });

  setMessage(res.data.message);

  if (res.status === 200 && res.data.student) {
    localStorage.setItem("studentToken", res.data.token); // ✅ store JWT
    localStorage.setItem("student", JSON.stringify(res.data.student)); // optional
    navigate("/student-electives");
  }
}
 else {
        // ✅ Admin login (still by email)
        const res = await axios.post("http://localhost:5000/api/auth/login/admin", {
          email,
          password,
        });

        setMessage(res.data.message);

        if (res.status === 200) {
  localStorage.setItem("token", res.data.token); // ✅ THIS WAS MISSING
  localStorage.setItem("admin", JSON.stringify(res.data.admin));
  navigate("/admin/dashboard");
}

      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="homepage">
      <div className="overlay">
        <div className="container">
          <h1 className="project-title">
            Elective Preference <span>&</span> Allocation System
          </h1>
          <br></br>

          {/* Role Toggle */}
          <div className="toggle-container">
            <div
              className={`toggle ${
                role === "student" ? "student-active" : "admin-active"
              }`}
            >
              <button
                className={`toggle-btn ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                Student
              </button>
              <button
                className={`toggle-btn ${role === "admin" ? "active" : ""}`}
                onClick={() => setRole("admin")}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <div className="form-container">
            <h2>Login as {role === "student" ? "Student" : "Admin"}</h2>

           <form onSubmit={handleSubmit}>
  {role === "student" ? (
    <input
      type="text"
      placeholder="Roll Number"
      value={rollno}
      onChange={(e) => setRollno(e.target.value)}
      required
    />
  ) : (
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
  )}

  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />

  <button type="submit">
    Login as {role === "student" ? "Student" : "Admin"}
  </button>

  {/* ✅ Add Change Password button here */}
  <button
    type="button" // important: prevent form submission
    className="change-password-btn"
    style={{ marginTop: "10px", backgroundColor: "#f0f0f0", color: "#333" }}
    onClick={() => navigate("/change-password")}
  >
    Change Password
  </button>
</form>

            {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
