import { useState, useEffect } from "react";
import { subscribeToJobs } from "@/actions/imageProcessing";

interface Job {
  id: string;
  url: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: number;
}

// export function useJobs() {
//   const [jobs, setJobs] = useState<Job[]>([]);

//   useEffect(() => {
//     fetchJobs()
//       .then((initialJobs) => setJobs(initialJobs))
//       .catch((err) => console.error("Error loading jobs:", err));

//     const unsubscribe = subscribeToJobUpdates((updatedJob) => {
//       setJobs((prev) => {
//         const existing = prev.find((j) => j.id === updatedJob.id);
//         if (existing) {
//           return prev.map((j) => (j.id === updatedJob.id ? updatedJob : j));
//         }
//         return [updatedJob, ...prev];
//       });
//     });

//     return unsubscribe;
//   }, []);

//   const addJob = (job: Job) => {
//     setJobs((prev) => [job, ...prev]);
//   };

//   const updateJob = (jobId: string, updates: Partial<Job>) => {
//     setJobs((prev) =>
//       prev.map((job) => (job.id === jobId ? { ...job, ...updates } : job))
//     );
//   };

//   return { jobs, addJob, updateJob };
// }

// useJobs.ts
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToJobs((updatedJobs) => {
      setJobs(updatedJobs);
    });

    return unsubscribe;
  }, []);

  return { jobs };
}