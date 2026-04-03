import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';

// 1. Validation Schema
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const btnRef = useRef<HTMLButtonElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // Ripple Effect Logic
  const handleBtnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };

  // 2. Optimized Submit Handler
  const onSubmit = async (data: RegisterFormValues) => {
    setServerError('');
    try {
      // Pull API URL from Env or fallback to your Render URL
      const API_BASE = import.meta.env.VITE_API_URL || 'https://har-backend-10x1.onrender.com';
      
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        navigate('/login');
      } else {
        setServerError(result.error || 'Registration failed.');
      }
    } catch (error) {
      setServerError('Could not connect to the server. Please try again later.');
      console.error("Fetch Error:", error);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgb(100 95 88)',
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-8"
      style={{ background: 'rgb(250 249 247)', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-violet" style={{ width: '700px', height: '700px', top: '-200px', right: '-150px' }} />
        <div className="orb orb-rose" style={{ width: '500px', height: '500px', bottom: '-80px', left: '-80px' }} />
        <div className="grid-texture absolute inset-0" />
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="card-light animate-scale-in" style={{ padding: '2.75rem 2.5rem' }}>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div className="flex flex-col items-center mb-6 animate-fade-up">
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#141210' }}>
                Register
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-[1px] w-8 bg-slate-200"></div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-slate-400 font-semibold">Start your journey</p>
                <div className="h-[1px] w-8 bg-slate-200"></div>
              </div>
            </div>

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p style={{ fontSize: '0.875rem', color: 'rgb(190 50 70)', textAlign: 'center' }}>{serverError}</p>
              </div>
            )}
            
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Full Name</label>
              <input {...register("fullName")} type="text" placeholder="Your Name" className="input-light" />
              {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
            </div>

            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Work Email</label>
              <input {...register("email")} type="email" placeholder="name@company.com" className="input-light" />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="animate-fade-up">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Password</label>
                  <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="input-light" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Confirm</label>
                  <input {...register("confirmPassword")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="input-light" />
                </div>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-2 text-indigo-600 text-xs font-semibold flex items-center gap-1 hover:opacity-75 transition-opacity"
              >
                {showPassword ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            <div className="pt-2">
              <button
                ref={btnRef}
                type="submit"
                disabled={isSubmitting}
                className="btn-brand-light w-full"
                onClick={handleBtnClick}
              >
                {isSubmitting ? "Creating account…" : "Create free account"}
              </button>
            </div>
          </form>

          <div className="h-[1px] w-full bg-slate-100 my-8" />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgb(130 125 118)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:opacity-75">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;