/*
  Warnings:

  - You are about to drop the column `banned_id` on the `ban_channels` table. All the data in the column will be lost.
  - You are about to drop the column `chan_owner` on the `channels` table. All the data in the column will be lost.
  - Added the required column `channel_id` to the `ban_channels` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `ban_channels` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ban_channels" DROP CONSTRAINT "ban_channels_banned_id_fkey";

-- DropForeignKey
ALTER TABLE "ban_channels" DROP CONSTRAINT "ban_channels_id_fkey";

-- DropForeignKey
ALTER TABLE "channels" DROP CONSTRAINT "channels_chan_owner_fkey";

-- AlterTable
ALTER TABLE "ban_channels" DROP COLUMN "banned_id",
ADD COLUMN     "channel_id" INTEGER NOT NULL,
ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "channels" DROP COLUMN "chan_owner",
ADD COLUMN     "owner" INTEGER;

-- AddForeignKey
ALTER TABLE "ban_channels" ADD CONSTRAINT "ban_channels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ban_channels" ADD CONSTRAINT "ban_channels_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_owner_fkey" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
