export const download = (url: string) => {
  const anchor = document.createElement('a')
  anchor.setAttribute('href', url)
  anchor.setAttribute('target', '_blank')
  anchor.setAttribute('download', '')
  document.body.appendChild(anchor)
  anchor.click()

  document.body.removeChild(anchor)
}
