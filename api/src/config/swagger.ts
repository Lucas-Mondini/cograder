import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processing API',
      version: '1.0.0',
      description: 'API for image processing with queue',
    },
    servers: [
      {
        url: `http://${process.env.API_URL || "localhost"}:${process.env.PORT || 8000}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        JobResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            url: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed']
            },
            progress: { type: 'number' },
            createdAt: { type: 'number' },
            resultUrl: { type: 'string' },
            error: { type: 'string' },
          },
        },
        CreateJobRequest: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { 
              type: 'string',
              description: 'Image URL to process'
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);