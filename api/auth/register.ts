import { AuthService } from '../../src/lib/auth-service'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { name, email, password, role, teamId } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    const result = await AuthService.register({ name, email, password, role, teamId })
    return res.status(201).json(result)
  } catch (error: any) {
    return res.status(400).json({ error: error?.message || 'Registration failed' })
  }
}
