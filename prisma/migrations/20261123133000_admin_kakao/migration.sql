-- AlterTable: switch AdminUser from password auth to Kakao ID
DELETE FROM "AdminUser";

ALTER TABLE "AdminUser" DROP COLUMN "passwordHash";

ALTER TABLE "AdminUser" ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "AdminUser" ADD COLUMN "kakaoId" TEXT NOT NULL;
ALTER TABLE "AdminUser" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "AdminUser_email_key";
CREATE UNIQUE INDEX "AdminUser_kakaoId_key" ON "AdminUser"("kakaoId");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
