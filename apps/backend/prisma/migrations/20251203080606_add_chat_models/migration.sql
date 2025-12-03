-- CreateTable
CREATE TABLE "ChatInvitation" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatInvitation_toUserId_idx" ON "ChatInvitation"("toUserId");

-- AddForeignKey
ALTER TABLE "ChatInvitation" ADD CONSTRAINT "ChatInvitation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatInvitation" ADD CONSTRAINT "ChatInvitation_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatInvitation" ADD CONSTRAINT "ChatInvitation_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
