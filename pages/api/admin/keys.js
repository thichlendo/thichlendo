import { db } from '@/lib/db';
import { verifyAdminPassword } from '@/lib/auth';

export default function handler(req, res) {
  const { adminPassword } = req.query;

  if (!verifyAdminPassword(adminPassword)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const keys = db.getAllKeys();
    return res.status(200).json({ success: true, keys });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
