"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPaycheck } from "../actions"

export function AddPaycheckForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createPaycheck({
        name,
        date,
        expectedAmt: parseFloat(amount) || 0
      })
      setOpen(false)
      setName("")
      setDate("")
      setAmount("")
    } catch (err: any) {
      console.error(err)
      alert("Failed to create paycheck: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Add Paycheck
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Paycheck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (e.g. 1st of Month)</Label>
            <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" required value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Expected Amount</Label>
            <Input id="amount" type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Create Paycheck"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
