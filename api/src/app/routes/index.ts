import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { healthCheck } from "@app/controllers/healthController";
import { createJobController } from "@app/controllers/jobController";
import { swaggerSpec } from "@config/swagger";

export const createRoutes = (): Router => {
  const router = Router();
  const jobController = createJobController();

  // Swagger
  router.use("/api-docs", swaggerUi.serve);
  router.get("/api-docs", swaggerUi.setup(swaggerSpec));

  /**
   * @openapi
   * /health:
   *   get:
   *     summary: Health check
   *     description: Check if the server is running
   *     responses:
   *       200:
   *         description: Server is running
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
  router.get("/health", healthCheck);

  /**
   * @openapi
   * /jobs:
   *   post:
   *     summary: Create new job
   *     description: Add an image to the processing queue with transformations
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - url
   *               - transformations
   *             properties:
   *               url:
   *                 type: string
   *                 format: uri
   *                 example: https://example.com/image.jpg
   *               transformations:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   oneOf:
   *                     - type: object
   *                       required:
   *                         - type
   *                         - options
   *                       properties:
   *                         type:
   *                           type: string
   *                           enum: [resize]
   *                         options:
   *                           type: object
   *                           required:
   *                             - width
   *                             - height
   *                           properties:
   *                             width:
   *                               type: number
   *                               minimum: 1
   *                             height:
   *                               type: number
   *                               minimum: 1
   *                     - type: object
   *                       required:
   *                         - type
   *                       properties:
   *                         type:
   *                           type: string
   *                           enum: [grayscale]
   *                     - type: object
   *                       required:
   *                         - type
   *                         - options
   *                       properties:
   *                         type:
   *                           type: string
   *                           enum: [watermark]
   *                         options:
   *                           type: object
   *                           required:
   *                             - text
   *                           properties:
   *                             text:
   *                               type: string
   *                               minLength: 1
   *                             position:
   *                               type: string
   *                               enum: [top-left, top-right, bottom-left, bottom-right, center]
   *           examples:
   *             resize:
   *               summary: Resize transformation
   *               value:
   *                 url: https://example.com/image.jpg
   *                 transformations:
   *                   - type: resize
   *                     options:
   *                       width: 800
   *                       height: 600
   *             multiple:
   *               summary: Multiple transformations
   *               value:
   *                 url: https://example.com/image.jpg
   *                 transformations:
   *                   - type: resize
   *                     options:
   *                       width: 800
   *                       height: 600
   *                   - type: grayscale
   *                   - type: watermark
   *                     options:
   *                       text: Copyright 2024
   *                       position: bottom-right
   *     responses:
   *       200:
   *         description: Job created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 url:
   *                   type: string
   *                 status:
   *                   type: string
   *                   enum: [pending, processing, completed, failed]
   *                 progress:
   *                   type: number
   *                 createdAt:
   *                   type: number
   *       400:
   *         description: Validation failed or invalid image URL
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                 errors:
   *                   type: object
   *       500:
   *         description: Error creating job
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   */
  router.post("/jobs", jobController.createJob);

  /**
   * @openapi
   * /jobs/{id}:
   *   get:
   *     summary: Get job by ID
   *     description: Returns details of a specific job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       200:
   *         description: Job found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 url:
   *                   type: string
   *                 status:
   *                   type: string
   *                   enum: [pending, processing, completed, failed]
   *                 progress:
   *                   type: number
   *                 createdAt:
   *                   type: number
   *                 resultUrl:
   *                   type: string
   *                 error:
   *                   type: string
   *                 processedAt:
   *                   type: string
   *       404:
   *         description: Job not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *       500:
   *         description: Error fetching job
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   */
  router.get("/jobs/:id", jobController.getJob);

  /**
   * @openapi
   * /jobs:
   *   get:
   *     summary: List all jobs
   *     description: Returns list of jobs (pending, processing, completed, failed) ordered by creation date
   *     responses:
   *       200:
   *         description: List of jobs
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 jobs:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       url:
   *                         type: string
   *                       status:
   *                         type: string
   *                         enum: [pending, processing, completed, failed]
   *                       progress:
   *                         type: number
   *                       createdAt:
   *                         type: number
   *                       resultUrl:
   *                         type: string
   *                       error:
   *                         type: string
   *                       processedAt:
   *                         type: string
   *       500:
   *         description: Error listing jobs
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   */
  router.get("/jobs", jobController.listJobs);

  return router;
};
