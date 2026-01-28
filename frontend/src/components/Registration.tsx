import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';

// 1. Enhanced Validation Schema
const registerSchema = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Name is too long"),
  email: z.string()
    .email("Please enter a valid work email (e.g., name@company.com)"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert("Account created! Redirecting to login...");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Registration failed");
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0f172a] overflow-hidden px-4">
      {/* Dynamic Background Elements */}
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
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Join Harmony</h2>
            <p className="mt-2 text-slate-400 text-sm">Create your account to start tracking</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="group">
              <label className="ml-1 block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 transition-colors group-focus-within:text-indigo-400">
                Full Name
              </label>
              <input 
                {...register("fullName")} 
                placeholder="e.g. Krish Patel"
                className={`w-full bg-white/5 border px-4 py-3.5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 focus:bg-white/10 ${errors.fullName ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} 
              />
              {errors.fullName && <p className="mt-2 text-xs text-red-400 ml-1">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="group">
              <label className="ml-1 block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 transition-colors group-focus-within:text-indigo-400">
                Work Email
              </label>
              <input 
                type="email"
                {...register("email")} 
                placeholder="name@company.com"
                className={`w-full bg-white/5 border px-4 py-3.5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 focus:bg-white/10 ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} 
              />
              {errors.email && <p className="mt-2 text-xs text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="ml-1 block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 transition-colors group-focus-within:text-indigo-400">
                  Password
                </label>
                <input 
                  type="password" 
                  {...register("password")} 
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border px-4 py-3.5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 focus:bg-white/10 ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} 
                />
              </div>
              <div className="group">
                <label className="ml-1 block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 transition-colors group-focus-within:text-indigo-400">
                  Confirm
                </label>
                <input 
                  type="password" 
                  {...register("confirmPassword")} 
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border px-4 py-3.5 rounded-2xl text-white outline-none transition-all placeholder:text-slate-600 focus:bg-white/10 ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} 
                />
              </div>
            </div>
            {(errors.password || errors.confirmPassword) && (
              <p className="text-xs text-red-400 ml-1">
                {errors.password?.message || errors.confirmPassword?.message}
              </p>
            )}

            {/* Submit Button */}
            <button 
              disabled={isSubmitting}
              className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 py-4 font-bold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20"></div>
              </div>
              <span className="relative">
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-white hover:text-indigo-400 transition-colors border-b border-white/20 hover:border-indigo-400/50 pb-0.5">
              Log in
            </Link>
          </div>
        </div>

        {/* Bottom Tagline */}
        <p className="mt-6 text-center text-xs text-slate-500 uppercase tracking-[0.2em]">
          Secure • Reliable • Harmony
        </p>
      </div>
    </div>
  );
};

export default Register;