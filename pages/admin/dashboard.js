'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAdminLoggedIn, adminLogout } from '@/lib/auth';
import { db } from '@/lib/db';
import { getTierInfo, isKeyValid } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin/login');
      return;
    }

    // Load keys (tạm thời từ in-memory DB)
    setKeys(db.getAllKeys());
    setLoading(false);
  }, [router]);

  const handleGenerateKey = async (tier) => {
    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, isAdmin: true }),
      });

      const data = await response.json();
      if (data.success) {
        setKeys(db.getAllKeys()); // Refresh
        alert(`Key generated: ${data.key.keyCode}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Generate Key Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {['basic', 'advanced', 'premium'].map((tier) => (
            <button
              key={tier}
              onClick={() => handleGenerateKey(tier)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white font-bold py-3 rounded-lg capitalize transition"
            >
              Generate {tier}
            </button>
          ))}
        </div>

        {/* Keys Table */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">All Keys</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2">Key Code</th>
                  <th className="text-left py-2">Tier</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Expires At</th>
                </tr>
              </thead>
              <tbody>
                {keys.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-white/50">
                      No keys generated yet
                    </td>
                  </tr>
                ) : (
                  keys.map((key) => (
                    <tr key={key.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-
