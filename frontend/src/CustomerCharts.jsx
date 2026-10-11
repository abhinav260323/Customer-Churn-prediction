import React from 'react'

const customerData = [
  { name: 'Retained', value: 5163, color: '#8b7cff' },
  { name: 'Churned', value: 1869, color: '#ff6482' },
]

const contractData = [
  { contract: 'Month-to-month', retained: 2220, churned: 1655 },
  { contract: 'One year', retained: 1307, churned: 166 },
  { contract: 'Two year', retained: 1637, churned: 48 },
]

const totalCustomers = customerData.reduce(
  (total, customer) => total + customer.value,
  0
)

const churnedCustomers = customerData[1].value

const churnRate = (
  (churnedCustomers / totalCustomers) * 100
).toFixed(2)

const styles = {
  card: {
    background: 'linear-gradient(145deg, #182039, #0d1223)',
    border: '1px solid #303b59',
    borderRadius: '16px',
    padding: '24px',
    minWidth: 0,
    color: '#edf0ff',
  },
  subtitle: {
    color: '#aab5d0',
    fontSize: '13px',
    marginTop: '6px',
  },
  legendRow: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginTop: '22px',
    fontSize: '13px',
    color: '#cbd4eb',
  },
  dot: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '7px',
  },
  summary: {
    borderTop: '1px solid #303b59',
    marginTop: '22px',
    paddingTop: '16px',
    color: '#cbd4eb',
    fontSize: '13px',
    lineHeight: 2,
  },
}

function CustomerCharts() {
  return (
    <section className="charts-section">
      <div className="charts-heading">
        <p className="eyebrow">CUSTOMER INSIGHTS</p>
        <h3>Customer Churn Distribution</h3>
        <p>
          Explore customer retention and churn patterns in your dataset.
        </p>
      </div>

      <div
        className="chart-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '20px',
        }}
      >
        {/* Chart 1: Customer distribution */}
        <article style={styles.card}>
          <h4 style={{ margin: 0 }}>Customer Distribution</h4>
          <p style={styles.subtitle}>
            Retained vs. churned customers
          </p>

          <div
            style={{
              minHeight: '310px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '15px',
            }}
          >
            <div
              role="img"
              aria-label="Donut chart showing 5163 retained customers and 1869 churned customers"
              style={{
                width: '190px',
                height: '190px',
                maxWidth: '100%',
                borderRadius: '50%',
                background:
                  'conic-gradient(#8b7cff 0% 73.43%, #ff6482 73.43% 100%)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '115px',
                  height: '115px',
                  borderRadius: '50%',
                  background: '#141b30',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <strong style={{ fontSize: '23px' }}>
                  {totalCustomers.toLocaleString()}
                </strong>
                <span style={{ fontSize: '12px', color: '#aab5d0' }}>
                  Customers
                </span>
              </div>
            </div>

            <div style={styles.legendRow}>
              {customerData.map((customer) => (
                <span key={customer.name}>
                  <span
                    style={{
                      ...styles.dot,
                      background: customer.color,
                    }}
                  />
                  {customer.name}: {customer.value.toLocaleString()}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.summary}>
            <div>
              Retained customers: <strong>5,163</strong>
            </div>
            <div>
              Churned customers: <strong>1,869</strong>
            </div>
            <div>
              Overall churn rate: <strong>{churnRate}%</strong>
            </div>
          </div>
        </article>

        {/* Chart 2: Contract comparison */}
        <article style={styles.card}>
          <h4 style={{ margin: 0 }}>Churn by Contract Type</h4>
          <p style={styles.subtitle}>
            Compare retained and churned customers
          </p>

          <div
            style={{
              minHeight: '310px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '25px',
              paddingTop: '15px',
            }}
          >
            {contractData.map((row) => {
              const maximum = Math.max(row.retained, row.churned, 1)

              return (
                <div key={row.contract}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '9px',
                      fontSize: '13px',
                      color: '#dce3fa',
                    }}
                  >
                    <strong>{row.contract}</strong>
                    <span style={{ color: '#aab5d0' }}>
                      {(
                        (row.churned /
                          (row.retained + row.churned)) *
                        100
                      ).toFixed(1)}
                      % churn
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '7px',
                    }}
                  >
                    <div
                      title={`Retained: ${row.retained}`}
                      style={{
                        width: `${(row.retained / maximum) * 100}%`,
                        minWidth: '3px',
                        height: '19px',
                        background: '#8b7cff',
                        borderRadius: '4px',
                      }}
                    />

                    <div
                      title={`Churned: ${row.churned}`}
                      style={{
                        width: `${(row.churned / maximum) * 100}%`,
                        minWidth: '3px',
                        height: '19px',
                        background: '#ff6482',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginTop: '5px',
                      fontSize: '11px',
                      color: '#aab5d0',
                    }}
                  >
                    <span>Retained: {row.retained.toLocaleString()}</span>
                    <span>Churned: {row.churned.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={styles.legendRow}>
            <span>
              <span style={{ ...styles.dot, background: '#8b7cff' }} />
              Retained
            </span>
            <span>
              <span style={{ ...styles.dot, background: '#ff6482' }} />
              Churned
            </span>
          </div>
        </article>
      </div>
    </section>
  )
}

export default CustomerCharts
