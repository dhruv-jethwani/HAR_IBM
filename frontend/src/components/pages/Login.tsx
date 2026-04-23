import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const btnRef = useRef<HTMLButtonElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

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

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://har-backend-10x1.onrender.com';
      
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', 'session_active');
        localStorage.setItem('user_email', result.email);
        localStorage.setItem('user_role', result.role || 'user');
        navigate('/home');
      } else {
        setServerError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) { 
      setServerError('An error occurred. Please try again later.');
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{ background: 'rgb(250 249 247)', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-violet" style={{ width: '600px', height: '600px', top: '-150px', left: '-100px' }} />
        <div className="orb orb-amber" style={{ width: '500px', height: '500px', bottom: '-100px', right: '-80px' }} />
        <div className="grid-texture absolute inset-0" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="card-light animate-scale-in" style={{ padding: '2.75rem 2.5rem' }}>
          <div className="flex flex-col items-center mb-9 animate-fade-up">
            <div className="logo-mark mb-5">HAR</div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.875rem', fontWeight: 400, color: 'rgb(20 18 16)', letterSpacing: '-0.02em' }}>
              Welcome back
            </h1>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgb(100 95 88)' }}> Sign in to continue to HAR-Cloud </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {serverError && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{serverError}</div>}
            <div className="space-y-2">
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgb(100 95 88)' }}>Email</label>
              <input {...register("email")} type="email" placeholder="name@gmail.com" className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-indigo-500 transition-all" />
              {errors.email && <p className="text-[13px] text-red-400/90">{errors.email.message}</p>}
            </div>

            <div className="animate-fade-up delay-200" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgb(100 95 88)', marginTop: "1rem" }}> Password </label>
              <div style={{ position: 'relative' }}>
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Enter your password"
                  className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-indigo-500 transition-all"
                  style={{ paddingRight: '4.5rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 600, color: 'rgb(99 91 255)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '0.8125rem', color: 'rgb(190 50 70)', margin: 0 }}>{errors.password.message}</p>}
            </div>

            <div className="animate-fade-up delay-300">
              <button ref={btnRef} type="submit" disabled={isSubmitting} className="btn-brand-light" onClick={handleBtnClick} style={{ marginTop: '3rem' }}>
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>

          <div className="divider animate-fade-up delay-400" style={{ margin: '1.75rem 0' }} />

          <p className="animate-fade-up delay-500" style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgb(130 125 118)', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'rgb(99 91 255)', textDecoration: 'none' }}> Create one </Link>
          </p>
        </div>
        <p className="animate-fade-in delay-500" style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgb(190 185 178)' }}>
          © 2026 HAR-Cloud · Secure Login
        </p>
      </div>
    </div>
  );
};

export default Login;