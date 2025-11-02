import axios from 'axios';
import sharp from 'sharp';
import {
  downloadImage,
  processImage,
  uploadToStorage,
  validateImageUrl,
} from './image-processor';
import { ImageTransformation } from '@core/types';

jest.mock('axios');
jest.mock('sharp');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('downloadImage', () => {
  const mockImageBuffer = Buffer.from('mock-image-data');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should download image successfully', async () => {
    mockedAxios.head.mockResolvedValue({
      headers: { 'content-type': 'image/jpeg' },
    } as any);

    mockedAxios.get.mockResolvedValue({
      data: mockImageBuffer,
    } as any);

    const result = await downloadImage('https://example.com/image.jpg');

    expect(result).toEqual(mockImageBuffer);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://example.com/image.jpg',
      {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: 10485760,
      }
    );
  });

  it('should throw error on download timeout', async () => {
    mockedAxios.head.mockResolvedValue({
      headers: { 'content-type': 'image/jpeg' },
    } as any);

    mockedAxios.get.mockRejectedValue({ code: 'ECONNABORTED' });

    await expect(
      downloadImage('https://example.com/image.jpg')
    ).rejects.toThrow('Download timeout - image too large');
  });

  it('should throw error on download failure', async () => {
    mockedAxios.head.mockResolvedValue({
      headers: { 'content-type': 'image/jpeg' },
    } as any);

    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    await expect(
      downloadImage('https://example.com/image.jpg')
    ).rejects.toThrow('Failed to download image: Network error');
  });
});

describe('validateImageUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate image URL successfully', async () => {
    mockedAxios.head.mockResolvedValue({
      headers: { 'content-type': 'image/jpeg' },
    } as any);

    await expect(
      validateImageUrl('https://example.com/image.jpg')
    ).resolves.toBeUndefined();
  });

  it('should throw error for non-image content type', async () => {
    mockedAxios.head.mockResolvedValue({
      headers: { 'content-type': 'text/html' },
    } as any);

    await expect(
      validateImageUrl('https://example.com/page.html')
    ).rejects.toThrow('URL does not point to an image');
  });

  it('should throw error for 404 response', async () => {
    mockedAxios.head.mockRejectedValue({
      response: { status: 404 },
    });

    await expect(
      validateImageUrl('https://example.com/missing.jpg')
    ).rejects.toThrow('Image not found (404)');
  });

  it('should throw generic error for other failures', async () => {
    mockedAxios.head.mockRejectedValue(new Error('Connection failed'));

    await expect(
      validateImageUrl('https://example.com/image.jpg')
    ).rejects.toThrow('Failed to validate image URL');
  });
});

describe('processImage', () => {
  let mockPipeline: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPipeline = {
      resize: jest.fn().mockReturnThis(),
      grayscale: jest.fn().mockReturnThis(),
      composite: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed')),
    };
    (sharp as any).mockReturnValue(mockPipeline);
  });

  it('should process image with resize transformation', async () => {
    const transformations: ImageTransformation[] = [
      {
        type: 'resize',
        options: { width: 800, height: 600 },
      },
    ];

    const result = await processImage(Buffer.from('test'), transformations);

    expect(mockPipeline.resize).toHaveBeenCalledWith(800, 600, { fit: 'fill' });
    expect(mockPipeline.jpeg).toHaveBeenCalledWith({ quality: 90 });
    expect(result).toEqual(Buffer.from('processed'));
  });

  it('should process image with grayscale transformation', async () => {
    const transformations: ImageTransformation[] = [
      { type: 'grayscale' },
    ];

    await processImage(Buffer.from('test'), transformations);

    expect(mockPipeline.grayscale).toHaveBeenCalled();
  });

  it('should process image with watermark transformation', async () => {
    const transformations: ImageTransformation[] = [
      {
        type: 'watermark',
        options: { text: 'Copyright', position: 'bottom-right' },
      },
    ];

    await processImage(Buffer.from('test'), transformations);

    expect(mockPipeline.composite).toHaveBeenCalledWith([
      {
        input: expect.any(Buffer),
        gravity: 'southeast',
      },
    ]);
  });

  it('should apply multiple transformations in order', async () => {
    const transformations: ImageTransformation[] = [
      { type: 'resize', options: { width: 500, height: 500 } },
      { type: 'grayscale' },
      { type: 'watermark', options: { text: 'Test', position: 'center' } },
    ];

    await processImage(Buffer.from('test'), transformations);

    expect(mockPipeline.resize).toHaveBeenCalled();
    expect(mockPipeline.grayscale).toHaveBeenCalled();
    expect(mockPipeline.composite).toHaveBeenCalled();
  });

  it('should handle empty transformations', async () => {
    await processImage(Buffer.from('test'), []);

    expect(mockPipeline.jpeg).toHaveBeenCalledWith({ quality: 90 });
    expect(mockPipeline.resize).not.toHaveBeenCalled();
  });
});

describe('uploadToStorage', () => {
  let mockStorage: any;
  let mockFile: any;

  beforeEach(() => {
    mockFile = {
      save: jest.fn().mockResolvedValue(undefined),
      makePublic: jest.fn().mockResolvedValue(undefined),
    };
    mockStorage = {
      name: 'test-bucket',
      file: jest.fn().mockReturnValue(mockFile),
    };
  });

  it('should upload image to storage successfully', async () => {
    const imageBuffer = Buffer.from('processed-image');
    const jobId = 'job-123';

    const result = await uploadToStorage(imageBuffer, jobId, mockStorage);

    expect(mockStorage.file).toHaveBeenCalledWith('processed/job-123.jpg');
    expect(mockFile.save).toHaveBeenCalledWith(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          processedAt: expect.any(String),
        },
      },
    });
    expect(mockFile.makePublic).toHaveBeenCalled();
    expect(result).toBe(
      'https://storage.googleapis.com/test-bucket/processed/job-123.jpg'
    );
  });

  it('should throw error if save fails', async () => {
    mockFile.save.mockRejectedValue(new Error('Storage error'));

    await expect(
      uploadToStorage(Buffer.from('test'), 'job-123', mockStorage)
    ).rejects.toThrow('Storage error');
  });
});