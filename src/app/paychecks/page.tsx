import { getPaychecks, getUnassignedBills } from "../actions"
import { PaycheckDashboard } from "./paycheck-dashboard"

export default async function PaychecksPage() {
  const paychecks = await getPaychecks()
  const unassignedBills = await getUnassignedBills()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paychecks & Bills</h1>
        <p className="text-muted-foreground">
          Allocate your income to your fixed expenses to see how much you have left to spend.
        </p>
      </div>

      <PaycheckDashboard paychecks={paychecks} unassignedBills={unassignedBills} />
    </div>
  )
}
