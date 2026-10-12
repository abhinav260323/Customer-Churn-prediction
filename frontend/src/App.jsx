import { useEffect, useState } from 'react'
import './App.css'
import DashboardStats from './DashboardStats'
import CustomerCharts from './CustomerCharts'

// One place that decides which backend to call.
//  - Local dev: falls back to FastAPI on your machine.
//  - Production (Vercel): comes from the VITE_API_URL environment variable.
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')

const HISTORY_KEY = 'churn-prediction-history'
const MAX_HISTORY = 30
const DEBOUNCE_MS = 600

const defaultCustomer = {
  gender: 'Female',
  seniorCitizen: 'No',
  partner: 'Yes',
  dependents: 'No',
  tenureMonths: 12,
  phoneService: 'Yes',
  multipleLines: 'No',
  internetService: 'Fiber optic',
  onlineSecurity: 'No',
  onlineBackup: 'No',
  deviceProtection: 'No',
  techSupport: 'No',
  streamingTV: 'No',
  streamingMovies: 'No',
  contract: 'Month-to-month',
  paperlessBilling: 'Yes',
  paymentMethod: 'Electronic check',
  monthlyCharges: 70,
  totalCharges: 840,
}

// Convert the form state into the exact JSON the API expects.
function buildFeatures(customer) {
  return {
    Gender: customer.gender,
    'Senior Citizen': customer.seniorCitizen,
    Partner: customer.partner,
    Dependents: customer.dependents,
    'Tenure Months': Number(customer.tenureMonths),
    'Phone Service': customer.phoneService,
    'Multiple Lines': customer.multipleLines,
    'Internet Service': customer.internetService,
    'Online Security': customer.onlineSecurity,
    'Online Backup': customer.onlineBackup,
    'Device Protection': customer.deviceProtection,
    'Tech Support': customer.techSupport,
    'Streaming TV': customer.streamingTV,
    'Streaming Movies': customer.streamingMovies,
    Contract: customer.contract,
    'Paperless Billing': customer.paperlessBilling,
    'Payment Method': customer.paymentMethod,
    'Monthly Charges': Number(customer.monthlyCharges),
    // Your model was trained with both spellings, so send both.
    'Total Charges': Number(customer.totalCharges),
    'Total charges': Number(customer.totalCharges),
  }
}

// A number box that is empty (or negative) is not ready to be scored yet.
function numbersAreValid(customer) {
  return ['tenureMonths', 'monthlyCharges', 'totalCharges'].every((key) => {
    const raw = customer[key]
    return raw !== '' && Number.isFinite(Number(raw)) && Number(raw) >= 0
  })
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(saved) ? saved.slice(-MAX_HISTORY) : []
  } catch {
    return []
  }
}

