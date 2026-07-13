"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAccounts() {
  return await prisma.account.findMany({
    orderBy: { createdAt: "desc" }
  })
}

export async function createAccount(data: { name: string, type: string, balance: number }) {
  await prisma.account.create({
    data: {
      name: data.name,
      type: data.type,
      balance: data.balance,
    }
  })
  revalidatePath("/accounts")
  revalidatePath("/")
}

export async function updateAccount(id: string, data: { name: string, type: string, balance: number }) {
  await prisma.account.update({
    where: { id },
    data: { name: data.name, type: data.type, balance: data.balance }
  })
  revalidatePath("/accounts")
  revalidatePath("/")
}

export async function deleteAccount(id: string) {
  await prisma.transaction.deleteMany({ where: { accountId: id } })
  await prisma.account.delete({ where: { id } })
  revalidatePath("/accounts")
  revalidatePath("/")
}

export async function getTransactions() {
  return await prisma.transaction.findMany({
    include: { account: true, category: true },
    orderBy: { date: "desc" },
    take: 100
  })
}

export async function createTransactions(data: any[]) {
  if (data.length === 0) return 0;
  
  const accountId = data[0].accountId;
  
  // Get the date range of the incoming transactions
  const dates = data.map(d => new Date(d.date).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // Fetch existing transactions in this range
  const existingTxns = await prisma.transaction.findMany({
    where: {
      accountId,
      date: { gte: minDate, lte: maxDate }
    }
  });

  // Track which existing transactions we've already matched 
  // to allow genuine identical transactions on the same day
  const matchedIds = new Set<string>();
  let insertedCount = 0;

  for (const t of data) {
    const existingMatch = existingTxns.find(ex => 
      ex.amount === t.amount && 
      ex.payee === t.payee && 
      new Date(ex.date).getTime() === new Date(t.date).getTime() &&
      !matchedIds.has(ex.id)
    );

    if (existingMatch) {
      // It's a duplicate, mark it as matched so we don't match it again
      matchedIds.add(existingMatch.id);
    } else {
      // It's a new transaction
      await prisma.transaction.create({ data: t });
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: t.amount } }
      });
      insertedCount++;
    }
  }

  revalidatePath("/transactions")
  revalidatePath("/accounts")
  revalidatePath("/")
  
  return insertedCount;
}

export async function getPaychecks() {
  return await prisma.paycheck.findMany({
    orderBy: { date: "asc" },
    include: { bills: true }
  })
}

export async function createPaycheck(data: { name: string, date: string, expectedAmt: number }) {
  try {
    await prisma.paycheck.create({ 
      data: {
        ...data,
        date: new Date(data.date)
      } 
    })
    revalidatePath("/paychecks")
  } catch (error) {
    console.error("Error creating paycheck:", error)
    throw error
  }
}

export async function deletePaycheck(id: string) {
  // Unassign all bills first
  await prisma.bill.updateMany({
    where: { paycheckId: id },
    data: { paycheckId: null }
  })
  await prisma.paycheck.delete({ where: { id } })
  revalidatePath("/paychecks")
}

export async function getUnassignedBills() {
  return await prisma.bill.findMany({
    where: { paycheckId: null },
    orderBy: { dueDate: "asc" }
  })
}

export async function createBill(data: { name: string, expectedAmt: number, dueDate: string, paycheckId?: string }) {
  try {
    await prisma.bill.create({ 
      data: {
        ...data,
        dueDate: new Date(data.dueDate)
      }
    })
    revalidatePath("/paychecks")
  } catch (error) {
    console.error("Error creating bill:", error)
    throw error
  }
}

export async function deleteBill(id: string) {
  await prisma.bill.delete({ where: { id } })
  revalidatePath("/paychecks")
}

export async function assignBillToPaycheck(billId: string, paycheckId: string | null) {
  await prisma.bill.update({
    where: { id: billId },
    data: { paycheckId }
  })
  revalidatePath("/paychecks")
}

export async function toggleBillPaid(billId: string, isPaid: boolean) {
  await prisma.bill.update({
    where: { id: billId },
    data: { isPaid }
  })
  revalidatePath("/paychecks")
}
