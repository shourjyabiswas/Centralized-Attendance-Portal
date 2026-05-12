export function requireCronSecret(req, res, next) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'CRON_SECRET is not configured' })
  }

  const provided = req.headers['x-cron-secret']
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  return next()
}
