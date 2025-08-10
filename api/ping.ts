export default async function handler(req: any, res: any) {
  const info = {
    method: req.method,
    url: req.url,
    headers: req.headers,
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS')
    return res.status(204).end()
  }
  return res.status(200).json(info)
}
