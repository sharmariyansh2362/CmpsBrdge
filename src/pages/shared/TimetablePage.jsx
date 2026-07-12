import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { C } from "../../constants/colors";
import { Card } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMETABLE_DATA = {
  Monday: [
    { time: "09:00 AM - 10:00 AM", subject: "Data Structures & Algorithms", code: "CS501", room: "Block A - 201", teacher: "Dr. Priya Sharma" },
    { time: "10:15 AM - 11:15 AM", subject: "Operating Systems", code: "CS502", room: "Block A - 203", teacher: "Dr. Rahul Verma" },
    { time: "11:30 AM - 12:30 PM", subject: "Discrete Mathematics", code: "MATH303", room: "Block B - 102", teacher: "Prof. Anil Gupta" },
  ],
  Tuesday: [
    { time: "09:00 AM - 11:00 AM", subject: "Operating Systems Lab", code: "CS502P", room: "Lab Block - 302", teacher: "Dr. Rahul Verma" },
    { time: "11:30 AM - 12:30 PM", subject: "Technical Communication", code: "ENG201", room: "Block A - 104", teacher: "Ms. Ananya Singh" },
  ],
  Wednesday: [
    { time: "09:00 AM - 10:00 AM", subject: "Discrete Mathematics", code: "MATH303", room: "Block B - 102", teacher: "Prof. Anil Gupta" },
    { time: "10:15 AM - 12:15 PM", subject: "Data Structures Lab", code: "CS501P", room: "Lab Block - 301", teacher: "Dr. Priya Sharma" },
  ],
  Thursday: [
    { time: "09:00 AM - 10:00 AM", subject: "Operating Systems", code: "CS502", room: "Block A - 203", teacher: "Dr. Rahul Verma" },
    { time: "10:15 AM - 11:15 AM", subject: "Data Structures & Algorithms", code: "CS501", room: "Block A - 201", teacher: "Dr. Priya Sharma" },
    { time: "11:30 AM - 12:30 PM", subject: "Technical Communication", code: "ENG201", room: "Block A - 104", teacher: "Ms. Ananya Singh" },
  ],
  Friday: [
    { time: "10:15 AM - 11:15 AM", subject: "Discrete Mathematics", code: "MATH303", room: "Block B - 102", teacher: "Prof. Anil Gupta" },
    { time: "11:30 AM - 12:30 PM", subject: "Operating Systems", code: "CS502", room: "Block A - 203", teacher: "Dr. Rahul Verma" },
  ],
  Saturday: [],
};

export default function TimetablePage() {
  const { user } = useApp();
  const [selectedDay, setSelectedDay] = useState("Monday");

  const classes = TIMETABLE_DATA[selectedDay] || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Timetable & Schedules</h2>

      {/* Week days selectors */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {DAYS.map(day => {
          const active = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                border: "none",
                background: active ? C.primary : "#fff",
                color: active ? "#fff" : C.text,
                padding: "10px 20px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(108, 99, 255, 0.04)",
                transition: "all 0.15s",
                whiteSpace: "nowrap"
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Classes list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {classes.length === 0 ? (
          <Card style={{ padding: "40px 20px", textAlign: "center", color: C.sub }}>
            <Icons.Calendar size={32} style={{ marginBottom: 12, color: C.sub }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No classes scheduled for {selectedDay}.</div>
            <p style={{ fontSize: 12, marginTop: 4 }}>Enjoy your day off!</p>
          </Card>
        ) : (
          classes.map((cls, idx) => (
            <Card key={idx} style={{ display: "flex", alignItems: "center", gap: 20, padding: 18 }}>
              {/* Time indicator */}
              <div style={{
                width: 150, paddingRight: 16, borderRight: `1.5px solid ${C.border}`,
                display: "flex", flexDirection: "column", gap: 4
              }}>
                <div className="cb-flex" style={{ gap: 6, color: C.primary }}>
                  <Icons.Clock size={13} color={C.primary} />
                  <span style={{ fontSize: 11.5, fontWeight: 700 }}>Time Slot</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.text }}>{cls.time}</div>
              </div>

              {/* Class info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cb-flex" style={{ gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, background: C.primarySoft, color: C.primary, padding: "2px 8px", borderRadius: 4 }}>
                    {cls.code}
                  </span>
                  <span className="cb-flex" style={{ gap: 4, fontSize: 11.5, color: C.sub }}>
                    <Icons.MapPin size={12} color={C.sub} />
                    {cls.room}
                  </span>
                </div>
                <h4 style={{ fontSize: 14.5, fontWeight: 800, color: C.text }} className="cb-text-ellipsis">
                  {cls.subject}
                </h4>
              </div>

              {/* Professor info */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: C.sub }}>Instructor</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cls.teacher}</div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
