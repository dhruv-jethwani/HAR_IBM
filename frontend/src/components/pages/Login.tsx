import React, { useState } from 'react';
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
        localStorage.setItem('auth_token', 'session_active'); 
        navigate('/home');
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#09090b] px-4 font-sans antialiased selection:bg-indigo-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-md shadow-2xl p-10">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 font-bold text-xl italic">HAR</div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Sign in</h1>
            <p className="mt-2 text-sm text-zinc-400">Enter your details to continue</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">Email</label>
              <input {...register("email")} type="email" placeholder="name@gmail.com" className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none focus:border-indigo-500 transition-all" />
              {errors.email && <p className="text-[13px] text-red-400/90">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><label className="text-xs font-medium uppercase tracking-widest text-zinc-500">Password</label></div>
              <div className="relative">
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Enter your password" className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none focus:border-indigo-500 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                   {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-[13px] text-red-400/90">{errors.password.message}</p>}
            </div>
            <button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.99]">{isSubmitting ? "Signing in..." : "Sign in"}</button>
          </form>
          <div className="mt-10 text-center">
            <p className="text-sm text-zinc-500">Don't have an account? <Link to="/register" className="font-medium text-zinc-200 hover:text-indigo-400 transition-colors">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;