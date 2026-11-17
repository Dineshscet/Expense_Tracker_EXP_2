import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

export default function MonthlyTrendChart({
  points = [],
  currency = '₹',
}) {
  const defaultLabels = ['Nov 1', 'Nov 8', 'Nov 15', 'Nov 22', 'Nov 30'];
  const defaultValues = [1200, 3200, 4800, 6900, 8550];

  const labels = points.length > 0 ? points.map((p) => p.label) : defaultLabels;
  const values = points.length > 0 ? points.map((p) => p.amount) : defaultValues;

  const data = {
    labels: labels,
    datasets: [
      {
        fill: true,
        label: 'Spending',
        data: values,
        borderColor: '#a855f7',
        borderWidth: 2.8,
        pointBackgroundColor: '#c084fc',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.42,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 10, family: 'Plus Jakarta Sans' },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 10, family: 'Plus Jakarta Sans' },
          callback: function (val) {
            return `${val / 1000}k`;
          },
          stepSize: 5000,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e1435',
        titleColor: '#e2e8f0',
        bodyColor: '#a855f7',
        borderColor: '#a855f7',
        borderWidth: 1.2,
        padding: 8,
        displayColors: false,
        callbacks: {
          title: () => '',
          label: (context) => ` ${currency}${Number(context.raw).toLocaleString('en-IN')}`,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px' }}>
      {/* Visual peak badge matching the screenshot */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '12px',
          background: 'rgba(30, 27, 58, 0.95)',
          border: '1px solid rgba(168, 85, 247, 0.5)',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#ffffff',
          boxShadow: '0 2px 10px rgba(168,85,247,0.3)',
          zIndex: 10,
        }}
      >
        {currency}{Number(values[values.length - 1] || 8550).toLocaleString('en-IN')}
      </div>
      <Line data={data} options={options} />
    </div>
  );
}

