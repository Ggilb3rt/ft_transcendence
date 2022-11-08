/*
  Warnings:

  - You are about to drop the column `ban_begin` on the `ban_channels` table. All the data in the column will be lost.
  - You are about to drop the column `ban_begin` on the `ban_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ban_channels" DROP COLUMN "ban_begin",
ADD COLUMN     "expires" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "ban_users" DROP COLUMN "ban_begin",
ADD COLUMN     "expires" TIMESTAMPTZ(6);
