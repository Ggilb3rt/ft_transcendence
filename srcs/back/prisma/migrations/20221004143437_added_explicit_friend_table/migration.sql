/*
  Warnings:

  - You are about to drop the `_friends` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `user_id` on table `ban_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `banned_id` on table `ban_users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_friends" DROP CONSTRAINT "_friends_A_fkey";

-- DropForeignKey
ALTER TABLE "_friends" DROP CONSTRAINT "_friends_B_fkey";

-- DropForeignKey
ALTER TABLE "ban_users" DROP CONSTRAINT "ban_users_id_fkey";

-- AlterTable
ALTER TABLE "ban_users" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "banned_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET DEFAULT './resources/default.png',
ALTER COLUMN "ranking" SET DEFAULT 0,
ALTER COLUMN "wins" SET DEFAULT 0,
ALTER COLUMN "loses" SET DEFAULT 0,
ALTER COLUMN "two_factor_auth" SET DEFAULT false,
ALTER COLUMN "nick_fourtytwo" SET DEFAULT 'marvin@42';

-- DropTable
DROP TABLE "_friends";

-- CreateTable
CREATE TABLE "friends" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "friend_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ban_users" ADD CONSTRAINT "ban_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
