// import { io, Socket } from 'socket.io-client';
import { firestore } from './firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot 
} from 'firebase/firestore';
import type { ImageTransformation, Job } from '@/types/imageProcessing';
import { JOBS_PER_PAGE } from '@/config/constants';

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

export function subscribeToJobs(
  callback: (jobs: Job[], hasMore: boolean, lastDoc?: QueryDocumentSnapshot<DocumentData>) => void,
  pageSize: number = JOBS_PER_PAGE,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
) {
  let q = query(
    collection(firestore, 'jobs'), 
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1)
  );

  if (lastDoc) {
    q = query(
      collection(firestore, 'jobs'), 
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize + 1)
    );
  }
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const hasMore = snapshot.docs.length > pageSize;
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
    
    const jobs: Job[] = docs.map(doc => {
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
    
    // Return the last document for pagination
    const lastDocument = docs.length > 0 ? docs[docs.length - 1] : undefined;
    callback(jobs, hasMore, lastDocument);
  });

  return unsubscribe;
}