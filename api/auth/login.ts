import { AuthService } from '../../src/lib/auth-service'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await AuthService.login({ email, password })
    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(401).json({ error: error?.message || 'Invalid credentials' })
  }
}
