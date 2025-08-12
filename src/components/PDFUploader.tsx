import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const PDFUploader = ({ onFileSelect, isLoading }: PDFUploaderProps) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileSelect(pdfFile);
      toast.success('PDF dosyası başarıyla yüklendi!');
    } else {
      toast.error('Lütfen geçerli bir PDF dosyası seçin.');
    }
  }, [onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
      toast.success('PDF dosyası başarıyla yüklendi!');
    } else {
      toast.error('Lütfen geçerli bir PDF dosyası seçin.');
    }
  }, [onFileSelect]);

  return (
    <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
      <div
        className="text-center space-y-4"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">PDF Dosyası Yükle</h3>
          <p className="text-muted-foreground">
            Soru çıkarmak istediğiniz PDF dosyasını sürükleyip bırakın veya seçin
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="pdf-upload">
            <Button 
              className="bg-gradient-primary hover:opacity-90 shadow-medium"
              disabled={isLoading}
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Yükleniyor...' : 'Dosya Seç'}
              </span>
            </Button>
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Desteklenen format: PDF (Maksimum 50MB)
        </p>
      </div>
    </Card>
  );
};