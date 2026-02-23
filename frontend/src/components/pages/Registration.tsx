import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';

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

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setServerError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setServerError('An error occurred. Please try again later.');
      console.error(error);
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

          {/* Branding */}
          <div className="flex flex-col items-center mb-9 animate-fade-up">
            <div className="logo-mark mb-5">HAR</div>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '1.875rem',
                fontWeight: 400,
                color: 'rgb(20 18 16)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Create your account
            </h1>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgb(100 95 88)' }}>
              Join HAR-Cloud to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {serverError && (
              <div className="error-box">
                <p style={{ fontSize: '0.875rem', color: 'rgb(190 50 70)', margin: 0 }}>{serverError}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="animate-fade-up delay-100" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Full Name</label>
              <input {...register("fullName")} type="text" placeholder="Krish Patel" className="input-light" />
              {errors.fullName && <p style={{ fontSize: '0.8125rem', color: 'rgb(190 50 70)', margin: 0 }}>{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="animate-fade-up delay-150" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Work Email</label>
              <input {...register("email")} type="email" placeholder="name@company.com" className="input-light" />
              {errors.email && <p style={{ fontSize: '0.8125rem', color: 'rgb(190 50 70)', margin: 0 }}>{errors.email.message}</p>}
            </div>

            {/* Password grid */}
            <div className="animate-fade-up delay-200">
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

              {(errors.password || errors.confirmPassword) && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {errors.password && <p style={{ fontSize: '0.8125rem', color: 'rgb(190 50 70)', margin: 0 }}>{errors.password.message}</p>}
                  {errors.confirmPassword && <p style={{ fontSize: '0.8125rem', color: 'rgb(190 50 70)', margin: 0 }}>{errors.confirmPassword.message}</p>}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  marginTop: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'rgb(99 91 255)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'opacity 0.15s',
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  {showPassword
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
                {showPassword ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            {/* Submit */}
            <div className="animate-fade-up delay-300" style={{ marginTop: '0.25rem' }}>
              <button
                ref={btnRef}
                type="submit"
                disabled={isSubmitting}
                className="btn-brand-light"
                onClick={handleBtnClick}
              >
                {isSubmitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                    <span>Creating account…</span>
                  </div>
                ) : "Create free account"}
              </button>
            </div>
          </form>

          <div className="divider animate-fade-up delay-400" style={{ margin: '1.75rem 0' }} />

          <p className="animate-fade-up delay-500" style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgb(130 125 118)', margin: 0 }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ fontWeight: 600, color: 'rgb(99 91 255)', textDecoration: 'none', transition: 'opacity 0.15s ease' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Log in here
            </Link>
          </p>
        </div>

        <p className="animate-fade-in delay-500" style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgb(190 185 178)' }}>
          © 2026 HAR UI · Secure Registration
        </p>
      </div>
    </div>
  );
};

export default Register;