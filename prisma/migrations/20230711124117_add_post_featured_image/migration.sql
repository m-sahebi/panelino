-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "featuredImageId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
