import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const AnalyticsChart = ({ type = "bar", data, options = {} }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    // Destroy existing chart to avoid overlay/memory leak
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    
    // Default theme customizations for dark mode
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#94a3b8", // text-secondary
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 11
            }
          }
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#f8fafc",
          bodyColor: "#94a3b8",
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1
        }
      },
      scales: type === "pie" || type === "doughnut" || type === "polarArea" ? {} : {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.05)"
          },
          ticks: {
            color: "#94a3b8",
            font: {
              family: "'Plus Jakarta Sans', sans-serif"
            }
          }
        },
        y: {
          grid: {
            color: "rgba(255, 255, 255, 0.05)"
          },
          ticks: {
            color: "#94a3b8",
            font: {
              family: "'Plus Jakarta Sans', sans-serif"
            }
          }
        }
      }
    };

    const combinedOptions = {
      ...defaultOptions,
      ...options,
      plugins: {
        ...defaultOptions.plugins,
        ...options.plugins
      },
      scales: type === "pie" || type === "doughnut" || type === "polarArea" ? {} : {
        ...defaultOptions.scales,
        ...options.scales
      }
    };

    chartInstanceRef.current = new Chart(ctx, {
      type,
      data,
      options: combinedOptions
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef} />;
};

export default AnalyticsChart;
