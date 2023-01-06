-- CreateEnum
CREATE TYPE "BillReferralType" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "CongressHouse" AS ENUM ('SENATE', 'HOUSE_OF_REPRESENTATIVES');

-- CreateEnum
CREATE TYPE "BillSignificance" AS ENUM ('NATIONAL', 'LOCAL');

-- CreateEnum
CREATE TYPE "BillAuthorshipType" AS ENUM ('PRINCIPAL', 'COAUTHOR');

-- CreateTable
CREATE TABLE "Bill" (
    "id" UUID NOT NULL,
    "billNum" TEXT NOT NULL,
    "congressNum" INTEGER NOT NULL,
    "house" "CongressHouse" NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "abstract" TEXT,
    "dateFiled" TEXT NOT NULL,
    "significance" "BillSignificance" NOT NULL,
    "fullText" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "summary" TEXT,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Politician" (
    "id" UUID NOT NULL,
    "house" "CongressHouse" NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "additionalTitle" TEXT,
    "partyList" TEXT,
    "location" TEXT,
    "photoUrl" TEXT,

    CONSTRAINT "Politician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Committee" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "house" "CongressHouse" NOT NULL,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stance" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,

    CONSTRAINT "Stance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillAuthorship" (
    "id" UUID NOT NULL,
    "billId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "authorshipType" "BillAuthorshipType" NOT NULL,

    CONSTRAINT "BillAuthorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillCommitteeReferral" (
    "id" UUID NOT NULL,
    "billId" UUID NOT NULL,
    "committeeId" UUID NOT NULL,
    "referralType" "BillReferralType" NOT NULL,

    CONSTRAINT "BillCommitteeReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticianCommiteeMembership" (
    "id" UUID NOT NULL,
    "politicianId" UUID NOT NULL,
    "committeeId" UUID NOT NULL,
    "title" TEXT,

    CONSTRAINT "PoliticianCommiteeMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BillToStance" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNum_congressNum_key" ON "Bill"("billNum", "congressNum");

-- CreateIndex
CREATE UNIQUE INDEX "BillAuthorship_billId_authorId_key" ON "BillAuthorship"("billId", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "BillCommitteeReferral_billId_committeeId_referralType_key" ON "BillCommitteeReferral"("billId", "committeeId", "referralType");

-- CreateIndex
CREATE UNIQUE INDEX "PoliticianCommiteeMembership_politicianId_committeeId_key" ON "PoliticianCommiteeMembership"("politicianId", "committeeId");

-- CreateIndex
CREATE UNIQUE INDEX "_BillToStance_AB_unique" ON "_BillToStance"("A", "B");

-- CreateIndex
CREATE INDEX "_BillToStance_B_index" ON "_BillToStance"("B");

-- AddForeignKey
ALTER TABLE "BillAuthorship" ADD CONSTRAINT "BillAuthorship_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillAuthorship" ADD CONSTRAINT "BillAuthorship_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Politician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillCommitteeReferral" ADD CONSTRAINT "BillCommitteeReferral_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillCommitteeReferral" ADD CONSTRAINT "BillCommitteeReferral_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticianCommiteeMembership" ADD CONSTRAINT "PoliticianCommiteeMembership_politicianId_fkey" FOREIGN KEY ("politicianId") REFERENCES "Politician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticianCommiteeMembership" ADD CONSTRAINT "PoliticianCommiteeMembership_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillToStance" ADD CONSTRAINT "_BillToStance_A_fkey" FOREIGN KEY ("A") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillToStance" ADD CONSTRAINT "_BillToStance_B_fkey" FOREIGN KEY ("B") REFERENCES "Stance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
