import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

interface Job {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: number;
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    const variants: Record<Job['status'], string> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'success',
      failed: 'destructive'
    };

    return (
      <Badge variant={variants[job.status] as any}>
        {job.status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Job {job.id.slice(0, 8)}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Source URL:</p>
          <p className="text-sm break-all">{job.url}</p>
        </div>

        {(job.status === 'processing' || job.status === 'pending') && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <Progress value={job.progress} />
          </div>
        )}

        {job.status === 'failed' && job.error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md">
            <p className="text-sm font-medium">Error:</p>
            <p className="text-sm">{job.error}</p>
          </div>
        )}

        {job.status === 'completed' && job.resultUrl && (
          <div>
            <p className="text-sm font-medium mb-2">Result:</p>
            <img 
              src={job.resultUrl} 
              alt="Processed result" 
              className="w-full rounded-md border"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}