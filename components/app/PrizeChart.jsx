"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function PrizeChart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Prize Pool Contributions",
        color: "#9CA3AF",
        font: {
          size: 14,
          weight: "normal",
        },
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#9CA3AF",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#9CA3AF",
        },
      },
    },
  }

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    datasets: [
      {
        data: [65, 45, 30, 60, 45, 30, 70, 45],
        backgroundColor: "#EF4444",
        borderRadius: 4,
      },
    ],
  }

  return (
    <div className="bg-[#1A0808] rounded-xl p-6 border border-red-900/20">
      <Bar options={options} data={data} />
    </div>
  )
}

