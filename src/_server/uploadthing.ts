import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerAuthSession } from "~/_server/lib/next-auth";
import { prisma } from "~/_server/lib/prisma";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const utFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async (req) => {
      // This code runs on your server before upload
      const session = await getServerAuthSession();

      // If you throw, the user will not be able to upload
      if (!session) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const f = await prisma.file.create({
        data: { key: file.key, createdById: metadata.userId },
      });
    }),
} satisfies FileRouter;

export type UtFileRouter = typeof utFileRouter;
