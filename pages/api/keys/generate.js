import { db } from '@/lib/db';
import { generateKeyCode, getExpiryTime } from '@/lib/utils';
import { createShortlink } from '@/lib/link4';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tier, isAdmin } = req.body;

    if (!tier || !['basic', 'advanced', 'premium'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Generate key
    const keyCode = generateKeyCode();
    const expiresAt = getExpiryTime(tier);

    const key = db.createKey({
      keyCode,
      tier,
      expiresAt,
      isActive: false,
      isBypassRequired: !isAdmin,
      createdAt: new Date(),
    });

    // Create shortlink (nếu user, không phải admin)
    let shortUrl = null;
    if (!isAdmin) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bypass/${key.id}`;
      const shortlinkResult = await createShortlink(redirectUrl);

      if (shortlinkResult.success) {
        shortUrl = shortlinkResult.shortUrl;
        db.createLink({
          keyId: key.id,
          shortUrl,
          bypassedAt: null,
          status: 'pending',
        });
      }
    }

    return res.status(201).json({
      success: true,
      key: {
        id: key.id,
        keyCode: isAdmin ? key.keyCode : null, // Admin thấy key ngay
        shortUrl: isAdmin ? null : shortUrl, // User thấy shortlink
        tier: key.tier,
        expiresAt: key.expiresAt,
        isActive: key.isActive,
      },
    });
  } catch (error) {
    console.error('Generate Key Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
