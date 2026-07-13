import { getAccounts } from "../actions"
import { CsvUploadForm } from "./csv-upload-form"

export default async function UploadPage() {
  const accounts = await getAccounts()

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Batch Upload</h1>
      {accounts.length === 0 ? (
        <p className="text-muted-foreground">
          You need to add an account first before uploading transactions.
        </p>
      ) : (
        <CsvUploadForm accounts={accounts} />
      )}
    </div>
  )
}
