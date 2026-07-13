"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, ArrowRight, ArrowLeft } from "lucide-react"
import { assignBillToPaycheck, toggleBillPaid, deleteBill, deletePaycheck } from "../actions"
import { AddPaycheckForm } from "./add-paycheck-form"
import { AddBillForm } from "./add-bill-form"

type Bill = {
  id: string
  name: string
  expectedAmt: number
  dueDate: Date
  isPaid: boolean
  paycheckId: string | null
}

type Paycheck = {
  id: string
  name: string
  date: Date
  expectedAmt: number
  bills: Bill[]
}

export function PaycheckDashboard({ paychecks, unassignedBills }: { paychecks: Paycheck[], unassignedBills: Bill[] }) {
  const [selectedPaycheckId, setSelectedPaycheckId] = useState<string | null>(paychecks[0]?.id || null)

  const activePaycheck = paychecks.find(p => p.id === selectedPaycheckId)

  const totalAssigned = activePaycheck?.bills.reduce((sum, b) => sum + b.expectedAmt, 0) || 0
  const leftToSpend = (activePaycheck?.expectedAmt || 0) - totalAssigned

  return (
    <div className="space-y-8">
      {/* Paycheck Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {paychecks.map(p => (
          <Card 
            key={p.id} 
            className={`min-w-[250px] cursor-pointer transition-colors ${selectedPaycheckId === p.id ? 'border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
            onClick={() => setSelectedPaycheckId(p.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>{new Date(p.date).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${p.expectedAmt.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
        <div className="flex items-center justify-center min-w-[250px] border-2 border-dashed rounded-xl p-6">
          <AddPaycheckForm />
        </div>
      </div>

      {activePaycheck ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Active Paycheck Details */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{activePaycheck.name}</CardTitle>
                  <CardDescription>Allocated Bills & Fixed Expenses</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Left to Spend</p>
                  <p className={`text-2xl font-bold ${leftToSpend < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ${leftToSpend.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {activePaycheck.bills.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No bills assigned to this paycheck yet.</p>
              ) : (
                <div className="space-y-3">
                  {activePaycheck.bills.map(bill => (
                    <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={bill.isPaid} 
                          onCheckedChange={(c) => toggleBillPaid(bill.id, !!c)} 
                        />
                        <div className={bill.isPaid ? 'opacity-50 line-through' : ''}>
                          <p className="font-medium">{bill.name}</p>
                          <p className="text-xs text-muted-foreground">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">${bill.expectedAmt.toFixed(2)}</p>
                        <Button variant="ghost" size="icon" onClick={() => assignBillToPaycheck(bill.id, null)} title="Unassign">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between border-t p-4">
              <AddBillForm paycheckId={activePaycheck.id} />
              <Button variant="destructive" size="sm" onClick={() => {
                if (confirm("Delete this paycheck?")) deletePaycheck(activePaycheck.id);
                setSelectedPaycheckId(null);
              }}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete Paycheck
              </Button>
            </CardFooter>
          </Card>

          {/* Unassigned Bills Pool */}
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Bills</CardTitle>
              <CardDescription>Bills waiting to be assigned to a paycheck</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {unassignedBills.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">All clear! No unassigned bills.</p>
              ) : (
                <div className="space-y-3">
                  {unassignedBills.map(bill => (
                    <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => assignBillToPaycheck(bill.id, activePaycheck.id)} title="Assign to selected paycheck">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                          <p className="font-medium">{bill.name}</p>
                          <p className="text-xs text-muted-foreground">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">${bill.expectedAmt.toFixed(2)}</p>
                        <Button variant="ghost" size="icon" onClick={() => deleteBill(bill.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-4">
              <AddBillForm />
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No Paycheck Selected</h2>
          <p className="text-muted-foreground">Create or select a paycheck above to start allocating your funds.</p>
        </div>
      )}
    </div>
  )
}
