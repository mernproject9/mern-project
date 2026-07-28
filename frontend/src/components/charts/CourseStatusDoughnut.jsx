import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function CourseStatusDoughnut({ progressData }) {
  if (!progressData) return null;

  const completed = progressData.completedModules || 0;
  const inProgress = progressData.inProgressModules || 0;
  const notStarted = progressData.notStartedModules || 0;

  const data = {
    labels: ["Completed", "In Progress", "Not Started"],
    datasets: [
      {
        data: [completed, inProgress, notStarted],
        backgroundColor: [
          "rgba(34, 197, 94, 0.85)", // Green
          "rgba(245, 158, 11, 0.85)", // Amber
          "rgba(100, 116, 139, 0.5)", // Slate
        ],
        borderColor: [
          "#22c55e",
          "#f59e0b",
          "#64748b",
        ],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
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
          label: (context) => ` ${context.label}: ${context.raw} modules`,
        },
      },
    },
  };

  return (
    <div style={{ height: "260px", width: "100%", position: "relative" }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: "absolute",
          top: "43%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: "28px", fontWeight: "bold", color: "#a78bfa" }}>
          {progressData.overallProgress}%
        </span>
        <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
          Completed
        </div>
      </div>
    </div>
  );
}

export default CourseStatusDoughnut;
