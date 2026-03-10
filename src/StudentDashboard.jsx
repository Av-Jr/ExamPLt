import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import "./Dashboard.css";

export default function StudentDashboard({ user, onLogout }) {
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eRes, hRes] = await Promise.all([
          fetch("http://localhost:5001/get-exams").then(r => r.json()),
          fetch("http://localhost:5001/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user.username })
          }).then(r => r.json())
        ]);
        if (eRes.ok) setExams(eRes.exams || []); // Correctly access .exams
        if (hRes.ok) setHistory(hRes.history || []);
      } catch (err) { console.error("Load error", err); }
    };
    loadData();
  }, [user.username]);

  // Timer Countdown Logic
  useEffect(() => {
    if (activeExam && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeExam) {
      alert("Time is up!");
      submitExam();
    }
    return () => clearInterval(timerRef.current);
  }, [activeExam, timeLeft]);

  const startExam = (exam) => {
    setActiveExam(exam);
    setTimeLeft((exam.timeLimit || 60) * 60); // Minutes to seconds
  };

  const submitExam = async () => {
    clearInterval(timerRef.current);
    const res = await fetch("http://localhost:5001/attempt-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: activeExam.id, username: user.username, answers })
    });
    if ((await res.json()).ok) {
      setActiveExam(null);
      window.location.reload();
    }
  };

  if (activeExam) {
    return (
      <div className="DashScene">
        <div className="DashCard" style={{ overflowY: "auto" }}>
          <div className="TimerBox" style={{ position: 'sticky', top: 0, background: '#333', padding: '10px' }}>
            <h2>{activeExam.title}</h2>
            <h3>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h3>
          </div>
          {activeExam.questions.map((q, i) => (
            <div key={q.id} className="DashSection">
              <p>Q{i+1}: {q.text}</p>
              {q.type === "code" ? (
                <Editor height="200px" theme="vs-dark" defaultLanguage="javascript" defaultValue={q.template} onChange={(v) => setAnswers({...answers, [q.id]: v})} />
              ) : (
                q.options.map((opt, optIdx) => (
                  <label key={optIdx} style={{display:'block'}}><input type="radio" name={q.id} onChange={() => setAnswers({...answers, [q.id]: optIdx})} /> {opt}</label>
                ))
              )}
            </div>
          ))}
          <button className="DashBtn" onClick={submitExam}>Submit Exam</button>
        </div>
      </div>
    );
  }

  return (
    <div className="DashScene">
      <div className="DashCard">
        <h1>Available Exams</h1>
        {exams.map(e => {
          const isDone = history.some(h => String(h.examId) === String(e.id));
          return (
            <div key={e.id} className="DashSection" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><strong>{e.title}</strong><p>Time: {e.timeLimit}m</p></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{isDone ? "✅ Attempted" : "⏳ Pending"}</span>
                {!isDone && <button className="DashBtn" onClick={() => startExam(e)}>Start</button>}
              </div>
            </div>
          );
        })}
        <button className="DashBtn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}