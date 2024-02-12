import type { NextApiRequest, NextApiResponse } from 'next'
import YTDlpWrap from 'yt-dlp-wrap'
import fs from 'node:fs'

interface RequestType {
  mode: 'audio' | 'video'
  url: string
}

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

interface CommandType {
  args: typeof VIDEO_ARGS | typeof AUDIO_ARGS
  url: string
  outputUrl: string
}

const OUTPUT_FOLDER = 'downloads'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const binaryPath = 'yt-dlp/binary'

  const ytDlpWrap = new YTDlpWrap(binaryPath)

  const requesting: RequestType = {
    mode: 'audio',
    url: 'https://www.youtube.com/watch?v=QJO3ROT-A4E',
  }

  const { mode, url } = requesting

  const commandOptions: CommandType = {
    args: mode === 'audio' ? AUDIO_ARGS : VIDEO_ARGS,
    url,
    outputUrl:
      mode === 'video'
        ? `${OUTPUT_FOLDER}/%(title)s/%(title)s-%(id)s.%(ext)s`
        : `${OUTPUT_FOLDER}/%(title)s-%(id)s.%(ext)s`,
  }

  const { args, outputUrl } = commandOptions

  const command = [...args, outputUrl, url]

  if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER)
  }

  const ytDlpEventEmitter = ytDlpWrap
    .exec(command)
    .on('ytDlpEvent', (eventType, eventData) =>
      console.log(eventType, eventData),
    )
    .on('error', (error) => console.error(error))
    .on('close', () => console.log('all done'))

  console.log({ exitCode: ytDlpEventEmitter.ytDlpProcess?.exitCode })

  res.status(200).json({ success: true })
}
