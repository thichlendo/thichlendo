import { db } from '@/lib/db';
import { isKeyValid } from '@/lib/utils';

export default function handler(req, res) {
  const { keyId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const key = db.getKeyById(parseInt(keyId));

    if (!key) {
      return res.status(404).json({ error: 'Key not found' });
    }

    // Mark as bypassed
    const updatedKey = db.updateKey(key.id, {
      isActive: true,
      bypassedAt: new Date(),
    });

    const link = db.getLinkByShortUrl(req.headers.referer);
    if (link) {
      db.updateLink(link.id, { bypassedAt: new Date(), status: 'bypassed' });
    }

    return res.status(200).json({
      success: true,
      key: {
        keyCode: updatedKey.keyCode,
        tier: updatedKey.tier,
        expiresAt: updatedKey.expiresAt,
        isActive: updatedKey.isActive,
        isValid: isKeyValid(updatedKey),
      },
    });
  } catch (error) {
    console.error('Bypass Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
