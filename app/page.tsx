'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Tier = 'basic' | 'advanced' | 'premium';

interface KeyData {
  id: number;
  keyCode: string;
  shortUrl: string | null;
  tier: Tier;
  expiresAt: string;
  isActive: boolean;
}

export default function Home() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyData, setKeyData] = useState<KeyData | null>(null);
  const [showKey, setShowKey] = useState(false);

  const tiers = [
    {
      id: 'basic',
      name: 'Basic',
      duration: '3 hours',
      links: '1 Link4 Shortlink',
      price: 'Free',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'advanced',
      name: 'Advanced',
      duration: '6 hours',
      links: '1 Link4 Shortlink',
      price: '$2.99',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'premium',
      name: 'Premium',
      duration: '24 hours',
      links: '2 Link4 Shortlinks',
      price: '$9.99',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const handleGenerateKey = async (tier: Tier) => {
    setLoading(true);
    setSelectedTier(tier);

    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, isAdmin: false }),
      });

      const data = await response.json();

      if (data.success) {
        setKeyData(data.key);
        setShowKey(false); // Chưa bypass, chưa hiện key
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate key');
    } finally {
      setLoading(false);
    }
  };

  const handleBypassLink = () => {
    if (keyData?.shortUrl) {
      // Mở shortlink ở tab mới
      window.open(keyData.shortUrl, '_blank');

      // Sau 2 giây, kiểm tra bypass (giả lập webhook)
      setTimeout(() => {
        setShowKey(true);
      }, 2000);
    }
  };

  const resetForm = () => {
    setKeyData(null);
    setShowKey(false);
    setSelectedTier(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              SapMaChit
            </h1>
            <p className="text-white/60">Generate Keys with Link4 Shortlinks</p>
          </div>
          <Link
            href="/admin/login"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Admin Panel
          </Link>
        </div>

        {/* Main Content */}
        {!keyData ? (
          // Tier Selection
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:border-white/40 transition group cursor-pointer"
                onClick={() => handleGenerateKey(tier.id as Tier)}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${tier.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition -z-10`}
                ></div>

                <h3 className="text-2xl font-bold text-white mb-4">{tier.name}</h3>

                <div className="space-y-3 mb-6">
                  <p className="text-white/80 flex items-center">
                    <span className="mr-2">⏱️</span> {tier.duration}
                  </p>
                  <p className="text-white/80 flex items-center">
                    <span className="mr-2">🔗</span> {tier.links}
                  </p>
                </div>

                <p className={`text-3xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-6`}>
                  {tier.price}
                </p>

                <button
                  onClick={() => handleGenerateKey(tier.id as Tier)}
                  disabled={loading && selectedTier === tier.id}
                  className={`w-full py-2 rounded-lg font-bold text-white transition ${
                    loading && selectedTier === tier.id
                      ? 'bg-gray-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${tier.color} hover:shadow-lg`
                  }`}
                >
                  {loading && selectedTier === tier.id ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            ))}
          </div>
        ) : !showKey ? (
          // Bypass Link Screen
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Bypass Link Required</h2>

            <p className="text-white/80 mb-6 text-center">
              Click the button below to bypass the Link4 shortlink and receive your key.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <p className="text-white/60 text-xs mb-2">Shortlink:</p>
              <p className="text-white break-all font-mono text-sm">{keyData.shortUrl}</p>
            </div>

            <button
              onClick={handleBypassLink}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white font-bold py-3 rounded-lg transition mb-4"
            >
              Open Shortlink & Get Key
            </button>

            <button
              onClick={resetForm}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition border border-white/20"
            >
              Cancel
            </button>

            <p className="text-white/50 text-sm text-center mt-4">
              ⏳ After bypassing, your key will appear here automatically
            </p>
          </div>
        ) : (
          // Key Display Screen
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">✅ Key Generated!</h2>
              <p className="text-white/60">Your key is ready to use</p>
            </div>

            <div className="space-y-6">
              {/* Key Code */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-2">Your Key:</p>
                <p className="text-white font-mono text-lg font-bold break-all">{keyData.keyCode}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(keyData.keyCode)}
                  className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
                >
                  📋 Copy to Clipboard
                </button>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-sm">Tier</p>
                  <p className="text-white font-bold capitalize">{keyData.tier}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-sm">Status</p>
                  <p className={`font-bold ${keyData.isActive ? 'text-green-400' : 'text-yellow-400'}`}>
                    {keyData.isActive ? '🟢 Active' : '⏳ Pending'}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4 col-span-2">
                  <p className="text-white/60 text-sm">Expires At</p>
                  <p className="text-white font-mono text-sm">
                    {new Date(keyData.expiresAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Validity */}
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <p className="text-green-300 font-bold">✅ Key is Valid</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white font-bold py-2 rounded-lg transition"
                >
                  Generate Another
                </button>

                <button
                  onClick={() => router.push('/admin/login')}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition border border-white/20"
                >
                  Admin Panel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-white/50 text-sm">
          <p>SapMaChit • Key Generation System with Link4 Integration</p>
        </div>
      </div>
    </div>
  );
}

