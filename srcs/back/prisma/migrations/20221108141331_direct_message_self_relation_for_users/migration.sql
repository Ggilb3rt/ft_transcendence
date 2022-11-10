/*
  Warnings:

  - You are about to drop the column `relation` on the `messages` table. All the data in the column will be lost.
  - Added the required column `content` to the `direct_message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_relation_fkey";

-- AlterTable
ALTER TABLE "direct_message" ADD COLUMN     "content" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "relation";

-- AddForeignKey
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_second_user_id_fkey" FOREIGN KEY ("second_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
