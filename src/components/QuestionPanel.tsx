import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, GripVertical, FileDown } from 'lucide-react';
import { Question, TestTemplate } from '@/types/test';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

interface QuestionPanelProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onExportPDF: (template: TestTemplate) => void;
}

interface SortableQuestionProps {
  question: Question;
  onDelete: (id: string) => void;
}

const SortableQuestion = ({ question, onDelete }: SortableQuestionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-3 bg-card border border-border shadow-soft hover:shadow-medium transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Soru {question.order} - Sayfa {question.pageNumber}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
              className="text-destructive hover:text-destructive/80 h-auto p-1"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-2">
            <img
              src={question.imageData}
              alt={`Soru ${question.order}`}
              className="max-w-full h-auto rounded border"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export const QuestionPanel = ({ questions, onQuestionsChange, onExportPDF }: QuestionPanelProps) => {
  const [template, setTemplate] = useState<TestTemplate>({
    title: 'Matematik Yazılı Sınavı',
    schoolName: '',
    className: '',
    date: new Date().toISOString().split('T')[0],
    duration: '60',
    teacherName: '',
    type: 'written',
    numberingStyle: 'numeric',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      
      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex).map(
        (q, index) => ({ ...q, order: index + 1 })
      );
      
      onQuestionsChange(reorderedQuestions);
      toast.success('Soru sırası güncellendi');
    }
  };

  const handleDeleteQuestion = (id: string) => {
    const updatedQuestions = questions
      .filter((q) => q.id !== id)
      .map((q, index) => ({ ...q, order: index + 1 }));
    
    onQuestionsChange(updatedQuestions);
    toast.success('Soru silindi');
  };

  const handleTemplateChange = (field: keyof TestTemplate, value: string) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = () => {
    if (questions.length === 0) {
      toast.error('PDF oluşturmak için en az bir soru seçmelisiniz');
      return;
    }
    
    if (!template.title || !template.teacherName) {
      toast.error('Lütfen test başlığı ve öğretmen adı alanlarını doldurun');
      return;
    }

    onExportPDF(template);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <Card className="p-4 bg-gradient-primary text-primary-foreground shadow-medium">
        <h2 className="text-lg font-semibold">Seçilen Sorular</h2>
        <p className="text-sm opacity-90">
          {questions.length} soru seçildi
        </p>
      </Card>

      {/* Questions List */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-96">
        {questions.length === 0 ? (
          <Card className="p-6 text-center border-dashed border-2">
            <p className="text-muted-foreground">
              Henüz soru seçilmedi. PDF'den soru seçmek için "Soru Seç" butonunu kullanın.
            </p>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questions} strategy={verticalListSortingStrategy}>
              {questions.map((question) => (
                <SortableQuestion
                  key={question.id}
                  question={question}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Template Settings */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Test Ayarları</h3>
        
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">Test Başlığı</Label>
            <Input
              id="title"
              value={template.title}
              onChange={(e) => handleTemplateChange('title', e.target.value)}
              placeholder="örn: 9. Sınıf Matematik Yazılı Sınavı"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="schoolName" className="text-sm font-medium">Okul/Kurum</Label>
              <Input
                id="schoolName"
                value={template.schoolName}
                onChange={(e) => handleTemplateChange('schoolName', e.target.value)}
                placeholder="Okul adı"
              />
            </div>
            <div>
              <Label htmlFor="className" className="text-sm font-medium">Sınıf/Şube</Label>
              <Input
                id="className"
                value={template.className}
                onChange={(e) => handleTemplateChange('className', e.target.value)}
                placeholder="örn: 9-A"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="teacherName" className="text-sm font-medium">Öğretmen Adı</Label>
              <Input
                id="teacherName"
                value={template.teacherName}
                onChange={(e) => handleTemplateChange('teacherName', e.target.value)}
                placeholder="Öğretmen adı"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm font-medium">Süre (dakika)</Label>
              <Input
                id="duration"
                type="number"
                value={template.duration}
                onChange={(e) => handleTemplateChange('duration', e.target.value)}
                placeholder="60"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleExport}
          className="w-full bg-gradient-secondary"
          size="lg"
          disabled={questions.length === 0}
        >
          <FileDown className="w-4 h-4 mr-2" />
          PDF Test Kitapçığı Oluştur
        </Button>
      </Card>
    </div>
  );
};