import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export function SkillRadarChart({ skillMetrics }) {
  if (!skillMetrics || !skillMetrics.labels) return null;

  const data = {
    labels: skillMetrics.labels,
    datasets: [
      {
        label: "Skill Mastery Level (%)",
        data: skillMetrics.scores,
        backgroundColor: "rgba(167, 139, 250, 0.25)",
        borderColor: "#a78bfa",
        borderWidth: 2,
        pointBackgroundColor: "#a78bfa",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
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
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}%`,
        },
      },
    },
    scales: {
      r: {
        angleLines: { color: "rgba(51, 65, 85, 0.5)" },
        grid: { color: "rgba(51, 65, 85, 0.5)" },
        pointLabels: {
          color: "#cbd5e1",
          font: { size: 11, weight: "500" },
        },
        ticks: {
          display: false,
          beginAtZero: true,
          max: 100,
        },
      },
    },
  };

  return (
    <div style={{ height: "260px", width: "100%" }}>
      <Radar data={data} options={options} />
    </div>
  );
}

export default SkillRadarChart;
