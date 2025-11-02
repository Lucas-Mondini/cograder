import { Request, Response } from "express";
import { imageQueue } from "@infrastructure/queues/imageQueue";
import { JobResponse, JobStatus } from "@core/types";
import { firestore } from "@/infrastructure/database/firebase";
import { CreateJobSchema } from "@app/validators/job.validator";
import { validateImageUrl } from "@app/services/image-processor";

export const createJobController = () => ({
  async createJob(req: Request, res: Response): Promise<void> {
    try {
      // Validate payload
      const validationResult = CreateJobSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.format(),
        });
        return;
      }

      const { url, transformations } = validationResult.data;

      try {
        await validateImageUrl(url);
      } catch (error: any) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }


      // Create job on Firestore to get the ID
      const jobRef = firestore.collection("jobs").doc();
      const jobId = jobRef.id;

      const jobData: JobResponse = {
        id: jobId,
        url,
        status: "pending",
        progress: 0,
        createdAt: Date.now(),
      };

      await jobRef.set(jobData);

      // Add to queue with transformations
      await imageQueue.add(
        "process-image",
        {
          url,
          createdAt: new Date().toISOString(),
          transformations,
        },
        {
          jobId: jobId,
        }
      );

      res.json(jobData);
    } catch (error) {
      console.error("Error adding job to the queue:", error);
      res.status(500).json({
        success: false,
        message: "Error adding job to the queue",
      });
    }
  },

  async getJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const jobDoc = await firestore.collection("jobs").doc(id).get();

      if (!jobDoc.exists) {
        res.status(404).json({
          success: false,
          message: "Job not found",
        });
        return;
      }

      res.json({ id: jobDoc.id, ...jobDoc.data() });
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching job",
      });
    }
  },

  async listJobs(req: Request, res: Response): Promise<void> {
    try {
      const snapshot = await firestore
        .collection("jobs")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      const jobs: JobResponse[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as JobResponse)
      );

      res.json({ jobs });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching jobs",
      });
    }
  },
});
