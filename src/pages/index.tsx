import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { ArrowCircleDown, CircleDashed } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { download } from '@/utils/download'

interface DownloadResponse {
  message: string
  url: string
}

interface DeleteResponse {
  message: string
}

const downloadFormSchema = z.object({
  url: z.string().url(),
})

type DownloadFormData = z.infer<typeof downloadFormSchema>

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DownloadFormData>({
    resolver: zodResolver(downloadFormSchema),
  })

  const handleDelete = async (url: string) => {
    try {
      const response = await axios.delete<DeleteResponse>(
        `/api/restore?url=${url}`,
      )

      console.log(response.data.message)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDownload = async (data: DownloadFormData) => {
    const { url } = data
    try {
      const response = await axios.get<DownloadResponse>(
        `/api/download?type=audio&url=${url}`,
      )

      download(response.data.url)

      handleDelete(response.data.url)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <form
        onSubmit={handleSubmit(handleDownload)}
        className="flex w-[940px] flex-wrap items-end gap-2 px-4"
      >
        <label className="flex flex-1 flex-col gap-2">
          URL
          <input
            type="url"
            className="h-12 rounded-lg border-[1px] border-zinc-500 bg-zinc-700 p-2 text-zinc-100"
            required
            placeholder="Insira aqui a URL do vídeo do YouTube"
            {...register('url')}
          />
        </label>
        <button
          type="submit"
          className=":not:disabled:hover:bg-emerald-700 flex h-12 w-[280px] items-center justify-center gap-2 rounded-lg bg-emerald-500 p-4 transition disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircleDashed className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowCircleDown className="h-5 w-5" />
          )}
          Download
        </button>
      </form>
    </div>
  )
}
