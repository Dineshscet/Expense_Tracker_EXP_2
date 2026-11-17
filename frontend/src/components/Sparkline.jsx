import React from 'react';

export default function Sparkline({ data = [2, 5, 4, 8, 7, 10], color = '#10B981', width = 90, height = 36 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  // Generate smooth cubic bezier SVG path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt}`;
    const [x0, y0] = arr[i - 1].split(',').map(Number);
    const [x1, y1] = pt.split(',').map(Number);
    const mx = (x0 + x1) / 2;
    return `${acc} C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }, '');

  const areaD = `${pathD} L ${width - 2},${height} L 2,${height} Z`;
  const gradId = `spark-grad-${color.replace('#', '')}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

