import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function QuizScoreChart({ quizzes }) {
  if (!quizzes || quizzes.length === 0) return null;

  const labels = quizzes.map((q) => {
    const parts = q.title.split(":");
    return parts.length > 1 ? parts[1].trim() : q.title;
  });

  const scores = quizzes.map((q) => q.score);
  const passingThreshold = quizzes.map(() => 70); // 70% benchmark pass mark

  const data = {
    labels,
    datasets: [
      {
        label: "Quiz Score (%)",
        data: scores,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#38bdf8",
        pointBorderColor: "#fff",
        pointHoverRadius: 7,
        pointRadius: 5,
      },
      {
        label: "Passing Mark (70%)",
        data: passingThreshold,
        borderColor: "rgba(239, 68, 68, 0.7)",
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#e2e8f0",
          font: { family: "Inter, sans-serif", size: 12, weight: "600" },
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}%`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          callback: (val) => `${val}%`,
        },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
      },
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default QuizScoreChart;
