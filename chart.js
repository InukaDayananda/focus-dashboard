let focusChart = null; 

function loadChart() {
  let sessions = JSON.parse(localStorage.getItem("sessions") || "[]");

  let labels = [];
  let dailyMinutes = [];

  // Restructured loop bounds to evaluate exactly 7 historical intervals
  for (let i = 6; i >= 0; i--) {
    let d = new Date();
    d.setDate(d.getDate() - i);
    
    let storageKey = d.toDateString(); 
    let displayLabel = d.getDate() + " " + d.toLocaleString('en-US', { month: 'short' });
    labels.push(displayLabel);

    let totalSeconds = sessions
      .filter(s => s.date === storageKey)
      .reduce((sum, s) => sum + s.duration, 0);

    let minutes = parseFloat((totalSeconds / 60).toFixed(1));
    dailyMinutes.push(minutes);
  }

  const ctx = document.getElementById("chart").getContext("2d");
  if (focusChart) {
    focusChart.destroy();
  }

  focusChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Focus Duration (Minutes)",
        data: dailyMinutes,
        backgroundColor: "#3B82F6", 
        borderRadius: 6,
        hoverBackgroundColor: "#60A5FA" 
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) { return ` ${context.parsed.y} mins`; }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#94A3B8",
            font: { family: "'Segoe UI', sans-serif", size: 12 }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: "#334155", borderDash: [5, 5] },
          ticks: {
            color: "#94A3B8",
            font: { family: "'Segoe UI', sans-serif", size: 12 },
            callback: function(value) { return value + " m"; }
          }
        }
      }
    }
  });
}

loadChart();