import React, { useState } from 'react';
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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      console.log("Registering:", data);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#09090b] px-4 font-sans antialiased selection:bg-indigo-500/30">
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-md shadow-2xl">
          
          <div className="px-10 pt-12 pb-10">

            {/* Branding */}
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <span className="text-xl font-bold text-indigo-500 italic"> HAR </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                Create your account
              </h1>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Full Name
                </label>
                <input
                  {...register("fullName")}
                  type="text"
                  placeholder="Krish Patel"
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                {errors.fullName && (
                  <p className="text-[13px] font-medium text-red-400/90">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Work Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@gmail.com"
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                {errors.email && (
                  <p className="text-[13px] font-medium text-red-400/90">{errors.email.message}</p>
                )}
              </div>

              {/* Password Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    Password
                  </label>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    Confirm
                  </label>
                  <input
                    {...register("confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              {/* Error messages for passwords */}
              {(errors.password || errors.confirmPassword) && (
                <div className="space-y-1">
                  {errors.password && <p className="text-[13px] font-medium text-red-400/90">{errors.password.message}</p>}
                  {errors.confirmPassword && <p className="text-[13px] font-medium text-red-400/90">{errors.confirmPassword.message}</p>}
                </div>
              )}

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-medium text-zinc-400 hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                  {showPassword ? "Hide passwords" : "Show passwords"}
                </button>
              </div>

              <button
                disabled={isSubmitting}
                className="relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-lg bg-indigo-600 px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Create free account"
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-zinc-200 hover:text-indigo-400 transition-colors">
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-6 text-[12px] font-medium text-zinc-600">
          <span className="cursor-default">© 2026 HAR UI</span>
        </div>
      </div>
    </div>
  );
};

export default Register;