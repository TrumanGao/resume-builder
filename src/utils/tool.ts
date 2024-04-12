export async function downloadPDF(option: { element: HTMLElement; pdfName: string }) {
  const { element, pdfName = 'resume.pdf' } = option

  const html2canvas = (await import('html2canvas')).default

  const canvas = await html2canvas(element, {
    scale: window.devicePixelRatio * 2,
    useCORS: true,
    allowTaint: true,
    logging: false
  })
  const imgData = canvas.toDataURL('image/jpeg', 1.0)

  const jsPDF = (await import('jspdf')).jsPDF
  const pdf = new jsPDF()

  // 将canvas添加到PDF中
  const imgProps = pdf.getImageProperties(imgData)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')

  pdf.save(pdfName)
}

export function isWechat() {
  return (
    /MicroMessenger/i.test(window.navigator.userAgent) || /wxwork/i.test(window.navigator.userAgent)
  )
}
