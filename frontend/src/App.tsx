import { useEffect, useState } from 'react';
import { Dashboard } from './components/pages/Dashboard'; 

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


  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-red-500">Backend Connection Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <Dashboard />       
    </>
  );
};

export default App;