function saveSession(duration) {
  let sessions = JSON.parse(localStorage.getItem("sessions") || "[]");

  sessions.push({
    date: new Date().toDateString(),
    duration: duration
  });

  localStorage.setItem("sessions", JSON.stringify(sessions));
}