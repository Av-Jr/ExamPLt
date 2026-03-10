import { useState, useEffect } from "react";
import ExamCreator from "./ExamCreator.jsx";
import "./Dashboard.css";

export default function TeacherDashboard({ user, onLogout }) {
  const [isCreating, setIsCreating] = useState(false);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [status, setStatus] = useState("");

  const fetchGroups = async () => {
    const res = await fetch(`http://localhost:5001/my-groups/${user.username}/teacher`);
    const data = await res.json();
    if (data.ok) setGroups(data.groups);
  };

  useEffect(() => { fetchGroups(); }, [user.username]);

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    const res = await fetch("http://localhost:5001/create-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher: user.username, groupName: newGroupName })
    });
    const data = await res.json();
    if (data.ok) {
      setNewGroupName("");
      setStatus(`Created: ${data.group.code}`);
      fetchGroups();
    }
  };

  if (isCreating) return <div className="DashScene"><ExamCreator user={user} onBack={() => setIsCreating(false)} /></div>;

  return (
    <div className="DashScene">
      <div className="DashCard">
        <div className="DashHeader">
          <h1>Teacher Dashboard</h1>
          <button className="DashBtn" onClick={onLogout}>Logout</button>
        </div>
        <div className="DashGrid">
          <div className="DashSection">
            <h3>Groups</h3>
            <input placeholder="Group Name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
            <button className="DashBtn" onClick={handleCreateGroup}>Generate Group</button>
            <div className="List">
              {groups.map(g => <div key={g.id} className="Item"><strong>{g.name}</strong>: {g.code}</div>)}
            </div>
          </div>
          <div className="DashSection">
            <h3>Exams</h3>
            <button className="DashBtn" onClick={() => setIsCreating(true)}>Launch Exam Creator</button>
          </div>
        </div>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}