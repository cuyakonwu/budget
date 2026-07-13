"use client"

import { useState } from "react"
import Papa from "papaparse"
import { createTransactions } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

type Account = {
  id: string
  name: string
}

export function CsvUploadForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [accountId, setAccountId] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleParse = () => {
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mapped = results.data.map((row: any) => {
          // Find Date
          const dateStr = row['Date'] || row['date'] || row['Posted Date'] || row['Post Date'] || row['Transaction Date'] || row['Trans Date'];
          const date = dateStr ? new Date(dateStr) : new Date(NaN);

          // Find Amount (Handle separate Debit/Credit columns or a single Amount column)
          let amount = NaN;
          const rawAmount = row['Amount'] || row['amount'];
          const debit = row['Debit'] || row['debit'];
          const credit = row['Credit'] || row['credit'];

          const cleanNum = (str: string) => parseFloat((str || "0").toString().replace(/[$,]/g, ''));

          if (rawAmount !== undefined && rawAmount !== "") {
            amount = cleanNum(rawAmount);
          } else if ((debit !== undefined && debit !== "") || (credit !== undefined && credit !== "")) {
            amount = cleanNum(credit || "0") - Math.abs(cleanNum(debit || "0"));
          }

          // Find Payee/Description
          const payee = row['Description'] || row['description'] || row['Payee'] || row['payee'] || row['Name'] || row['name'] || "Unknown";

          return { date, amount, payee }
        }).filter(r => !isNaN(r.amount) && !isNaN(r.date.getTime()))

        setParsedData(mapped)
      }
    })
  }

  const handleSubmit = async () => {
    if (!accountId || parsedData.length === 0) return
    setLoading(true)
    
    try {
      const transactions = parsedData.map(d => ({
        date: d.date,
        amount: d.amount,
        payee: d.payee,
        accountId: accountId
      }))
      
      const insertedCount = await createTransactions(transactions)
      alert(`Upload complete! Imported ${insertedCount} new transactions. Skipped ${transactions.length - insertedCount} duplicates.`)
      setParsedData([])
      setAccountId("")
      router.push("/transactions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Transactions CSV</CardTitle>
          <CardDescription>Select an account and upload a CSV from your bank.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>CSV File</Label>
            <div className="flex gap-4">
              <Input type="file" accept=".csv" onChange={handleFileChange} />
              <Button onClick={handleParse} disabled={!file}>Parse</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({parsedData.length} transactions)</CardTitle>
            <CardDescription>Review the parsed data before submitting.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.date.toLocaleDateString()}</TableCell>
                      <TableCell>{row.payee}</TableCell>
                      <TableCell className="text-right">${row.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {parsedData.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        ... and {parsedData.length - 10} more rows.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button onClick={handleSubmit} disabled={loading || !accountId} className="w-full">
              {loading ? "Importing..." : "Import Transactions"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
