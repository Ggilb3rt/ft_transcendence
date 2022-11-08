-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "relation" INTEGER;

-- CreateTable
CREATE TABLE "direct_message" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "second_user_id" INTEGER NOT NULL,

    CONSTRAINT "direct_message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_relation_fkey" FOREIGN KEY ("relation") REFERENCES "direct_message"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
