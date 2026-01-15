import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState("Loading...")
  const [error, setError] = useState(null)

  useEffect(() => {
    // We use the proxy path '/api/test'
    fetch('/api/test')
      .then(response => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json(); // STEP 1: Parse to JSON
      })
      .then(data => {
        console.log("Success! Data received:", data);
        setMessage(data.message); // STEP 2: Update State
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, []); // STEP 3: Ensure this empty array is here

  return (
    <div style={{ padding: '20px' }}>
      <h1>Status Check</h1>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <p>Server Message: <strong>{message}</strong></p>
      )}
    </div>
  )
}

export default App