import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard'; 

interface ApiResponse {
  message: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<string>("Connecting...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/test')
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then((json) => {
        setData(json.message);
      })
      .catch((err: Error) => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, []);

  // 2. If there is an error connecting to Flask, you might want to show that
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-red-500">Backend Connection Error: {error}</p>
      </div>
    );
  }

  // 3. Render the Dashboard component here
  return (
    <>
      {/* You can keep this small status bar at the top for debugging */}
      <div className="bg-slate-900 text-xs text-slate-500 p-1 text-center border-b border-slate-800">
        Backend Status: {data}
      </div>
      
      <Dashboard /> 
    </>
  );
};

export default App;