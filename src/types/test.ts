export interface Question {
  id: string;
  imageData: string; // base64 encoded image
  pageNumber: number;
  pdfId: string; // Which PDF this question comes from
  pdfName: string; // PDF name for display
  selection: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  order: number;
}

export interface TestTemplate {
  title: string;
  schoolName: string;
  className: string;
  date: string;
  duration: string;
  teacherName: string;
  type: 'written' | 'practice' | 'screening';
  numberingStyle: 'numeric' | 'alphabetic';
}

export interface PDFFile {
  id: string;
  file: File;
  name: string;
  totalPages: number;
  url: string;
  uploadDate: Date;
}