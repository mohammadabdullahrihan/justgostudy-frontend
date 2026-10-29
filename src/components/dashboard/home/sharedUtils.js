/* ─── Greeting helpers ───────────────────────────────────── */
export const getGreeting = () => {
  const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })).getHours();
  if (h < 5) return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
};

/* ─── chart tooltip shared style ────────────────────────── */
export const ChartTooltipStyle = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: 12,
    boxShadow: '0 4px 16px -4px rgba(0,0,0,0.10)',
    fontSize: 12,
    padding: '8px 14px',
  },
  cursor: { fill: '#f0f6ff' },
};
