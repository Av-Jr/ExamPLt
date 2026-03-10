// src/TeacherDashboard.jsx
import { useState, useEffect } from "react";
import GroupChat from "./GroupChat.jsx";
import ExamCreator from "./ExamCreator.jsx"; // Ensure this import is here
import "./Dashboard.css";

export default function TeacherDashboard({ user, onLogout }) {
  const [groups, setGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [groupName, setGroupName] = useState("");

  const loadData = async () => {
    try {
      const gRes = await fetch(`http://localhost:5001/my-groups/${user.username}/teacher`);
      const data = await gRes.json();
      if (data.ok) setGroups(data.groups || []);
    } catch (err) {
      console.error("Load error", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.username]);

  const handleCreateGroup = async () => {
    if (!groupName) return;
    const res = await fetch("http://localhost:5001/create-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher: user.username, groupName })
    });
    if ((await res.json()).ok) {
      setGroupName("");
      loadData();
    }
  };

  if (activeChat) {
    return (
      <div className="DashScene">
        <GroupChat groupId={activeChat} user={user} onBack={() => setActiveChat(null)} />
      </div>
    );
  }

  if (showCreator) {
    return (
      <div className="DashScene">
        <ExamCreator user={user} onBack={() => setShowCreator(false)} />
      </div>
    );
  }

  return (
    <div className="DashScene">
      <div className="DashCard">
        <div className="DashHeader">
          <h1>Teacher Dashboard</h1>
          <button className="DashBtn" onClick={onLogout}>Logout</button>
        </div>

        <div className="DashGrid">
          <div className="DashSection">
            <h3>Manage Groups</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <button className="DashBtn" onClick={handleCreateGroup}>Create</button>
            </div>
            <div className="List">
              {groups.map(g => (
                <div key={g.id} className="Item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{g.name} (Code: {g.code})</span>
                  <button className="DashBtn" onClick={() => setActiveChat(g.id)}>Chat</button>
                </div>
              ))}
            </div>
          </div>

          <div className="DashSection">
            <h3>Exam Management</h3>
            <button className="DashBtn" onClick={() => setShowCreator(true)}>+ Create New Exam</button>
          </div>
        </div>
      </div>
    </div>
  );
}