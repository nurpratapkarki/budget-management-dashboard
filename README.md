# Budget Management Dashboard

Welcome to your Budget Management Dashboard! This application helps you manage your personal finances, track expenses, set budgets, monitor income, manage tasks, track your mood, and handle friendly loans, all in one place.

This project is built with Vite, TypeScript, React, shadcn/ui, and Tailwind CSS, utilizing Supabase as the backend.

## Features

*   **Dashboard Overview:**
    *   At-a-glance financial summary: Total Income, Total Expenses, Net Savings.
    *   Visual representation of monthly expenses with a line chart.
    *   Expense breakdown by category using a pie chart.
    *   Tracking of days left in the month to manage budgets.
*   **Income Management:** Record and manage various income sources.
*   **Expense Tracking:** Add, categorize, and monitor expenses.
*   **Budget Management:** Set and track budgets for different categories.
*   **Task Management:** A simple to-do list to keep track of financial or other tasks.
*   **Mood Tracking:** Log daily moods to see patterns over time.
*   **Friendly Loans Management:**
    *   Track loans taken from or given to friends.
    *   Manage a list of friends with contact numbers.
    *   Record repayments for each loan.
    *   View detailed loan history per friend.
    *   Automatic status updates for loans (Pending, Partially Paid, Paid).
*   **User Authentication:** Secure user sign-up and login via Supabase Auth.

## Tech Stack

*   **Frontend:**
    *   React with Vite
    *   TypeScript
    *   Tailwind CSS for styling
    *   shadcn/ui for UI components
    *   Recharts for charts
    *   React Hook Form for form handling
    *   Zod for schema validation
    *   TanStack Query (React Query) for server state management
    *   date-fns for date utilities
    *   lucide-react for icons
*   **Backend:**
    *   Supabase (PostgreSQL Database, Auth, Storage, Edge Functions if used)
*   **Development:**
    *   Bun (as indicated by `bun.lockb`) or Node.js/npm
    *   ESLint for linting

## Project Structure (`src` directory)

```
src/
├── App.css               # Global CSS styles for App component
├── App.tsx               # Main application component, sets up routing
├── index.css             # Global styles, Tailwind base, etc.
├── main.tsx              # Entry point of the application
├── vite-env.d.ts         # Vite environment type definitions
├── components/
│   ├── dashboard/        # Components specific to the main dashboard page
│   │   ├── BudgetProgress.tsx
│   │   ├── ExpensePieChart.tsx
│   │   ├── FriendlyLoansSummary.tsx
│   │   ├── IncomeCard.tsx
│   │   ├── MoodTracker.tsx
│   │   ├── StatCard.tsx
│   │   └── TasksList.tsx
│   ├── layout/           # Layout components (e.g., sidebar, header)
│   │   ├── AppSidebar.tsx
│   │   ├── MobileTabBar.tsx
│   │   └── PageHeader.tsx
│   └── ui/               # shadcn/ui components (auto-generated)
├── hooks/                # Custom React hooks (if any)
├── lib/
│   ├── helpers.ts        # Utility functions (currency formatting, date calculations)
│   ├── supabase.ts       # Supabase client initialization and all service functions
│   └── types.ts          # TypeScript type definitions for database entities, etc.
├── pages/
│   ├── Auth.tsx              # Authentication page (Login/Signup)
│   ├── Budgets.tsx           # Page for managing budgets
│   ├── Dashboard.tsx         # Main dashboard page
│   ├── Expenses.tsx          # Page for managing expenses
│   ├── FriendlyLoans.tsx     # Page for managing friendly loans
│   ├── Income.tsx            # Page for managing income
│   ├── Moods.tsx             # Page for managing moods (if exists as separate page)
│   ├── NotFound.tsx          # 404 Not Found page
│   ├── Settings.tsx          # User settings page
│   └── Tasks.tsx             # Page for managing tasks (if exists as separate page)
└── integrations/         # Potential future integrations (currently may be empty)

```

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   Node.js & npm (or Bun)
    *   If using Node.js, consider using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage Node versions.
*   A Supabase account (free tier is sufficient).

### 1. Clone the Repository

```bash
git clone https://github.com/nurpratapkarki/budget-management-dashboard.git
cd budget-management-dashboard
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```
Or, if you are using Bun (as suggested by `bun.lockb`):
```bash
bun install
```

### 3. Supabase Setup

#### a. Create a Supabase Project

