-- CreateTable
CREATE TABLE "installation" (
    "id" INTEGER NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "installation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "installation_userId_idx" ON "installation"("userId");

-- AddForeignKey
ALTER TABLE "installation" ADD CONSTRAINT "installation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
