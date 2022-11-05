/*
  Warnings:

  - You are about to drop the column `is_public` on the `channels` table. All the data in the column will be lost.
  - You are about to drop the column `need_pass` on the `channels` table. All the data in the column will be lost.
  - Added the required column `type` to the `channels` table without a default value. This is not possible if the table is not empty.
  - Made the column `player_left_id` on table `match` required. This step will fail if there are existing NULL values in that column.
  - Made the column `player_right_id` on table `match` required. This step will fail if there are existing NULL values in that column.
  - Made the column `score_left` on table `match` required. This step will fail if there are existing NULL values in that column.
  - Made the column `score_right` on table `match` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "channels" DROP COLUMN "is_public",
DROP COLUMN "need_pass",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "match" ALTER COLUMN "player_left_id" SET NOT NULL,
ALTER COLUMN "player_right_id" SET NOT NULL,
ALTER COLUMN "score_left" SET NOT NULL,
ALTER COLUMN "score_right" SET NOT NULL;
