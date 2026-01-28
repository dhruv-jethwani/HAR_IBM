import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';

// 1. Define the Validation Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  
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
      
      if (response.ok) {
        alert("Login Successful!");
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0f172a] overflow-hidden px-4">
      {/* Dynamic Background Elements - Matches Register Page */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative w-full max-w-md">
        {/* Glassmorphic Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
          
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <span className="text-3xl font-bold text-white">H</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
            <p className="mt-2 text-slate-400 text-sm">Sign in to continue to Harmony</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="group">
              <label className="ml-1 block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 transition-colors group-focus-within:text-indigo-400">
                Work Email
              </label>
              <div className="relative">
                <input 
                  {...register("email")}
                  type="email"
                  placeholder="employee@harmony.com"
                  className={`w-full bg-white/5 border px-4 py-4 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 focus:bg-white/10 ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 transition-colors group-focus-within:text-indigo-400">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input 
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border px-4 py-4 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 focus:bg-white/10 ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                />
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-400 ml-1">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button 
              disabled={isSubmitting}
              className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 py-4 font-bold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20"></div>
              </div>
              
              <span className="relative">
                {isSubmitting ? 'Verifying...' : 'Sign In'}
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center text-sm text-slate-400">
            New to Harmony?{' '}
            <Link to="/register" className="font-bold text-white hover:text-indigo-400 transition-colors border-b border-white/20 hover:border-indigo-400/50 pb-0.5">
              Create account
            </Link>
          </div>
        </div>

        {/* Bottom Decorative Tagline */}
        <p className="mt-6 text-center text-xs text-slate-500 uppercase tracking-[0.2em]">
          Secure Access • Global Harmony
        </p>
      </div>
    </div>
  );
};

export default Login;