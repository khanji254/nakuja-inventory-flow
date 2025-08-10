import { AuthService } from '../../src/lib/auth-service'

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Missing token' })

    const user = await AuthService.getCurrentUser(token)
    return res.status(200).json(user)
  } catch (error: any) {
    return res.status(401).json({ error: error?.message || 'Unauthorized' })
  }
}
