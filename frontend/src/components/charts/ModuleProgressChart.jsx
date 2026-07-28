import React, { useRef, useEffect, useState } from "react";
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
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!modules || modules.length === 0) return;

    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;
    
    // Create professional linear gradients
    const progressGradient = ctx.createLinearGradient(0, 0, 0, 300);
    progressGradient.addColorStop(0, "rgba(167, 139, 250, 0.95)");
    progressGradient.addColorStop(1, "rgba(124, 58, 237, 0.4)");

    const timeGradient = ctx.createLinearGradient(0, 0, 0, 300);
    timeGradient.addColorStop(0, "rgba(56, 189, 248, 0.95)");
    timeGradient.addColorStop(1, "rgba(14, 165, 233, 0.35)");

    const labels = modules.map((m) => {
      const parts = m.name.split(":");
      return parts.length > 1 ? parts[1].trim() : m.name;
    });

    const progressData = modules.map((m) => m.progress);
    const timeData = modules.map((m) => m.timeSpentHours || 0);

    setChartData({
      labels,
      datasets: [
        {
          label: "Module Completion (%)",
          data: progressData,
          backgroundColor: progressGradient,
          borderColor: "#a78bfa",
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: "rgba(167, 139, 250, 1)",
          barPercentage: 0.7,
        },
        {
          label: "Time Spent (Hours)",
          data: timeData,
          backgroundColor: timeGradient,
          borderColor: "#38bdf8",
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: "rgba(56, 189, 248, 1)",
          barPercentage: 0.7,
        },
      ],
    });
  }, [modules]);

  if (!modules || modules.length === 0) return null;

  const initialData = {
    labels: modules.map((m) => m.name.split(":")[1]?.trim() || m.name),
    datasets: [
      {
        label: "Module Completion (%)",
        data: modules.map((m) => m.progress),
        backgroundColor: "rgba(167, 139, 250, 0.85)",
        borderColor: "#a78bfa",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Time Spent (Hours)",
        data: modules.map((m) => m.timeSpentHours || 0),
        backgroundColor: "rgba(56, 189, 248, 0.75)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: "#f8fafc",
          font: { family: "'Inter', sans-serif", size: 12, weight: "600" },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        titleFont: { size: 13, weight: "700" },
        bodyColor: "#cbd5e1",
        bodyFont: { size: 12 },
        borderColor: "rgba(167, 139, 250, 0.4)",
        borderWidth: 1,
        padding: 14,
        boxPadding: 6,
        usePointStyle: true,
        cornerRadius: 10,
        displayColors: true,
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
        ticks: { color: "#94a3b8", font: { family: "'Inter', sans-serif", size: 11, weight: "500" } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#94a3b8",
          font: { family: "'Inter', sans-serif", size: 11 },
          stepSize: 20,
        },
        grid: { color: "rgba(51, 65, 85, 0.35)", drawBorder: false },
      },
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Bar ref={chartRef} data={chartData || initialData} options={options} />
    </div>
  );
}

export default ModuleProgressChart;
