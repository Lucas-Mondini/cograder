import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUrlForm } from '@/components/ImageUrlForm';
import { JobList } from '@/components/JobList';
import { useJobs } from '@/hooks/useJobs';

export function ImageProcessing() {
    const { jobs, hasMore, currentPage, nextPage, prevPage } = useJobs();

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

            <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                    variant="outline"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    Page {currentPage}
                </span>

                <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={!hasMore}
                >
                    Next
                </Button>
            </div>

            <JobList jobs={jobs} />
        </div>
    );
}