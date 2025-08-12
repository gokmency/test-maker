import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FileText, Calendar, Trash2 } from 'lucide-react';
import { PDFFile } from '@/types/test';

interface PDFSelectorProps {
  pdfFiles: PDFFile[];
  selectedPdfId?: string;
  onSelectPdf: (pdf: PDFFile) => void;
  onAddPdf: (file: File) => void;
  onRemovePdf: (pdfId: string) => void;
}

export const PDFSelector = ({ 
  pdfFiles, 
  selectedPdfId, 
  onSelectPdf, 
  onAddPdf, 
  onRemovePdf 
}: PDFSelectorProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onAddPdf(file);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onAddPdf(file);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-primary text-primary-foreground">
        <h3 className="font-semibold text-lg">PDF Dosyaları</h3>
        <p className="text-sm opacity-90">Soru seçmek için PDF dosyalarınızı yükleyin</p>
      </div>

      {/* Add PDF Section */}
      <div className="p-4 border-b">
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            PDF dosyasını buraya sürükleyin veya seçin
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <Button 
            asChild
            variant="outline" 
            size="sm"
            className="cursor-pointer"
          >
            <label htmlFor="pdf-upload">
              Dosya Seç
            </label>
          </Button>
        </div>
      </div>

      {/* PDF List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {pdfFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Henüz PDF dosyası yüklenmemiş</p>
            </div>
          ) : (
            pdfFiles.map((pdf) => (
              <Card
                key={pdf.id}
                className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedPdfId === pdf.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectPdf(pdf)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="font-medium text-sm truncate" title={pdf.name}>
                        {pdf.name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(pdf.uploadDate)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {pdf.totalPages} sayfa
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePdf(pdf.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                {selectedPdfId === pdf.id && (
                  <div className="mt-2 pt-2 border-t">
                    <Badge variant="default" className="text-xs">
                      Aktif PDF
                    </Badge>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
