"use client"

import { useState } from "react"
import { createAccount } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddAccountForm() {
  const [name, setName] = useState("")
  const [type, setType] = useState("CHECKING")
  const [balance, setBalance] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createAccount({
        name,
        type,
        balance: parseFloat(balance) || 0
      })
      setName("")
      setBalance("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Account</CardTitle>
        <CardDescription>Create a new account to track balances.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Chase Checking" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKING">Checking</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="CREDIT">Credit Card</SelectItem>
                <SelectItem value="LOAN">Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Initial Balance</Label>
            <Input id="balance" type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} required placeholder="0.00" />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
