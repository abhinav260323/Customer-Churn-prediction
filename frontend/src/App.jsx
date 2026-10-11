import { useState } from 'react'
import './App.css'
import DashboardStats from './DashboardStats'
import CustomerCharts from './CustomerCharts'

function App() {
  // Store customer information
  const [customer, setCustomer] = useState({
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
  })

  // Store prediction results and request status
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  //  Update customer information when an input changes
  function handleChange(event) {
    const { name, value } = event.target

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Send customer information to the ML API
  async function handleSubmit(event) {
    event.preventDefault()

    console.log('STEP 1: Prediction form submitted')

    setLoading(true)
    setError('')
    setResult(null)

    try {
      console.log('STEP 2: Sending request to FastAPI')

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/predict`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            features: {
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

              // Preserve both keys required by the current JSON.
              'Total Charges': Number(customer.totalCharges),
              'Total charges': Number(customer.totalCharges),
            },
          }),
        },
      )

      console.log('STEP 3: Response received from FastAPI')

      // Convert the API response into a JavaScript object.
      const data = await response.json()

      // Handle errors returned by FastAPI.
      if (!response.ok) {
        const errorMessage =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail ?? data)

        throw new Error(errorMessage)
      }

      console.log('STEP 4: Prediction successful', data)

      // Save the result so React can display it.
      setResult(data)
    } catch (err) {
      console.error('Prediction error:', err)

      setError(
        err.message ||
          'Could not connect to the API. Check that FastAPI is running.',
      )
    } finally {
      // Stop the loading indicator whether the request succeeds or fails.
      setLoading(false)
    }
  }

  // Define the dropdown fields
  const fields = [
    {
      label: 'Gender',
      name: 'gender',
      options: ['Female', 'Male'],
    },
    {
      label: 'Senior Citizen',
      name: 'seniorCitizen',
      options: ['No', 'Yes'],
    },
    {
      label: 'Partner',
      name: 'partner',
      options: ['Yes', 'No'],
    },
    {
      label: 'Dependents',
      name: 'dependents',
      options: ['Yes', 'No'],
    },
    {
      label: 'Phone Service',
      name: 'phoneService',
      options: ['Yes', 'No'],
    },
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

  // Display the dashboard
  return (
    <main className="dashboard">
      {/* Dashboard header */}
      <header className="topbar">
        <div className="brand-mark">CC</div>

        <div>
          <h1>Customer Churn Intelligence</h1>
          <p>Machine Learning Prediction Dashboard</p>
        </div>

        <span className="status">
          <span className="status-dot"></span>
          ML API
        </span>
      </header>

      {/* Existing dashboard components */}
      <DashboardStats />
      <CustomerCharts />

      {/* Introduction */}
      <section className="intro">
        <p className="eyebrow">CUSTOMER ANALYTICS / PREDICTION</p>

        <h2>Understand your customers.</h2>

        <p>
          Enter customer details to estimate the likelihood of customer churn
          using your trained machine learning model.
        </p>
      </section>

      {/* Customer input form */}
      <form className="customer-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <div>
            <h3>Customer profile</h3>
            <p>Choose the customer's information below.</p>
          </div>

          <span className="required-note">* Required</span>
        </div>

        <div className="field-grid">
          {/* Dropdown inputs */}
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

          {/* Tenure input */}
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

          {/* Monthly charges input */}
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

          {/* Total charges input */}
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

        {/* Prediction button */}
        <button
          className="predict-button"
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Analysing customer...'
            : 'Predict customer churn →'}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <section className="result error-result" role="alert">
          <h3>Prediction could not be completed</h3>
          <p>{error}</p>
        </section>
      )}

      {/* Prediction result */}
      {result && (
        <section className="result" aria-live="polite">
          <p className="eyebrow">PREDICTION RESULT</p>

          <h3>
            {['Yes', '1', 'True'].includes(String(result.prediction))
              ? 'Customer is predicted to churn'
              : 'Customer is predicted to stay'}
          </h3>

          <div className="probability-grid">
            {Object.entries(result.probabilities).map(
              ([label, probability]) => {
                const isChurnClass = ['Yes', '1', 'True'].includes(
                  String(label),
                )

                return (
                  <div className="probability-card" key={label}>
                    <span>
                      {isChurnClass
                        ? 'Churn probability'
                        : 'Stay probability'}
                    </span>

                    <strong>
                      {(Number(probability) * 100).toFixed(2)}%
                    </strong>
                  </div>
                )
              },
            )}
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
