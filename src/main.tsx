import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App"; 
import StudentElectives from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import StudentRegistration from "./components/StudentRegistration";
import ChangePassword from "./components/ChangePassword";
import SemesterPromotion from "./components/SemesterPromotion"; 
import AdminElectivesChoice from "./components/AdminElectivesChoice";
import AdminElectivesUpload from "./components/AdminElectivesUpload";
import AdminElectivesCheckUpdate from "./components/AdminElectivesCheckUpdate";
import AdminElectivesDetail from "./components/AdminElectivesDetail";
import AdminElectivesCirculate from "./components/AdminElectivesCirculate";
import AdminPreferencesFiles from "./components/AdminPreferencesFiles";
import AdminAnalyzedData from "./components/AdminAnalyzedData";

 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />                    {/* Login/Register page */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/student-registration" element={<StudentRegistration />} /> 
        <Route path="/student-electives" element={<StudentElectives />} /> 
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/semester-promotion" element={<SemesterPromotion />} />
        <Route path="/admin/electives-choice" element={<AdminElectivesChoice />} />
        <Route path="/admin/electives-check-update/:key" element={<AdminElectivesDetail />} />
        <Route path="/admin/electives-upload" element={<AdminElectivesUpload />} />
        <Route
  path="/admin/electives-check-update"
  element={<AdminElectivesCheckUpdate />}
/>
<Route
  path="/admin/electives-circulate"
  element={<AdminElectivesCirculate />}
/>;

<Route
  path="/admin/preferences-files"
  element={<AdminPreferencesFiles />}
/>

<Route
  path="/admin/analyzed-data"
  element={<AdminAnalyzedData />}
/>


  


        {/* You can add student dashboard route later */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
