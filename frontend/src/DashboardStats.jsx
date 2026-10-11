function DashboardStats() {
  const stats = [
    {
      title: 'Total Customers',
      value: '7,032',
      description: 'Customers in cleaned dataset',
      icon: '👥',
    },
    {
      title: 'Churned Customers',
      value: '1,869',
      description: 'Customers who left',
      icon: '📉',
    },
    {
      title: 'Retained Customers',
      value: '5,163',
      description: 'Customers who stayed',
      icon: '🛡️',
    },
    {
      title: 'Overall Churn Rate',
      value: '26.57%',
      description: 'Churned customers / total',
      icon: '📊',
    },
  ]

  return (
    <section className="stats-section">
      <div className="stats-heading">
        <div>
          <p className="eyebrow">DATASET OVERVIEW</p>
          <h3>Customer Analytics</h3>
          <p>Explore the customer data used in your churn project.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.title}>
            <div className="stat-card-top">
              <span>{stat.title}</span>
              <span className="stat-icon" aria-hidden="true">
                {stat.icon}
              </span>
            </div>

            <strong className="stat-value">{stat.value}</strong>

            <p className="stat-description">{stat.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DashboardStats