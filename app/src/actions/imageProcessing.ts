// import { io, Socket } from 'socket.io-client';
import { firestore } from './firebase';
import { collection, onSnapshot, query, orderBy, type DocumentData } from 'firebase/firestore';
import type { ImageTransformation, Job } from '@/types/imageProcessing';


// let socket: Socket | null = null;

// function getSocket() {
//   if (!socket) {
//     socket = io("/api", {
//         path: "/ws",
//     });
//   }
//   return socket;
// }


export async function submitImageUrl(url: string, transformations: ImageTransformation[]) {
  const response = await fetch(`/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, transformations }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit job');
  }

  return response.json();
}


export async function fetchJobs() {
  const response = await fetch(`/api/jobs`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  const data = await response.json();
  return data.jobs;
}

export function subscribeToJobs(callback: (jobs: Job[]) => void) {
  const q = query(collection(firestore, 'jobs'), orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const jobs: Job[] = snapshot.docs.map(doc => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        url: data.url,
        status: data.status,
        progress: data.progress,
        createdAt: data.createdAt,
        resultUrl: data.resultUrl,
        error: data.error,
      } as Job;
    });
    callback(jobs);
  });

  return unsubscribe;
}