1.  Go to [Supabase](https://supabase.com/) and sign in or create an account.
2.  Create a new project. Choose a name and select a region.
3.  Store your database password securely.

#### b. Get Supabase Credentials

1.  In your Supabase project dashboard, navigate to **Project Settings** (the gear icon).
2.  Go to **API**.
3.  You will find your **Project URL** and **Project API Keys** (use the `anon` key, which is public).

#### c. Configure Supabase in the Project

Open the `src/lib/supabase.ts` file.
Update the following lines with your Supabase Project URL and Anon Key:

```typescript
// src/lib/supabase.ts

// ... imports ...

// Use your actual Supabase URL and key
const supabaseUrl = "YOUR_SUPABASE_PROJECT_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_PUBLIC_KEY";

// ... rest of the file ...
```
**Note:** For production applications, it's highly recommended to use environment variables for these keys rather than hardcoding them. You can create a `.env` file at the root of your project and use Vite's environment variable handling (e.g., `import.meta.env.VITE_SUPABASE_URL`).

#### d. Database Schema Setup

You need to set up the database tables. Go to the **SQL Editor** in your Supabase project dashboard and run the following SQL commands.

**Users Table:** Supabase Auth handles the `auth.users` table automatically.

**Helper Function for `updated_at` (Run this first):**
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Expenses Table:**
```sql
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER expenses_updated_at_trigger
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert access for authenticated users" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update access for authenticated users" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete access for authenticated users" ON public.expenses FOR DELETE USING (auth.uid() = user_id);
```

**Incomes Table:**
```sql
CREATE TABLE public.incomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    period TEXT, -- e.g., 'monthly', 'weekly', 'one-time'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER incomes_updated_at_trigger
BEFORE UPDATE ON public.incomes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.incomes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert access for authenticated users" ON public.incomes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update access for authenticated users" ON public.incomes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete access for authenticated users" ON public.incomes FOR DELETE USING (auth.uid() = user_id);
```

**Budgets Table:**
```sql
CREATE TABLE public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL UNIQUE, -- Ensure unique category per user if combined with user_id
    amount NUMERIC(10, 2) NOT NULL,
    period TEXT NOT NULL, -- e.g., 'monthly', 'yearly'
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER budgets_updated_at_trigger
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert access for authenticated users" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update access for authenticated users" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete access for authenticated users" ON public.budgets FOR DELETE USING (auth.uid() = user_id);
```

**Tasks Table:**
```sql
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER tasks_updated_at_trigger
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert access for authenticated users" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update access for authenticated users" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete access for authenticated users" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
```

**Moods Table:**
```sql
CREATE TABLE public.moods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_type TEXT NOT NULL, -- e.g., 'happy', 'sad', 'neutral'
    notes TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER moods_updated_at_trigger
BEFORE UPDATE ON public.moods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.moods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert access for authenticated users" ON public.moods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update access for authenticated users" ON public.moods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete access for authenticated users" ON public.moods FOR DELETE USING (auth.uid() = user_id);
```

**Friends Table:**
```sql
CREATE TABLE public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name) -- Ensure friend names are unique per user
);

CREATE TRIGGER friends_updated_at_trigger
BEFORE UPDATE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for authenticated users on their own friends" ON public.friends
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

**Loans Table:**
```sql
CREATE TABLE public.loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.friends(id) ON DELETE RESTRICT NOT NULL, -- Changed from SET NULL to RESTRICT
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL, -- 'taken' or 'given'
    loan_date DATE NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'pending', -- 'pending', 'partially_paid', 'paid', 'overdue'
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER loans_updated_at_trigger
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for authenticated users on their own loans" ON public.loans
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

**Repayments Table:**
```sql
CREATE TABLE public.repayments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    repayment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER repayments_updated_at_trigger
BEFORE UPDATE ON public.repayments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for authenticated users on their own repayments" ON public.repayments
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

**Important:** Ensure Row Level Security (RLS) is enabled for these tables as shown in the policies above. Supabase enables RLS by default on new projects, but it's good to verify.

### 4. Run the Development Server

Using npm:
```bash
npm run dev
```
Or, if using Bun:
```bash
bun dev
```
This will start the development server, usually on `http://localhost:5173` (Vite's default). Open your browser to this address.

## Environment Variables (Recommended Setup)

Instead of hardcoding Supabase keys in `src/lib/supabase.ts`, it's better to use environment variables.

1.  Create a file named `.env` in the root of your project.
2.  Add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    ```
3.  Update `src/lib/supabase.ts` to use these variables:
    ```typescript
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    ```
4.  Ensure `.env` is listed in your `.gitignore` file to prevent committing it to version control.

## Deployment

This project is built with Vite. Refer to the [Vite documentation on deployment](https://vitejs.dev/guide/static-deploy.html) for instructions on how to build and deploy your application to various platforms (e.g., Vercel, Netlify, GitHub Pages).

---

Happy budgeting!

