import { AuthService } from '../../src/lib/auth-service'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Missing token' })

    await AuthService.logout(token)
    return res.status(204).end()
  } catch (error: any) {
    return res.status(401).json({ error: error?.message || 'Unauthorized' })
  }
}
