import { useState } from 'react';
import { PDFUploader } from '@/components/PDFUploader';
import { PDFViewer } from '@/components/PDFViewer';
import { QuestionPanel } from '@/components/QuestionPanel';
import { PDFSelector } from '@/components/PDFSelector';
import { Question, TestTemplate, PDFFile } from '@/types/test';
import { usePDFExport } from '@/hooks/usePDFExport';
import { Card } from '@/components/ui/card';
import { BookOpen, Target, FileText } from 'lucide-react';

const TestMaker = () => {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState<string | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { exportToPDF, previewPDF } = usePDFExport();

  const selectedPdf = pdfFiles.find(pdf => pdf.id === selectedPdfId);

  const handleAddPdf = (file: File) => {
    const newPdf: PDFFile = {
      id: Date.now().toString(),
      file,
      name: file.name,
      totalPages: 0, // Will be updated when PDF is loaded
      url: URL.createObjectURL(file),
      uploadDate: new Date(),
    };
    
    setPdfFiles(prev => [...prev, newPdf]);
    
    // Auto-select the first PDF if none selected
    if (!selectedPdfId) {
      setSelectedPdfId(newPdf.id);
    }
  };

  const handleSelectPdf = (pdf: PDFFile) => {
    setSelectedPdfId(pdf.id);
    // Don't reset questions - allow accumulation from multiple PDFs
  };

  const handleRemovePdf = (pdfId: string) => {
    setPdfFiles(prev => prev.filter(pdf => pdf.id !== pdfId));
    
    // Remove questions from this PDF
    setQuestions(prev => prev.filter(q => q.pdfId !== pdfId));
    
    // If removed PDF was selected, select another one
    if (selectedPdfId === pdfId) {
      const remainingPdfs = pdfFiles.filter(pdf => pdf.id !== pdfId);
      setSelectedPdfId(remainingPdfs[0]?.id);
    }
  };

  const handleQuestionSelect = (questionData: Omit<Question, 'id' | 'order' | 'pdfId' | 'pdfName'>) => {
    if (!selectedPdf) return;
    
    const newQuestion: Question = {
      ...questionData,
      id: `question_${Date.now()}_${Math.random()}`,
      pdfId: selectedPdf.id,
      pdfName: selectedPdf.name,
      order: questions.length + 1,
    };
    
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleExportPDF = async (template: TestTemplate) => {
    setIsLoading(true);
    await exportToPDF(questions, template);
    setIsLoading(false);
  };

  const handlePreviewPDF = async (template: TestTemplate) => {
    setIsLoading(true);
    await previewPDF(questions, template);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground shadow-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Test Maker</h1>
              <p className="text-sm opacity-90">Birden fazla PDF'den profesyonel test kitapçıkları oluşturun</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* PDF Selector - Left Sidebar */}
          <div className="col-span-3 overflow-hidden">
            <PDFSelector
              pdfFiles={pdfFiles}
              selectedPdfId={selectedPdfId}
              onSelectPdf={handleSelectPdf}
              onAddPdf={handleAddPdf}
              onRemovePdf={handleRemovePdf}
            />
          </div>

          {/* PDF Viewer - Center */}
          <div className="col-span-6 overflow-hidden">
            {selectedPdf ? (
              <PDFViewer
                file={selectedPdf.file}
                onQuestionSelect={handleQuestionSelect}
                pdfId={selectedPdf.id}
                pdfName={selectedPdf.name}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    PDF Seçin
                  </h3>
                  <p className="text-sm text-gray-500">
                    Sol panelden bir PDF dosyası seçin veya yeni bir PDF yükleyin
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Question Panel - Right Side */}
          <div className="col-span-3 overflow-hidden">
            <QuestionPanel
              questions={questions}
              onQuestionsChange={setQuestions}
              onExportPDF={handleExportPDF}
              onPreviewPDF={handlePreviewPDF}
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200/50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs text-purple-600 font-medium">
              Built with ❤️ by <span className="text-purple-700 font-semibold">Gökmen</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TestMaker;