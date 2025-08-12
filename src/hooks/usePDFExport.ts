import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { Question, TestTemplate } from '@/types/test';
import { toast } from 'sonner';

// Add Turkish font support
declare module 'jspdf' {
  interface jsPDF {
    addFont(url: string, id: string, style: string): void;
  }
}

export const usePDFExport = () => {
  const generatePDF = useCallback(async (questions: Question[], template: TestTemplate) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set default font to helvetica which supports Turkish characters in newer jsPDF versions
    pdf.setFont('helvetica', 'normal');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12; // Reduced margin for more space
    const columnGap = 6; // Reduced gap for more space  
    const columnWidth = (pageWidth - (margin * 2) - columnGap) / 2;
    const leftColumnX = margin;
    const rightColumnX = margin + columnWidth + columnGap;
      
    // Helper function to draw page header (only for first page)
    const drawHeader = (isFirstPage = true) => {
      if (!isFirstPage) {
        // For non-first pages, just return minimal spacing and draw column separator
        const headerBottom = 25; // Much smaller top margin for subsequent pages
        pdf.setLineWidth(0.3);
        pdf.line(pageWidth / 2, headerBottom, pageWidth / 2, pageHeight - 12);
        return headerBottom + 5;
      }
      // School name - centered, compact with Turkish support
      pdf.setFontSize(16); // Reduced from 18
      pdf.setFont('helvetica', 'bold');
      pdf.text(template.schoolName || 'OKUL ADI', pageWidth / 2, 18, { align: 'center' }); // Reduced from 20
      
      // Test title - centered, compact with Turkish support
      pdf.setFontSize(12); // Reduced from 14
      pdf.setFont('helvetica', 'bold');
      pdf.text(template.title || 'SINAV ADI', pageWidth / 2, 26, { align: 'center' }); // Reduced from 30
      
      // Student info section - more compact with Turkish support
      pdf.setFontSize(10); // Reduced from 11
      pdf.setFont('helvetica', 'normal');
      
      const infoY = 38; // Reduced from 45
      // Left side
      pdf.text('ADI SOYADI:', margin, infoY);
      pdf.text('NUMARASI:', margin, infoY + 8);
      
      // Right side  
      pdf.text('SINIFI:', pageWidth - margin - 35, infoY);
      pdf.text('PUANI:', pageWidth - margin - 35, infoY + 8);
      
      // Draw underlines for student info
      pdf.setLineWidth(0.3);
      pdf.line(margin + 30, infoY + 1, pageWidth / 2 - 5, infoY + 1); // Name line
      pdf.line(margin + 30, infoY + 9, pageWidth / 2 - 5, infoY + 9); // Number line
      pdf.line(pageWidth - margin - 25, infoY + 1, pageWidth - margin, infoY + 1); // Class line
      pdf.line(pageWidth - margin - 25, infoY + 9, pageWidth - margin, infoY + 9); // Score line
      
      // Date and duration info - more compact
      pdf.setFontSize(8); // Reduced from 9
      const dateY = 52; // Reduced from 60
      if (template.date) {
        pdf.text(`Tarih: ${new Date(template.date).toLocaleDateString('tr-TR')}`, margin, dateY);
      }
      if (template.duration) {
        pdf.text(`Süre: ${template.duration} dk`, pageWidth - margin, dateY, { align: 'right' }); // Shortened "dakika" to "dk"
      }
      if (template.teacherName) {
        pdf.text(`Ogretmen: ${template.teacherName}`, pageWidth / 2, dateY, { align: 'center' });
      }
      
      // Main separator line - thicker but lower
      const headerBottom = 58; // Reduced from 68 - saves 10mm!
      pdf.setLineWidth(0.8);
      pdf.line(margin, headerBottom, pageWidth - margin, headerBottom);
      
      // Column separator line - lighter
      pdf.setLineWidth(0.3);
      pdf.line(pageWidth / 2, headerBottom, pageWidth / 2, pageHeight - 12); // Reduced bottom margin
      
      return headerBottom + 6; // Reduced from 8
    };
      
      // Initialize first page
      let startY = drawHeader(true); // First page with full header
      let leftColumnY = startY;
      let rightColumnY = startY;
      let currentColumn: 'left' | 'right' = 'left';
      let questionNumber = 1; // Sequential numbering: 1, 2, 3, 4, 5, 6...
      
      // Process questions with sequential numbering
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        const questionNumberText = template.numberingStyle === 'numeric' 
          ? `${questionNumber}.` 
          : `${String.fromCharCode(96 + questionNumber)})`;
        
        try {
          // Calculate optimal image dimensions - BALANCED for more questions per page
          const aspectRatio = question.selection.height / question.selection.width;
          const maxImageWidth = columnWidth - 12; // Optimize space usage
          
          // Balanced size for fitting more questions while keeping readability
          let imgWidth = Math.min(maxImageWidth, 85); // Balanced size - not too big, not too small
          let imgHeight = aspectRatio * imgWidth;
          
          // Smart height limits - allow more questions to fit
          const maxImageHeight = aspectRatio > 2 ? 90 : 70; // Reasonable limits for more questions
          if (imgHeight > maxImageHeight) {
            imgHeight = maxImageHeight;
            imgWidth = imgHeight / aspectRatio;
          }
          
          // Ensure minimum readable size
          const minWidth = 45; // Reasonable minimum
          if (imgWidth < minWidth) {
            imgWidth = minWidth;
            imgHeight = aspectRatio * imgWidth;
          }
          
          const questionSpacing = 12; // Compact spacing for more questions
          const totalQuestionHeight = imgHeight + questionSpacing;
          
          // Determine current position
          const isLeftColumn = currentColumn === 'left';
          const columnX = isLeftColumn ? leftColumnX : rightColumnX;
          let currentY = isLeftColumn ? leftColumnY : rightColumnY;
          
          // Smart column and page management - use more page space
          if (currentY + totalQuestionHeight > pageHeight - 18) { // Reduced from 25 to 18
            if (isLeftColumn && rightColumnY + totalQuestionHeight <= pageHeight - 18) {
              // Try right column first
              currentColumn = 'right';
              currentY = rightColumnY;
            } else {
              // Need new page
              pdf.addPage();
              startY = drawHeader(false); // Subsequent pages with minimal header
              leftColumnY = rightColumnY = startY;
              currentColumn = 'left';
              currentY = startY;
            }
          }
          
          // Draw question number - compact positioning with Turkish support
          pdf.setFontSize(10); // Slightly smaller for more space
          pdf.setFont('helvetica', 'bold');
          pdf.text(questionNumberText, columnX, currentY + 6); // Reduced from 8
          
          // Calculate image position - optimized spacing
          const imageX = columnX + 10; // Reduced from 12
          const imageY = currentY + 1; // Reduced from 2
          
          // Add main image directly - NO BORDERS, NO SHADOWS for clean look
          pdf.addImage(
            question.imageData,
            'PNG',
            imageX,
            imageY,
            imgWidth,
            imgHeight,
            undefined,
            'FAST' // Use FAST for better performance with larger images
          );
          
          // Update column positions and increment question number
          const newY = currentY + totalQuestionHeight;
          
          if (currentColumn === 'left') {
            leftColumnY = newY;
            // Switch to right column for next question
            currentColumn = 'right';
          } else {
            rightColumnY = newY;
            // Switch to left column for next question  
            currentColumn = 'left';
          }
          
          // Increment question number sequentially
          questionNumber++;
          
        } catch (error) {
          console.error('Error adding question to PDF:', error);
          toast.error(`Soru ${i + 1} eklenirken hata oluştu`);
          
          // Skip this question and continue
          const fallbackHeight = 40;
          if (currentColumn === 'left') {
            leftColumnY += fallbackHeight;
            currentColumn = 'right';
          } else {
            rightColumnY += fallbackHeight;
            currentColumn = 'left';
          }
        }
      }
      
      // Add page numbers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `${i}/${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
    return pdf;
  }, []);

  const exportToPDF = useCallback(async (questions: Question[], template: TestTemplate) => {
    try {
      const pdf = await generatePDF(questions, template);
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const cleanTitle = template.title.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s]/g, '').trim();
      const fileName = `${cleanTitle}_${timestamp}.pdf`;
      
      // Save PDF
      pdf.save(fileName);
      
      toast.success(`${questions.length} soruluk sınav kağıdı hazırlandı!`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [generatePDF]);

  const previewPDF = useCallback(async (questions: Question[], template: TestTemplate) => {
    try {
      const pdf = await generatePDF(questions, template);
      
      // Create blob URL for preview
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Open in new window for preview
      const previewWindow = window.open(url, '_blank');
      if (!previewWindow) {
        toast.error('Pop-up engellendi. Lütfen pop-up engelleyiciyi kapatın.');
        return;
      }
      
      // Clean up URL after some time
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
      
      toast.success('PDF önizleme açıldı!');
      
    } catch (error) {
      console.error('PDF preview error:', error);
      toast.error('PDF önizleme oluşturulurken hata oluştu.');
    }
  }, [generatePDF]);

  return { exportToPDF, previewPDF };
};