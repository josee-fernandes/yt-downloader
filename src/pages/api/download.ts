import type { NextApiRequest, NextApiResponse } from 'next'
import YTDlpWrap from 'yt-dlp-wrap'
import fs from 'node:fs'

type OutputType = 'audio' | 'video'

const VIDEO_ARGS = [
  '--write-description',
  '--write-info-json',
  '--write-annotations',
  '--write-sub',
  '--write-thumbnail',
  '--merge-output-format',
  'mp4',
  '-f',
  'bestvideo[height<=?1080]+bestaudio/best[height<=?1080]',
  '-o',
] as const

const AUDIO_ARGS = [
  '-x',
  '--audio-format',
  'mp3',
  '--audio-quality',
  '0',
  '-o',
] as const

const OUTPUT_FOLDER = 'public/downloads'

const BINARY_PATH = 'yt-dlp/binary'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  if (!req.query.url && !req.query.type) {
    return res.status(404).json({ message: 'Missing video url or output type' })
  }

  const url = String(req.query.url)
  const outputType = String(req.query.type) as OutputType

  const ytDlpWrap = new YTDlpWrap(BINARY_PATH)

  const args = outputType === 'audio' ? AUDIO_ARGS : VIDEO_ARGS

  const outputUrl =
    outputType === 'video'
      ? `${OUTPUT_FOLDER}/%(title)s/%(title)s [%(id)s].%(ext)s`
      : `${OUTPUT_FOLDER}/%(title)s [%(id)s].%(ext)s`

  const command = [...args, outputUrl, url]

  if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER)
  }

  try {
    const response = await ytDlpWrap.execPromise(command)

    const hasAlreadyDownloaded = !!response.includes('already been downloaded')

    let storedFileUrl = ''

    if (hasAlreadyDownloaded) {
      storedFileUrl = response
        .split('[download] public/')[1]
        .split(' has already been downloaded')[0]
    } else {
      storedFileUrl = response
        .split('[ExtractAudio] Destination: public/')[1]
        .split('\nDeleting original file')[0]
    }
    return res
      .status(200)
      .json({ message: 'Downloaded successfully!', url: storedFileUrl })
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Couldn't download the provided url" })
  }
}
