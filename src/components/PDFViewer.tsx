import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Square, X, Check } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Question } from '@/types/test';
import { toast } from 'sonner';
import '@/styles/react-pdf.css';

// Set worker path for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  file: File;
  onQuestionSelect: (question: Omit<Question, 'id' | 'order'>) => void;
  pdfId?: string;
  pdfName?: string;
}

export const PDFViewer = ({ file, onQuestionSelect, pdfId, pdfName }: PDFViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  
  // Selection state
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingSelections, setPendingSelections] = useState<Array<{
    id: string,
    bounds: {x: number, y: number, width: number, height: number},
    imageData: string
  }>>([]);

  // Create file URL for PDF
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // Redraw canvas when pending selections change
  useEffect(() => {
    if (!isSelecting && pendingSelections.length > 0) {
      redrawCanvas();
    }
  }, [pendingSelections, isSelecting]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (pendingSelections.length === 0) return;
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        confirmAllSelections();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelAllSelections();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [pendingSelections]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    toast.success(`PDF başarıyla yüklendi: ${numPages} sayfa`);
  };

  const onDocumentLoadError = (error: any) => {
    console.error('PDF yükleme hatası:', error);
    toast.error('PDF yüklenirken hata oluştu');
    setIsLoading(false);
  };

  // Setup canvas dimensions after page loads
  const onPageLoadSuccess = useCallback(() => {
    setTimeout(() => {
      if (!containerRef.current) {
        console.log('Container ref not found');
        return;
      }
      
      const pdfCanvas = containerRef.current.querySelector('canvas');
      if (!pdfCanvas) {
        console.log('PDF canvas not found');
        return;
      }

      console.log('PDF canvas found, canvas will be ready for selection');
      setCanvasReady(true);
      
      // Canvas dimensions will be set when selection starts
      console.log('PDF canvas dimensions:', {
        pdfWidth: pdfCanvas.width,
        pdfHeight: pdfCanvas.height,
        offsetWidth: pdfCanvas.offsetWidth,
        offsetHeight: pdfCanvas.offsetHeight
      });
    }, 300);
  }, []);

  // Selection handlers
  const startSelection = () => {
    console.log('Start selection clicked', { canvasReady, canvasRef: !!canvasRef.current });
    
    if (!canvasReady) {
      console.log('Canvas not ready yet');
      toast.error('PDF henüz yükleniyor. Lütfen bekleyin.');
      return;
    }
    
    if (!canvasRef.current) {
      console.log('Canvas ref is null');
      toast.error('Canvas bulunamadı. Sayfayı yenileyin.');
      return;
    }
    
    if (!containerRef.current) {
      console.log('Container ref is null');
      toast.error('PDF container bulunamadı.');
      return;
    }
    
    // Get PDF canvas dimensions and set overlay canvas dimensions
    const pdfCanvas = containerRef.current.querySelector('canvas');
    if (!pdfCanvas) {
      console.log('PDF canvas not found');
      toast.error('PDF canvas bulunamadı.');
      return;
    }
    
    const canvas = canvasRef.current;
    canvas.width = pdfCanvas.width;
    canvas.height = pdfCanvas.height;
    
    console.log('Canvas dimensions set:', {
      pdfWidth: pdfCanvas.width,
      pdfHeight: pdfCanvas.height,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
    
    console.log('Starting selection mode');
    
    setIsSelecting(true);
    setSelectionStart(null);
    setSelectionEnd(null);
    // Don't clear pending selections - allow multiple
    
    // Clear previous selection
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    toast.success('Seçim modu aktif. PDF üzerinde kare çizin.');
  };

  const stopSelection = () => {
    if (!canvasRef.current) return;
    
    setIsSelecting(false);
    setIsDrawing(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    // Keep pending selections
    
    const canvas = canvasRef.current;
    canvas.style.pointerEvents = 'none';
    canvas.style.cursor = 'default';
    
    // Clear selection
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse down event', { isSelecting, canvas: !!canvasRef.current });
    
    if (!isSelecting || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Simple coordinate calculation
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale to canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    console.log('Mouse down coordinates:', { 
      clientX: e.clientX, 
      clientY: e.clientY,
      rectLeft: rect.left,
      rectTop: rect.top,
      x, y, 
      canvasX, 
      canvasY,
      scaleX,
      scaleY
    });
    
    setSelectionStart({ x: canvasX, y: canvasY });
    setSelectionEnd({ x: canvasX, y: canvasY });
    setIsDrawing(true);
    
    // Clear canvas and draw starting point
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'red';
      ctx.fillRect(canvasX - 2, canvasY - 2, 4, 4);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isSelecting || !canvasRef.current || !selectionStart) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate current mouse position
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    setSelectionEnd({ x: canvasX, y: canvasY });
    
    // Draw selection rectangle
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw current selection rectangle
      const width = canvasX - selectionStart.x;
      const height = canvasY - selectionStart.y;
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      
      ctx.fillRect(selectionStart.x, selectionStart.y, width, height);
      ctx.strokeRect(selectionStart.x, selectionStart.y, width, height);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !selectionStart || !selectionEnd || !containerRef.current) return;
    
    setIsDrawing(false);
    
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    if (width < 10 || height < 10) {
      toast.error('Lütfen daha büyük bir alan seçin');
      stopSelection();
      return;
    }
    
    // Get PDF canvas for image capture
    const pdfCanvas = containerRef.current.querySelector('canvas');
    if (!pdfCanvas) return;
    
    // Calculate selection bounds
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    
    // Create temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCanvas.width = width;
      tempCanvas.height = height;
      
      // Draw the selected area from PDF canvas
      tempCtx.drawImage(
        pdfCanvas,
        left, top, width, height,
        0, 0, width, height
      );
      
      const imageData = tempCanvas.toDataURL('image/png', 0.9);
      
      // Add to pending selections
      const newSelection = {
        id: `selection_${Date.now()}_${Math.random()}`,
        bounds: { x: left, y: top, width, height },
        imageData
      };
      
      setPendingSelections(prev => [...prev, newSelection]);
      
      toast.success(`Soru seçildi! Toplam ${pendingSelections.length + 1} soru bekliyor.`);
    }
  };

  // Confirm/Cancel selections
  const confirmAllSelections = () => {
    if (pendingSelections.length === 0) return;
    
    pendingSelections.forEach(selection => {
      onQuestionSelect({
        imageData: selection.imageData,
        pageNumber: currentPage,
        selection: selection.bounds,
        pdfId: pdfId || 'unknown',
        pdfName: pdfName || 'Unknown PDF'
      });
    });
    
    toast.success(`${pendingSelections.length} soru başarıyla eklendi!`);
    setPendingSelections([]);
    redrawCanvas();
  };

  const confirmSingleSelection = (selectionId: string) => {
    const selection = pendingSelections.find(s => s.id === selectionId);
    if (!selection) return;
    
    onQuestionSelect({
      imageData: selection.imageData,
      pageNumber: currentPage,
      selection: selection.bounds,
      pdfId: pdfId || 'unknown',
      pdfName: pdfName || 'Unknown PDF'
    });
    
    setPendingSelections(prev => prev.filter(s => s.id !== selectionId));
    toast.success('Soru eklendi!');
    redrawCanvas();
  };

  const cancelSingleSelection = (selectionId: string) => {
    setPendingSelections(prev => prev.filter(s => s.id !== selectionId));
    toast.info('Seçim iptal edildi');
    redrawCanvas();
  };

  const cancelAllSelections = () => {
    setPendingSelections([]);
    toast.info('Tüm seçimler iptal edildi');
    redrawCanvas();
  };

  // Redraw canvas with all pending selections
  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all pending selections
    pendingSelections.forEach((selection, index) => {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      
      ctx.fillRect(selection.bounds.x, selection.bounds.y, selection.bounds.width, selection.bounds.height);
      ctx.strokeRect(selection.bounds.x, selection.bounds.y, selection.bounds.width, selection.bounds.height);
      
      // Draw selection number
      ctx.fillStyle = '#22c55e';
      ctx.font = '16px Arial';
      ctx.fillText(`${index + 1}`, selection.bounds.x + 5, selection.bounds.y + 20);
    });
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));

  if (!fileUrl) {
    return (
      <Card className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">PDF hazırlanıyor...</p>
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
              {currentPage} / {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
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
            variant={isSelecting ? "destructive" : "default"}
            size="sm"
            onClick={isSelecting ? stopSelection : startSelection}
            disabled={!canvasReady && !isSelecting}
            className={isSelecting ? "animate-pulse" : ""}
          >
            {isSelecting ? (
              <>
                <X className="w-4 h-4 mr-2" />
                İptal Et
              </>
            ) : (
              <>
                <Square className="w-4 h-4 mr-2" />
                {canvasReady ? 'Soru Seç' : 'PDF Yükleniyor...'}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* PDF Display */}
      <Card className="p-4 bg-muted/30">
        <div className="w-full overflow-auto max-h-[70vh]">
          <div className="flex justify-center">
            <div ref={containerRef} className="relative inline-block">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-muted-foreground">PDF yükleniyor...</p>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  onLoadSuccess={onPageLoadSuccess}
                  className="border border-border shadow-soft rounded"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              
              {/* Selection Canvas Overlay - Always present but only interactive when selecting */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  cursor: isSelecting ? 'crosshair' : 'default',
                  pointerEvents: isSelecting ? 'auto' : 'none',
                  zIndex: 10,
                  border: isSelecting ? '2px solid red' : 'none', // Debug border only when selecting
                  backgroundColor: isSelecting ? 'rgba(255, 0, 0, 0.05)' : 'transparent'
                }}
              />
              
              {/* Pending Selections Panel - Fixed position at bottom right */}
              {pendingSelections.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-purple-200/50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-purple-800">
                          {pendingSelections.length} soru seçildi
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelAllSelections}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        onClick={confirmAllSelections}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Tümünü Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelAllSelections}
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Tümünü İptal
                      </Button>
                    </div>
                    
                    {/* Individual Selections */}
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      <div className="text-xs font-medium text-purple-700 mb-2">Seçilen Sorular:</div>
                      {pendingSelections.map((selection, index) => (
                        <div key={selection.id} className="flex items-center gap-3 p-2 bg-white/70 rounded-xl border border-purple-100/50 hover:bg-white/90 transition-all duration-200">
                          <img 
                            src={selection.imageData} 
                            alt={`Soru ${index + 1}`}
                            className="w-10 h-10 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                          />
                          <span className="text-sm font-medium text-purple-800 flex-1">
                            Soru {index + 1}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => confirmSingleSelection(selection.id)}
                              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all duration-200"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelSingleSelection(selection.id)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};