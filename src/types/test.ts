export interface Question {
  id: string;
  imageData: string; // base64 encoded image
  pageNumber: number;
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
  file: File;
  totalPages: number;
  url: string;
}