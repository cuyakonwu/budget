***

**System Context & Objective**
I want to completely rebuild my `paycheck-budget` web application from scratch. You will act as the lead engineer and we will pair program this together. We need to create a robust, modern Next.js application that tracks paychecks, bills, and accounts, with a new focus on automating data entry via bank statement uploads.

**Tech Stack**
- Framework: Next.js (App Router)
- React: Version 19
- Styling: Tailwind CSS v4, `shadcn/ui`, `lucide-react` for icons
- Database: SQLite (local `dev.db`)
- ORM: Prisma
- CSV Parsing: `papaparse`

**Core Data Model (Prisma)**
The database needs to support the following entities (we can refine these as we go):
1. **Account**: Checking, Savings, Credit, Loan (tracks balance).
2. **Paycheck**: Tracks expected income vs actual income, and the date of the paycheck.
3. **Bill**: Tracks expected amount, due date, whether it's paid, and optionally links to a specific `Paycheck`.
4. **Transaction**: The actual movement of money. Needs amount, payee, date, linked `Account`, and a linked `Category`.
5. **Category**: For grouping transactions.

**Key Features to Build**
1. **Dashboard & UI**: A stunning, modern, responsive layout (using a sidebar for navigation) that summarizes account balances, upcoming bills, and recent transactions.
2. **Manual Management**: Forms to easily add/edit Accounts, Paychecks, and Bills.
3. **Automated Bank Statement Upload (Primary Focus)**:
   - Provide a UI to upload CSV bank statements.
   - Use `papaparse` to read the CSV on the client or server.
   - **Automation**: The system should map the CSV columns (Date, Amount, Payee) to our `Transaction` model. 
   - It should attempt to *auto-categorize* transactions based on the payee name and *auto-match* expenses to existing unpaid `Bills`.
   - Provide a review screen before saving so I can manually correct any miscategorized transactions or mismatched bills before they hit the database.

**Execution Plan**
Before writing any code, please acknowledge this prompt and provide a step-by-step Implementation Plan (using your `implementation_plan.md` artifact) so we can align on the architecture, the UI design, and the exact steps for handling the CSV upload logic. Once I approve the plan, we will execute it step-by-step.
