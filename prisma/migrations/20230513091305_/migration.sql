/*
  Warnings:

  - The primary key for the `Flow` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Flow" DROP CONSTRAINT "Flow_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Flow_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Flow_id_seq";
