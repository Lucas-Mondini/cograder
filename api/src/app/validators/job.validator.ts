import { z } from 'zod';

const ResizeOptionsSchema = z.object({
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
});

const WatermarkOptionsSchema = z.object({
  text: z.string().min(1, 'Watermark text cannot be empty'),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).optional(),
});

const ImageTransformationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('resize'),
    options: ResizeOptionsSchema,
  }),
  z.object({
    type: z.literal('grayscale'),
    options: z.undefined().optional(),
  }),
  z.object({
    type: z.literal('watermark'),
    options: WatermarkOptionsSchema,
  }),
]);

export const CreateJobSchema = z.object({
  url: z.string().url('Invalid URL format'),
  transformations: z.array(ImageTransformationSchema).min(1, 'At least one transformation is required'),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;