import './Dashboard.css';

const stats = [
  { label: 'Active projects', value: '3' },
  { label: 'New inquiries', value: '5' },
  { label: 'Completed works', value: '18' },
];

export default function Dashboard() {
  return (
    <section className="page">
      <h1>Artist Dashboard</h1>
      <p>Track project progress and client requests.</p>

      <div className="dashboard-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="dashboard-card">
            <h2>{stat.value}</h2>
            <p>{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}