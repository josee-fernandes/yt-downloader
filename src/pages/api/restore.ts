import fs from 'node:fs'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'DELETE') {
    return res.status(405).end()
  }

  if (!req.query.url && !req.query.type) {
    return res.status(404).json({ message: 'Missing video url or output type' })
  }

  const url = String(req.query.url)

  console.log(url)

  const filePath = `public/${url}`

  fs.rmSync(filePath)

  if (!fs.existsSync(filePath)) {
    return res.status(204).end()
  }

  return res.status(400).json({ message: 'Error deleting stored file' })
}
