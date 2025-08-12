import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Square } from 'lucide-react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { Question } from '@/types/test';
import { toast } from 'sonner';

// PDF.js worker setup - use local worker to avoid CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  file: File;
  onQuestionSelect: (question: Omit<Question, 'id' | 'order'>) => void;
}

export const PDFViewer = ({ file, onQuestionSelect }: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        toast.success(`PDF yüklendi: ${pdf.numPages} sayfa`);
      } catch (error) {
        console.error('PDF yükleme hatası:', error);
        toast.error('PDF yüklenirken hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [file]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    setIsLoading(true);
    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Setup Fabric.js canvas for selection
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }

      const fabricCanvas = new FabricCanvas(canvas, {
        selection: false,
        preserveObjectStacking: true,
      });

      fabricCanvas.setDimensions({
        width: viewport.width,
        height: viewport.height
      });

      fabricCanvasRef.current = fabricCanvas;

    } catch (error) {
      console.error('Sayfa render hatası:', error);
      toast.error('Sayfa yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Selection logic
  const startSelection = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    setIsSelecting(true);
    const canvas = fabricCanvasRef.current;
    
    let isDown = false;
    let origX = 0;
    let origY = 0;
    let rect: Rect | null = null;

    const handleMouseDown = (options: any) => {
      if (!isSelecting) return;
      
      isDown = true;
      const pointer = canvas.getPointer(options.e);
      origX = pointer.x;
      origY = pointer.y;
      
      rect = new Rect({
        left: origX,
        top: origY,
        width: 0,
        height: 0,
        fill: 'rgba(66, 120, 255, 0.2)',
        stroke: '#4278ff',
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });
      
      canvas.add(rect);
    };

    const handleMouseMove = (options: any) => {
      if (!isDown || !rect) return;
      
      const pointer = canvas.getPointer(options.e);
      const width = Math.abs(pointer.x - origX);
      const height = Math.abs(pointer.y - origY);
      const left = Math.min(pointer.x, origX);
      const top = Math.min(pointer.y, origY);
      
      rect.set({ left, top, width, height });
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDown || !rect) return;
      
      isDown = false;
      
      const selection = {
        x: rect.left || 0,
        y: rect.top || 0,
        width: rect.width || 0,
        height: rect.height || 0,
      };

      if (selection.width > 20 && selection.height > 20) {
        // Capture the selected area as image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const sourceCanvas = canvasRef.current;
        
        if (tempCtx && sourceCanvas) {
          tempCanvas.width = selection.width;
          tempCanvas.height = selection.height;
          
          tempCtx.drawImage(
            sourceCanvas,
            selection.x, selection.y, selection.width, selection.height,
            0, 0, selection.width, selection.height
          );
          
          const imageData = tempCanvas.toDataURL('image/png');
          
          onQuestionSelect({
            imageData,
            pageNumber: currentPage,
            selection,
          });
          
          toast.success('Soru başarıyla seçildi!');
        }
      }

      canvas.remove(rect);
      canvas.renderAll();
      setIsSelecting(false);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [isSelecting, currentPage, onQuestionSelect]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  if (isLoading && !pdfDoc) {
    return (
      <Card className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">PDF yükleniyor...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-20 text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant={isSelecting ? "accent" : "success"}
            size="sm"
            onClick={startSelection}
            disabled={isSelecting}
          >
            <Square className="w-4 h-4 mr-2" />
            {isSelecting ? 'Soru Seçiliyor...' : 'Soru Seç'}
          </Button>
        </div>
      </Card>

      {/* PDF Canvas */}
      <Card className="p-4 overflow-auto max-h-[600px] bg-muted/30">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-border shadow-soft rounded cursor-crosshair"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </Card>
    </div>
  );
};