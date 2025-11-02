import { useState, useEffect, useCallback } from 'react';
import { subscribeToJobs } from "@/actions/imageProcessing";
import type { Job } from '@/types/imageProcessing';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { JOBS_PER_PAGE } from '@/config/constants';

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
  const [hasMore, setHasMore] = useState(false);
  const [lastDocs, setLastDocs] = useState<(QueryDocumentSnapshot<DocumentData> | undefined)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const lastDoc = lastDocs[currentPage - 2];
    
    const unsubscribe = subscribeToJobs(
      (newJobs, more, lastDocFromQuery) => {
        setJobs(newJobs);
        setHasMore(more);
        
        if (lastDocFromQuery && more) {
          setLastDocs(prev => {
            const updated = [...prev];
            updated[currentPage - 1] = lastDocFromQuery;
            return updated;
          });
        }
      },
      JOBS_PER_PAGE,
      lastDoc
    );

    return () => unsubscribe();
  }, [currentPage]);

  const nextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return {
    jobs,
    hasMore,
    currentPage,
    nextPage,
    prevPage,
  };
}