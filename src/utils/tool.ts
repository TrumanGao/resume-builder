import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function downloadPDF(option: { element: HTMLElement; pdfName: string }) {
  const { element, pdfName = 'resume.pdf' } = option
  const canvas = await html2canvas(element)
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF()

  // 将canvas添加到PDF中
  const imgProps = pdf.getImageProperties(imgData)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

  pdf.save(pdfName)
}
