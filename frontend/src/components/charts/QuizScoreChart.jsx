import React, { useRef, useEffect, useState } from "react";
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
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!quizzes || quizzes.length === 0) return;

    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;
    
    // Create smooth area gradient fill
    const scoreGradient = ctx.createLinearGradient(0, 0, 0, 300);
    scoreGradient.addColorStop(0, "rgba(56, 189, 248, 0.45)");
    scoreGradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");

    const labels = quizzes.map((q) => {
      const parts = q.title.split(":");
      return parts.length > 1 ? parts[1].trim() : q.title;
    });

    const scores = quizzes.map((q) => q.score);
    const passingThreshold = quizzes.map(() => 70);

    setChartData({
      labels,
      datasets: [
        {
          label: "Quiz Score (%)",
          data: scores,
          borderColor: "#38bdf8",
          borderWidth: 3,
          backgroundColor: scoreGradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#38bdf8",
          pointBorderColor: "#0f172a",
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "#f8fafc",
          pointHoverBorderColor: "#38bdf8",
          pointHoverBorderWidth: 3,
          pointRadius: 6,
        },
        {
          label: "Passing Mark (70%)",
          data: passingThreshold,
          borderColor: "rgba(239, 68, 68, 0.8)",
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    });
  }, [quizzes]);

  if (!quizzes || quizzes.length === 0) return null;

  const initialData = {
    labels: quizzes.map((q) => q.title.split(":")[1]?.trim() || q.title),
    datasets: [
      {
        label: "Quiz Score (%)",
        data: quizzes.map((q) => q.score),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#38bdf8",
        pointRadius: 5,
      },
      {
        label: "Passing Mark (70%)",
        data: quizzes.map(() => 70),
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
    animation: {
      duration: 1200,
      easing: "easeOutCubic",
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
        borderColor: "rgba(56, 189, 248, 0.4)",
        borderWidth: 1,
        padding: 14,
        boxPadding: 6,
        usePointStyle: true,
        cornerRadius: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}%`,
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
          callback: (val) => `${val}%`,
        },
        grid: { color: "rgba(51, 65, 85, 0.35)", drawBorder: false },
      },
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Line ref={chartRef} data={chartData || initialData} options={options} />
    </div>
  );
}

export default QuizScoreChart;
