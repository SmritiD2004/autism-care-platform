import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [models, setModels] = useState([])

  useEffect(() => {
    // Check API health
    axios.get('http://localhost:8000/health')
      .then(response => setHealth(response.data))
      .catch(error => console.error('Health check failed:', error))

    // Fetch models
    axios.get('http://localhost:8000/api/v1/models')
      .then(response => setModels(response.data.models || []))
      .catch(error => console.error('Failed to fetch models:', error))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Autism Project</h1>
        <p>Frontend Application</p>
      </header>
      
      <main className="app-main">
        <section className="status-section">
          <h2>API Status</h2>
          {health ? (
            <div className="status-indicator healthy">
              <span>✓</span> {health.status}
            </div>
          ) : (
            <div className="status-indicator checking">
              Checking...
            </div>
          )}
        </section>

        <section className="models-section">
          <h2>Available Models</h2>
          {models.length > 0 ? (
            <ul className="models-list">
              {models.map((model) => (
                <li key={model.id} className="model-item">
                  <h3>{model.name}</h3>
                  <p>Version: {model.version}</p>
                  <p>Status: {model.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No models available</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
