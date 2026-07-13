"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBill } from "../actions"

export function AddBillForm({ paycheckId }: { paycheckId?: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createBill({
        name,
        dueDate: date,
        expectedAmt: parseFloat(amount) || 0,
        paycheckId: paycheckId || undefined
      })
      setOpen(false)
      setName("")
      setDate("")
      setAmount("")
    } catch (err: any) {
      console.error(err)
      alert("Failed to create bill: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={paycheckId ? "outline" : "default"} size={paycheckId ? "sm" : "default"} />}>
        <Plus className="mr-2 h-4 w-4" /> Add Bill / Fixed Expense
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Bill or Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (e.g. Rent, Roth IRA)</Label>
            <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Due Date / Target Date</Label>
            <Input id="date" type="date" required value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Expected Amount</Label>
            <Input id="amount" type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
