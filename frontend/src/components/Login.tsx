import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';

// 1. Define the Validation Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  // 2. Initialize Hook Form
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log("Login response:", result);
    // Handle success/error here
  } catch (error) {
    console.error("Login error:", error);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">HAR Login</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              {...register("email")}
              className={`w-full mt-1 p-2 border rounded-lg outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-500'}`}
              placeholder="employee@harmony.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password"
              {...register("password")}
              className={`w-full mt-1 p-2 border rounded-lg outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-500'}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 transition"
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          New to Harmony? <Link to="/register" className="text-indigo-600 hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;