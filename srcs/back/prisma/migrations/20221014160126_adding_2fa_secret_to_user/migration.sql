-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_secret" TEXT,
ALTER COLUMN "avatar_url" SET DEFAULT '/app/resources/default.jpg';
