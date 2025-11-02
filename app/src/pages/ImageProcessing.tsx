import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUrlForm } from '@/components/ImageUrlForm';
import { JobList } from '@/components/JobList';
import { useJobs } from '@/hooks/useJobs';

export function ImageProcessing() {
    const { jobs } = useJobs();

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Image Processing</CardTitle>
                    <CardDescription>Submit image URLs for processing</CardDescription>
                </CardHeader>
                <CardContent>
                    <ImageUrlForm />
                </CardContent>
            </Card>

            <JobList jobs={jobs} />
        </div>
    );
}