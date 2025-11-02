export interface ImageJobPayload {
  url: string;
  createdAt: string;
  transformations: ImageTransformation[];
}

export interface ImageTransformation {
  type: 'resize' | 'grayscale' | 'watermark';
  options?: ResizeOptions | WatermarkOptions;
}

export interface ResizeOptions {
  width: number;
  height: number;
}

export interface WatermarkOptions {
  text: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}


export interface JobDocument {
  id: string;
  url: string;
  status: JobStatus;
  progress: number;
  createdAt: number;
  resultUrl?: string;
  error?: string;
  processedAt?: string;
}

export type JobResponse = JobDocument;

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImageJobResult {
  status: 'completed';
  resultUrl: string;
  processedAt: string;
}