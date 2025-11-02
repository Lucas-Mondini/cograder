// components/ImageUrlForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { submitImageUrl } from '@/actions/imageProcessing';
import type { ImageTransformation, WatermarkPosition } from '@/types/imageProcessing';
import { toast } from 'sonner';


export function ImageUrlForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Transformation states
  const [enableResize, setEnableResize] = useState(false);
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('600');
  
  const [enableGrayscale, setEnableGrayscale] = useState(false);
  
  const [enableWatermark, setEnableWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('bottom-right');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Build transformations array
    const transformations: ImageTransformation[] = [];

    if (enableResize) {
      const w = parseInt(width);
      const h = parseInt(height);
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        toast.error("Please enter valid width and height");
        return;
      }
      transformations.push({
        type: 'resize',
        options: { width: w, height: h }
      });
    }

    if (enableGrayscale) {
      transformations.push({ type: 'grayscale' });
    }

    if (enableWatermark) {
      if (!watermarkText.trim()) {
        toast.error("Please enter watermark text");
        return;
      }
      transformations.push({
        type: 'watermark',
        options: { text: watermarkText, position: watermarkPosition }
      });
    }

    if (transformations.length === 0) {
      toast.error("Please select at least one transformation");
      return;
    }

    setIsLoading(true);
    try {
      await submitImageUrl(url, transformations);
      setUrl('');
      setEnableResize(false);
      setEnableGrayscale(false);
      setEnableWatermark(false);
      setWatermarkText('');
      toast.success("Image submitted for processing");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-4">
        <Label>Transformations</Label>
        
        {/* Resize */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="resize"
              checked={enableResize}
              onCheckedChange={(checked) => setEnableResize(!!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="resize" className="cursor-pointer">Resize</Label>
          </div>
          {enableResize && (
            <div className="ml-6 flex gap-2">
              <Input
                type="number"
                placeholder="Width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                disabled={isLoading}
                className="w-24"
              />
              <span className="flex items-center">×</span>
              <Input
                type="number"
                placeholder="Height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled={isLoading}
                className="w-24"
              />
            </div>
          )}
        </div>

        {/* Grayscale */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="grayscale"
            checked={enableGrayscale}
            onCheckedChange={(checked) => setEnableGrayscale(!!checked)}
            disabled={isLoading}
          />
          <Label htmlFor="grayscale" className="cursor-pointer">Grayscale</Label>
        </div>

        {/* Watermark */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="watermark"
              checked={enableWatermark}
              onCheckedChange={(checked) => setEnableWatermark(!!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="watermark" className="cursor-pointer">Watermark</Label>
          </div>
          {enableWatermark && (
            <div className="ml-6 space-y-2">
              <Input
                placeholder="Watermark text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                disabled={isLoading}
              />
              <select
                value={watermarkPosition}
                onChange={(e) => setWatermarkPosition(e.target.value as WatermarkPosition)}
                disabled={isLoading}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="center">Center</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}