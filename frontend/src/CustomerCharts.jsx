import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

const churnRate = ((churnedCustomers / totalCustomers) * 100).toFixed(2)

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

function CustomerCharts({
  predictions = [],
  current = null,
  loading = false,
  onClear = () => {},
}) {
  // Live values for the customer currently shown in the form
  const currentChurn = current
    ? Number(current.churn_probability ?? current.probabilities?.Yes ?? 0) * 100
    : null
  const currentWillChurn = currentChurn !== null && currentChurn >= 50

  // One point per prediction -> the trend chart redraws whenever this grows
  const trendData = predictions.map((item, index) => ({
    n: index + 1,
    time: item.time,
    churn: Number((Number(item.probability ?? 0) * 100).toFixed(2)),
  }))

  const predictedChurn = predictions.filter(
    (item) => ['Yes', '1', 'True'].includes(String(item.prediction))
  ).length

  const predictedStay = predictions.length - predictedChurn

  const latestPrediction = predictions[predictions.length - 1]

  const churnPercentage =
    predictions.length > 0
      ? (predictedChurn / predictions.length) * 100
      : 0

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
        {/* Chart 1: Original dataset distribution */}
        <article style={styles.card}>
          <h4 style={{ margin: 0 }}>Customer Distribution</h4>

          <p style={styles.subtitle}>
            Retained vs. churned customers in the dataset
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
              aria-label={`Dataset distribution: ${customerData[0].value} retained and ${customerData[1].value} churned`}
              style={{
                width: '190px',
                height: '190px',
                maxWidth: '100%',
                borderRadius: '50%',
                background: `conic-gradient(#8b7cff 0% ${
                  (customerData[0].value / totalCustomers) * 100
                }%, #ff6482 ${
                  (customerData[0].value / totalCustomers) * 100
                }% 100%)`,
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
                  background: '#12192c',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <strong style={{ fontSize: '24px' }}>
                  {totalCustomers.toLocaleString()}
                </strong>
                <span style={{ color: '#aab5d0', fontSize: '12px' }}>
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
              Retained:{' '}
              <strong>{customerData[0].value.toLocaleString()}</strong>
            </div>
            <div>
              Churned:{' '}
              <strong>{customerData[1].value.toLocaleString()}</strong>
            </div>
            <div>
              Dataset churn rate: <strong>{churnRate}%</strong>
            </div>
          </div>
        </article>

        {/* Chart 2: Original contract statistics */}
        <article style={styles.card}>
          <h4 style={{ margin: 0 }}>Churn by Contract Type</h4>

          <p style={styles.subtitle}>
            Historical customer counts grouped by contract
          </p>

          <div style={{ marginTop: '28px' }}>
            {contractData.map((row) => {
              const total = row.retained + row.churned
              const percentage = (row.churned / total) * 100

              return (
                <div key={row.contract} style={{ marginBottom: '28px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      fontSize: '13px',
                      marginBottom: '10px',
                    }}
                  >
                    <strong>{row.contract}</strong>
                    <span style={{ color: '#ff8ba0' }}>
                      {percentage.toFixed(1)}% churn
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      height: '18px',
                      borderRadius: '9px',
                      overflow: 'hidden',
                      background: '#303b59',
                    }}
                    role="img"
                    aria-label={`${row.contract}: ${row.retained} retained and ${row.churned} churned`}
                  >
                    <div
                      style={{
                        width: `${(row.retained / total) * 100}%`,
                        background: '#8b7cff',
                      }}
                    />
                    <div
                      style={{
                        width: `${(row.churned / total) * 100}%`,
                        background: '#ff6482',
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

      {/* Chart 3: LIVE - redraws every time the form changes */}
      <article style={{ ...styles.card, marginTop: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h4 style={{ margin: 0 }}>Live Churn Prediction</h4>
            <p style={styles.subtitle}>
              Updates automatically as you change the customer profile
            </p>
          </div>

          <span style={{ fontSize: '12px', color: '#aab5d0' }}>
            {loading ? '⟳ Updating…' : '● Live'}
          </span>
        </div>

        {currentChurn === null ? (
          <p style={{ ...styles.subtitle, marginTop: '24px' }}>
            {loading
              ? 'Waiting for the first prediction… (the server may be waking up)'
              : 'No prediction yet. Change any customer detail below.'}
          </p>
        ) : (
          <>
            {/* Gauge for the customer currently in the form */}
            <div style={{ marginTop: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <strong
                  style={{
                    fontSize: '40px',
                    color: currentWillChurn ? '#ff6482' : '#66d9b8',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {currentChurn.toFixed(1)}%
                </strong>
                <span style={{ color: '#cbd4eb', fontSize: '14px' }}>
                  churn probability ·{' '}
                  <strong>
                    {currentWillChurn
                      ? 'predicted to churn'
                      : 'predicted to stay'}
                  </strong>
                </span>
              </div>

              <div
                style={{
                  height: '14px',
                  borderRadius: '7px',
                  background: '#303b59',
                  overflow: 'hidden',
                  marginTop: '12px',
                }}
                role="img"
                aria-label={`Churn probability ${currentChurn.toFixed(1)} percent`}
              >
                <div
                  style={{
                    width: `${currentChurn}%`,
                    height: '100%',
                    background: currentWillChurn ? '#ff6482' : '#66d9b8',
                    transition: 'width 0.4s ease, background 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Trend: every settled change adds a point */}
            <div style={{ marginTop: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#cbd4eb' }}>
                  Churn probability over your last {trendData.length}{' '}
                  prediction{trendData.length === 1 ? '' : 's'}
                </span>

                <button
                  type="button"
                  onClick={onClear}
                  disabled={predictions.length === 0}
                  style={{
                    background: 'transparent',
                    color: '#aab5d0',
                    border: '1px solid #303b59',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Clear history
                </button>
              </div>

              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 8, right: 16, bottom: 0, left: -8 }}
                  >
                    <CartesianGrid stroke="#303b59" strokeDasharray="3 3" />
                    <XAxis dataKey="n" stroke="#aab5d0" fontSize={12} />
                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      stroke="#aab5d0"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#12192c',
                        border: '1px solid #303b59',
                        borderRadius: '8px',
                        color: '#edf0ff',
                      }}
                      formatter={(value) => [
                        `${Number(value).toFixed(1)}%`,
                        'Churn probability',
                      ]}
                      labelFormatter={(label, items) =>
                        `#${label}${
                          items?.[0]?.payload?.time
                            ? ' · ' + items[0].payload.time
                            : ''
                        }`
                      }
                    />
                    <ReferenceLine
                      y={50}
                      stroke="#8b7cff"
                      strokeDasharray="4 4"
                      label={{
                        value: '50% threshold',
                        fill: '#aab5d0',
                        fontSize: 11,
                        position: 'insideTopRight',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="churn"
                      stroke="#ff6482"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#ff6482' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.summary}>
              <div>
                Predicted to churn:{' '}
                <strong style={{ color: '#ff6482' }}>{predictedChurn}</strong>
                {' · '}
                Predicted to stay:{' '}
                <strong style={{ color: '#66d9b8' }}>{predictedStay}</strong>
                {' · '}
                Share predicted to churn:{' '}
                <strong>{churnPercentage.toFixed(0)}%</strong>
              </div>

              <div>
                Latest result:{' '}
                <strong>
                  {latestPrediction &&
                  ['Yes', '1', 'True'].includes(
                    String(latestPrediction.prediction)
                  )
                    ? 'Predicted to churn'
                    : 'Predicted to stay'}
                </strong>
              </div>
            </div>
          </>
        )}

        <p style={{ ...styles.subtitle, marginTop: '18px' }}>
          These are model predictions, not confirmed customer outcomes.
          History is kept in this browser only.
        </p>
      </article>
    </section>
  )
}

export default CustomerCharts
