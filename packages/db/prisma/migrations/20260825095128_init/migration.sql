/*
  Warnings:

  - Added the required column `name` to the `LineItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN     "name" TEXT NOT NULL;
