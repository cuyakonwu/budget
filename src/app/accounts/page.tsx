import { getAccounts } from "../actions"
import { AddAccountForm } from "./add-account-form"
import { AccountActions } from "./account-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Accounts</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>A list of all your linked accounts and their balances.</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No accounts found. Add one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell className="text-right">${account.balance.toFixed(2)}</TableCell>
                      <TableCell>
                        <AccountActions account={account} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <AddAccountForm />
      </div>
    </div>
  )
}
