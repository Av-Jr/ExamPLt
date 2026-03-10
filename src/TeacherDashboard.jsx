import { useState, useEffect } from "react";
import ExamCreator from "./ExamCreator.jsx";
import GroupChat from "./GroupChat.jsx";
import "./Dashboard.css";

export default function TeacherDashboard({ user, onLogout }) {
  const [groups, setGroups] = useState([]);
  const [creatingForGroup, setCreatingForGroup] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [groupName, setGroupName] = useState("");

  const loadGroups = async () => {
    const res = await fetch(`http://localhost:5001/my-groups/${user.username}/teacher`);
    const data = await res.json();
    if (data.ok) setGroups(data.groups || []);
  };

  useEffect(() => { loadGroups(); }, [user.username]);

  if (activeChat) return <GroupChat groupId={activeChat} user={user} onBack={() => setActiveChat(null)} />;
  if (creatingForGroup) return <ExamCreator user={user} groupId={creatingForGroup} onBack={() => setCreatingForGroup(null)} />;

  return (
    <div className="DashCard">
      <div className="DashHeader">
        <h1>Teacher: {user.realName}</h1>
        <button className="DashBtn logout-btn" onClick={onLogout}>Logout</button>
      </div>
      <div className="DashGrid">
        <div className="DashSection">
          <h3>Create Group</h3>
          <div style={{display:'flex', gap:'10px'}}>
            <input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Group Name" />
            <button className="DashBtn" onClick={async ()=>{
              await fetch("http://localhost:5001/create-group", {
                method:"POST", headers:{"Content-Type":"application/json"},
                body:JSON.stringify({teacher:user.username, groupName})
              });
              setGroupName(""); loadGroups();
            }}>Create</button>
          </div>
        </div>
        <div className="DashSection">
          <h3>My Groups</h3>
          {groups.map(g => (
            <div key={g.id} className="Item" style={{display:'flex', justifyContent:'space-between'}}>
              <span>{g.name} ({g.code})</span>
              <div style={{display:'flex', gap:'5px'}}>
                <button className="DashBtn" onClick={() => setCreatingForGroup(g.id)}>+ Exam</button>
                <button className="DashBtn" onClick={() => setActiveChat(g.id)}>Chat</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}