function App() {
  const [customer, setCustomer] = useState(defaultCustomer)

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState('checking') // checking | online | offline
  const [refreshKey, setRefreshKey] = useState(0)
  const [predictionHistory, setPredictionHistory] = useState(loadHistory)

  // Update customer information when an input changes
  function handleChange(event) {
    const { name, value } = event.target
    setCustomer((previous) => ({ ...previous, [name]: value }))
  }

  // The button now simply forces a fresh prediction.
  function handleSubmit(event) {
    event.preventDefault()
    setRefreshKey((key) => key + 1)
  }

  function clearHistory() {
    setPredictionHistory([])
  }

  // Keep the history across page refreshes (this browser only).
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(predictionHistory))
    } catch {
      /* storage can be blocked (private mode) - ignore */
    }
  }, [predictionHistory])

  // Wake the backend up as soon as the page opens.
  // (Render's free tier sleeps when idle and needs ~30-60s to restart.)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/health`)
      .then((response) => {
        if (!cancelled) setApiStatus(response.ok ? 'online' : 'offline')
      })
      .catch(() => {
        if (!cancelled) setApiStatus('offline')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // ------------------------------------------------------------
  // LIVE PREDICTION
  // Runs automatically whenever ANY input changes.
  //  - waits DEBOUNCE_MS after the last change (no request per keystroke)
  //  - cancels the previous request if the user keeps changing things
  //  - on success: updates the result AND adds a point to the history,
  //    which is what makes the charts redraw by themselves
  // ------------------------------------------------------------
  useEffect(() => {
    if (!numbersAreValid(customer)) return undefined

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features: buildFeatures(customer) }),
          signal: controller.signal,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            typeof data.detail === 'string'
              ? data.detail
              : JSON.stringify(data.detail ?? data),
          )
        }

        const churnProbability = Number(
          data.churn_probability ?? data.probabilities?.Yes ?? 0,
        )

        setResult(data)
        setApiStatus('online')
        setPredictionHistory((previous) => {
          const last = previous[previous.length - 1]
          // Skip exact repeats (e.g. pressing the button without changes)
          if (last && last.probability === churnProbability) return previous

          return [
            ...previous,
            {
              id: Date.now(),
              time: new Date().toLocaleTimeString(),
              prediction: data.prediction,
              probability: churnProbability,
            },
          ].slice(-MAX_HISTORY)
        })
      } catch (err) {
        if (err.name === 'AbortError') return // superseded by a newer request
        console.error('Prediction error:', err)
        setApiStatus('offline')
        setError(
          err instanceof TypeError
            ? `Could not reach the prediction server at ${API_URL}. ` +
                'If it was idle it may still be waking up - wait a few seconds and try again.'
            : err.message,
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [customer, refreshKey])

  const fields = [
    { label: 'Gender', name: 'gender', options: ['Female', 'Male'] },
    { label: 'Senior Citizen', name: 'seniorCitizen', options: ['No', 'Yes'] },
    { label: 'Partner', name: 'partner', options: ['Yes', 'No'] },
    { label: 'Dependents', name: 'dependents', options: ['Yes', 'No'] },
    { label: 'Phone Service', name: 'phoneService', options: ['Yes', 'No'] },
    {
      label: 'Multiple Lines',
      name: 'multipleLines',
      options: ['No', 'Yes', 'No phone service'],
    },
    {
      label: 'Internet Service',
      name: 'internetService',
      options: ['DSL', 'Fiber optic', 'No'],
    },
    {
      label: 'Online Security',
      name: 'onlineSecurity',
      options: ['Yes', 'No', 'No internet service'],
    },
    {
      label: 'Online Backup',
      name: 'onlineBackup',
      options: ['Yes', 'No', 'No internet service'],
    },
    {
      label: 'Device Protection',
      name: 'deviceProtection',
      options: ['Yes', 'No', 'No internet service'],
    },
    {
      label: 'Tech Support',
      name: 'techSupport',
      options: ['Yes', 'No', 'No internet service'],
    },
    {
      label: 'Streaming TV',
      name: 'streamingTV',
      options: ['Yes', 'No', 'No internet service'],
    },
    {
      label: 'Streaming Movies',
      name: 'streamingMovies',
      options: ['Yes', 'No', 'No internet service'],
    },
    {
      label: 'Contract',
      name: 'contract',
      options: ['Month-to-month', 'One year', 'Two year'],
    },
    {
      label: 'Paperless Billing',
      name: 'paperlessBilling',
      options: ['Yes', 'No'],
    },
    {
      label: 'Payment Method',
      name: 'paymentMethod',
      options: [
        'Electronic check',
        'Mailed check',
        'Bank transfer (automatic)',
        'Credit card (automatic)',
      ],
    },
  ]

  const statusText = {
    checking: 'ML API · connecting…',
    online: 'ML API · online',
    offline: 'ML API · offline',
  }[apiStatus]

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand-mark">CC</div>

        <div>
          <h1>Customer Churn Intelligence</h1>
          <p>Machine Learning Prediction Dashboard</p>
        </div>

        <span className={`status ${apiStatus}`}>{statusText}</span>
      </header>

      <DashboardStats />

      <CustomerCharts
        predictions={predictionHistory}
        current={result}
        loading={loading}
        onClear={clearHistory}
      />

      <section className="intro">
        <p className="eyebrow">CUSTOMER ANALYTICS / PREDICTION</p>
        <h2>Understand your customers.</h2>
        <p>
          Change any customer detail below - the prediction and the charts
          above update automatically.
        </p>
      </section>

      <form className="customer-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <div>
            <h3>Customer profile</h3>
            <p>Choose the customer's information below.</p>
          </div>

          <span className="required-note">* Required</span>
        </div>

        <div className="field-grid">
          {fields.map((field) => (
            <label className="field" key={field.name}>
              <span>{field.label}</span>

              <select
                name={field.name}
                value={customer[field.name]}
                onChange={handleChange}
                required
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <label className="field">
            <span>Tenure (months)</span>
            <input
              type="number"
              name="tenureMonths"
              min="0"
              max="100"
              value={customer.tenureMonths}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Monthly charges</span>
            <input
              type="number"
              name="monthlyCharges"
              min="0"
              step="0.01"
              value={customer.monthlyCharges}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Total charges</span>
            <input
              type="number"
              name="totalCharges"
              min="0"
              step="0.01"
              value={customer.totalCharges}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <button className="predict-button" type="submit" disabled={loading}>
          {loading ? 'Analysing customer...' : 'Refresh prediction →'}
        </button>
      </form>

      {error && (
        <section className="result error-result" role="alert">
          <h3>Prediction could not be completed</h3>
          <p>{error}</p>
        </section>
      )}

      {result && (
        <section className="result" aria-live="polite">
          <p className="eyebrow">PREDICTION RESULT</p>

          <h3>
            {['Yes', '1', 'True'].includes(String(result.prediction))
              ? 'Customer is predicted to churn'
              : 'Customer is predicted to stay'}
          </h3>

          <div className="probability-grid">
            {Object.entries(result.probabilities).map(([label, probability]) => {
              const isChurnClass = ['Yes', '1', 'True'].includes(String(label))

              return (
                <div className="probability-card" key={label}>
                  <span>
                    {isChurnClass ? 'Churn probability' : 'Stay probability'}
                  </span>
                  <strong>{(Number(probability) * 100).toFixed(2)}%</strong>
                </div>
              )
            })}
          </div>

          <p className="disclaimer">
            These are model-estimated probabilities, not guarantees of
            customer behaviour.
          </p>
        </section>
      )}
    </main>
  )
}

export default App
