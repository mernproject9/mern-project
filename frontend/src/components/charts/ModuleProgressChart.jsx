import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function ModuleProgressChart({ modules }) {
  if (!modules || modules.length === 0) return null;

  const labels = modules.map((m) => {
    const parts = m.name.split(":");
    return parts.length > 1 ? parts[1].trim() : m.name;
  });

  const progressData = modules.map((m) => m.progress);
  const timeData = modules.map((m) => m.timeSpentHours || 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Module Completion (%)",
        data: progressData,
        backgroundColor: "rgba(167, 139, 250, 0.85)",
        borderColor: "rgba(167, 139, 250, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Time Spent (Hours)",
        data: timeData,
        backgroundColor: "rgba(56, 189, 248, 0.75)",
        borderColor: "rgba(56, 189, 248, 1)",
        borderWidth: 2,
        borderRadius: 8,
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
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const val = context.raw;
            return label.includes("%") ? ` ${label}: ${val}%` : ` ${label}: ${val} hrs`;
          },
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
        },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
      },
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default ModuleProgressChart;
