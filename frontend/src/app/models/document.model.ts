export interface Document {
    id: string;
    publishedDate: string;
    fileName: string;
    summary: string;
    relevance: string;
    selected?: boolean;
  }