import crypto from 'crypto';

// Generate random key code
export const generateKeyCode = () => {
  return crypto.randomBytes(12).toString('hex').toUpperCase();
};

// Calculate expiry time based on tier
export const getExpiryTime = (tier) => {
  const now = new Date();
  const tierDurations = {
    basic: 3 * 60 * 60 * 1000, // 3 hours
    advanced: 6 * 60 * 60 * 1000, // 6 hours
    premium: 24 * 60 * 60 * 1000, // 24 hours
  };
  return new Date(now.getTime() + tierDurations[tier]);
};

// Get tier info
export const getTierInfo = (tier) => {
  const tiers = {
    basic: { duration: 3, links: 1, price: 'Free' },
    advanced: { duration: 6, links: 1, price: '$2.99' },
    premium: { duration: 24, links: 2, price: '$9.99' },
  };
  return tiers[tier];
};

// Check if key is valid
export const isKeyValid = (key) => {
  return key.isActive && new Date() < new Date(key.expiresAt);
};
