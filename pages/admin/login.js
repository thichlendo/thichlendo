'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { adminLogin } from '@/lib/auth';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adminLogin(password)) {
      router.push('/admin/dashboard');
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 w-96 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          />
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded-lg hover:shadow-lg transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
