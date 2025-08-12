import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { Question, TestTemplate } from '@/types/test';
import { toast } from 'sonner';

export const usePDFExport = () => {
  const exportToPDF = useCallback(async (questions: Question[], template: TestTemplate) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(template.title, pageWidth / 2, 25, { align: 'center' });
      
      // School and class info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      let yPos = 40;
      
      if (template.schoolName) {
        pdf.text(`Okul: ${template.schoolName}`, margin, yPos);
        yPos += 8;
      }
      
      if (template.className) {
        pdf.text(`Sınıf: ${template.className}`, margin, yPos);
      }
      
      if (template.teacherName) {
        pdf.text(`Öğretmen: ${template.teacherName}`, pageWidth - margin, yPos, { align: 'right' });
      }
      
      yPos += 8;
      
      if (template.date) {
        pdf.text(`Tarih: ${new Date(template.date).toLocaleDateString('tr-TR')}`, margin, yPos);
      }
      
      if (template.duration) {
        pdf.text(`Süre: ${template.duration} dakika`, pageWidth - margin, yPos, { align: 'right' });
      }
      
      // Line separator
      yPos += 10;
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;
      
      // Questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          pdf.addPage();
          yPos = margin;
        }
        
        // Question number
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const questionNumber = template.numberingStyle === 'numeric' 
          ? `${i + 1}.` 
          : `${String.fromCharCode(97 + i)})`;
        
        pdf.text(questionNumber, margin, yPos);
        
        // Question image
        try {
          const imgData = question.imageData;
          const imgWidth = Math.min(contentWidth - 20, 160);
          const imgHeight = (question.selection.height / question.selection.width) * imgWidth;
          
          if (yPos + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
            pdf.text(questionNumber, margin, yPos);
          }
          
          pdf.addImage(imgData, 'PNG', margin + 15, yPos - 5, imgWidth, imgHeight);
          yPos += imgHeight + 15;
          
        } catch (error) {
          console.error('Image addition error:', error);
          yPos += 20;
        }
        
        // Add some space between questions
        yPos += 10;
      }
      
      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Sayfa ${i} / ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      const fileName = `${template.title.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s]/g, '')}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF başarıyla oluşturuldu ve indirildi!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF oluşturulurken hata oluştu');
    }
  }, []);

  return { exportToPDF };
};