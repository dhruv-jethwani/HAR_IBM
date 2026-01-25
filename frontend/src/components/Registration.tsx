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
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Join Harmony</h2>
          <p className="text-slate-500 text-sm mt-1">Start your activity tracking journey</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              {...register("fullName")} 
              placeholder="e.g. Krish Patel"
              className={`w-full p-2 border rounded-lg outline-none transition-all ${errors.fullName ? 'border-red-500 focus:ring-1 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`} 
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
            <input 
              type="email"
              {...register("email")} 
              placeholder="name@company.com"
              className={`w-full p-2 border rounded-lg outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`} 
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                {...register("password")} 
                placeholder="Min. 8 chars"
                className={`w-full p-2 border rounded-lg outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-1 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`} 
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm</label>
              <input 
                type="password" 
                {...register("confirmPassword")} 
                placeholder="Repeat password"
                className={`w-full p-2 border rounded-lg outline-none transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-1 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`} 
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 active:scale-[0.98] transition-all shadow-sm"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;