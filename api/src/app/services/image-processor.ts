import axios from "axios";
import sharp from "sharp";
import {  ImageTransformation } from "@core/types";

export async function downloadImage(url: string): Promise<Buffer> {
  await validateImageUrl(url);
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024,
    });

    return Buffer.from(response.data);
  } catch (error: any) {
    if (error.code === "ECONNABORTED") {
      throw new Error("Download timeout - image too large");
    }
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

export async function processImage(
  imageBuffer: Buffer,
  transformations: ImageTransformation[]
): Promise<Buffer> {
  console.log(
    `Starting image processing with ${transformations.length} transformation(s)`
  );
  let pipeline = sharp(imageBuffer);

  for (const transformation of transformations) {
    switch (transformation.type) {
      case "resize":
        pipeline = applyResize(pipeline, transformation);
        break;

      case "grayscale":
        pipeline = applyGrayscale(pipeline);
        break;

      case "watermark":
        pipeline = applyWatermark(pipeline, transformation);
        break;
    }
  }

  console.log("Converting to JPEG with quality 90");
  return pipeline.jpeg({ quality: 90 }).toBuffer();
}

export async function uploadToStorage(
  imageBuffer: Buffer,
  jobId: string,
  storage: any
): Promise<string> {
  const fileName = `processed/${jobId}.jpg`;
  const file = storage.file(fileName);

  await file.save(imageBuffer, {
    metadata: {
      contentType: "image/jpeg",
      metadata: {
        processedAt: new Date().toISOString(),
      },
    },
  });

  await file.makePublic();

  const resultUrl = `https://storage.googleapis.com/${storage.name}/${fileName}`;
  return resultUrl;
}

function applyGrayscale(pipeline: sharp.Sharp): sharp.Sharp {
  console.log("Applying grayscale filter");
  return pipeline.grayscale();
}

function applyWatermark(
  pipeline: sharp.Sharp,
  transformation: ImageTransformation
): sharp.Sharp {
  if (transformation.options && "text" in transformation.options) {
    const { text, position = "bottom-right" } = transformation.options;
    console.log(`Applying watermark: "${text}" at ${position}`);

    const svgWatermark = Buffer.from(`
      <svg width="200" height="50">
        <text x="10" y="30" font-family="sans-serif" font-size="20" fill="white" opacity="0.7">
          ${text}
        </text>
      </svg>
    `);

    return pipeline.composite([
      {
        input: svgWatermark,
        gravity: getGravityFromPosition(position),
      },
    ]);
  }
  return pipeline;
}

function getGravityFromPosition(position: string): string {
  const gravityMap: Record<string, string> = {
    "top-left": "northwest",
    "top-right": "northeast",
    "bottom-left": "southwest",
    "bottom-right": "southeast",
    center: "center",
  };
  return gravityMap[position] || "southeast";
}

function applyResize(
  pipeline: sharp.Sharp,
  transformation: ImageTransformation
): sharp.Sharp {
  if (transformation.options && "width" in transformation.options) {
    const { width, height } = transformation.options;
    console.log(`Applying resize: ${width}x${height}`);
    return pipeline.resize(width, height, { fit: "fill" });
  }
  return pipeline;
}

export async function validateImageUrl(url: string): Promise<void> {
  try {
    const headResponse = await axios.head(url, { timeout: 5000 });
    const contentType = headResponse.headers["content-type"];

    if (!contentType?.startsWith("image/")) {
      throw new Error("URL does not point to an image");
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Image not found (404)");
    }
    if (error.message === "URL does not point to an image") {
      throw error;
    }
    throw new Error("Failed to validate image URL");
  }
}
