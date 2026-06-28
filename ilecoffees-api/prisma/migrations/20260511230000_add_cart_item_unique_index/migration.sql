-- AddUniqueConstraint
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_coffeeId_key" UNIQUE ("userId", "coffeeId");
