/*
  Warnings:

  - Made the column `channel_id` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sender_id` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `first_name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nickname` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatar_url` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "channel_id" SET NOT NULL,
ALTER COLUMN "sender_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_connection" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL,
ALTER COLUMN "nickname" SET NOT NULL,
ALTER COLUMN "avatar_url" SET NOT NULL;
