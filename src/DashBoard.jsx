import TeacherDashboard from "./TeacherDashboard.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import "./Dashboard.css";

export default function DashBoard({ user, onLogout }) {
  return (
    <div className="DashScene">
      {user.role === "teacher" ? (
        <TeacherDashboard user={user} onLogout={onLogout} />
      ) : (
        <StudentDashboard user={user} onLogout={onLogout} />
      )}
    </div>
  );
}