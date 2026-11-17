import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart({
  categories = [],
  totalSpent = 8550,
  currency = '₹',
}) {
  // Fallback default categories if empty
  const defaultCats = [
    { name: 'Food & Dining', amount: 2800, percentage: 33, color: '#A855F7' },
    { name: 'Travel', amount: 1800, percentage: 21, color: '#EC4899' },
    { name: 'Shopping', amount: 1500, percentage: 18, color: '#3B82F6' },
    { name: 'Entertainment', amount: 1200, percentage: 14, color: '#F97316' },
    { name: 'Others', amount: 1250, percentage: 14, color: '#10B981' },
  ];

  const items = categories.length > 0 ? categories : defaultCats;

  const data = {
    labels: items.map((c) => c.name),
    datasets: [
      {
        data: items.map((c) => c.amount),
        backgroundColor: items.map((c) => c.color || '#8B5CF6'),
        borderColor: '#131422',
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1E1F30',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context) {
            const val = context.raw;
            return ` ${currency}${Number(val).toLocaleString('en-IN')}`;
          },
        },
      },
    },
  };

  return (
    <div className="donut-container">
      {/* Chart with center text */}
      <div className="donut-chart-wrapper">
        <Doughnut data={data} options={options} />
        <div className="donut-center-text">
          <div className="donut-center-amount">
            {currency}{Number(totalSpent).toLocaleString('en-IN')}
          </div>
          <div className="donut-center-label">Total Spent</div>
        </div>
      </div>

      {/* Legend on the right */}
      <div className="category-legend">
        {items.map((item, idx) => (
          <div key={idx} className="legend-item">
            <div className="legend-left">
              <span className="legend-dot" style={{ backgroundColor: item.color || '#8B5CF6' }}></span>
              <span>{item.name}</span>
            </div>
            <div className="legend-right">
              <span className="legend-amount">{currency}{Number(item.amount).toLocaleString('en-IN')}</span>
              <span className="legend-percent">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

