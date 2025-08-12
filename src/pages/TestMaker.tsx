import { useState } from 'react';
import { PDFUploader } from '@/components/PDFUploader';
import { PDFViewer } from '@/components/PDFViewer';
import { QuestionPanel } from '@/components/QuestionPanel';
import { Question, TestTemplate } from '@/types/test';
import { usePDFExport } from '@/hooks/usePDFExport';
import { Card } from '@/components/ui/card';
import { BookOpen, Target, FileText } from 'lucide-react';

const TestMaker = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { exportToPDF } = usePDFExport();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setQuestions([]); // Reset questions when new file is selected
  };

  const handleQuestionSelect = (questionData: Omit<Question, 'id' | 'order'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: `question_${Date.now()}_${Math.random()}`,
      order: questions.length + 1,
    };
    
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleExportPDF = async (template: TestTemplate) => {
    setIsLoading(true);
    await exportToPDF(questions, template);
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
              <p className="text-sm opacity-90">PDF'den profesyonel test kitapçıkları oluşturun</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedFile ? (
          /* Upload Screen */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 space-y-4">
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">PDF Yükle</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-sm font-medium">Soru Seç</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  <span className="text-sm font-medium">Test Oluştur</span>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-foreground">
                Başlamak için PDF dosyanızı yükleyin
              </h2>
              <p className="text-muted-foreground">
                PDF üzerinden soruları seçip profesyonel test kitapçıkları oluşturabilirsiniz
              </p>
            </div>
            
            <PDFUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        ) : (
          /* Main Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* PDF Viewer - Left Side */}
            <div className="lg:col-span-2 overflow-hidden">
              <PDFViewer
                file={selectedFile}
                onQuestionSelect={handleQuestionSelect}
              />
            </div>

            {/* Question Panel - Right Side */}
            <div className="overflow-hidden">
              <QuestionPanel
                questions={questions}
                onQuestionsChange={setQuestions}
                onExportPDF={handleExportPDF}
              />
            </div>
          </div>
        )}

        {/* Feature Cards */}
        {!selectedFile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 text-center hover:shadow-medium transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Kolay Soru Seçimi</h3>
              <p className="text-sm text-muted-foreground">
                PDF üzerinde fare ile kare çizerek soruları kolayca seçin
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-medium transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Profesyonel Şablonlar</h3>
              <p className="text-sm text-muted-foreground">
                Hazır şablonlarla profesyonel görünümlü test kitapçıkları oluşturun
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-medium transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">PDF Export</h3>
              <p className="text-sm text-muted-foreground">
                Hazır testlerinizi PDF formatında indirin ve yazdırın
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default TestMaker;