import { useEffect, useState } from 'react'

function App() {
  const [data, setData] = useState("Connecting...")

  useEffect(() => {
    // Notice we only use '/api/test' because of the proxy we set up
    fetch('/api/test')
      .then(res => res.json())
      .then(data => setData(data.message))
      .catch(err => setData("Connection failed."));
  }, [])

  return (
    <div>
      <h1>My Local App</h1>
      <p>Server Status: <strong>{data}</strong></p>
    </div>
  )
}