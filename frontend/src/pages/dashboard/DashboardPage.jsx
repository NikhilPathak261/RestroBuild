const metrics = [
  { label: "Today's Orders", value: '0' },
  { label: "Today's Revenue", value: '₹0' },
  { label: 'Average Rating', value: '-' },
  { label: 'Popular Dish', value: '-' },
];

function DashboardPage() {
  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Owner Dashboard</p>
        <h1>Business overview</h1>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <section className="empty-state">
        <h2>No recent orders yet</h2>
        <p>Orders will appear here once customers start placing them from table QR codes.</p>
      </section>
    </section>
  );
}

export default DashboardPage;
