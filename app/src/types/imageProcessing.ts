export interface ImageTransformation {
  type: 'resize' | 'grayscale' | 'watermark';
  options?: {
    width?: number;
    height?: number;
    text?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
}

export interface Job {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: number;
  resultUrl?: string;
  error?: string;
}

export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
