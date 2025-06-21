# Lead Management System

This project is a comprehensive lead management system with a drag-and-drop Kanban board, dashboard analytics, and integration with Google Sheets for importing leads.

## Features

- **Kanban Board**: Drag-and-drop interface for managing leads through different stages
- **Dashboard**: Visual analytics and metrics for lead performance
- **Google Sheets Integration**: Import leads directly from Google Sheets
- **Lead Management**: Create, update, and track leads
- ** Agent ** : add tasks with a simple command , import leads with a single query

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Install additional dependencies needed for the UI components:

```bash
npm install @radix-ui/react-tabs @radix-ui/react-popover @radix-ui/react-dropdown-menu clsx tailwind-merge react-day-picker date-fns
# or
yarn add @radix-ui/react-tabs @radix-ui/react-popover @radix-ui/react-dropdown-menu clsx tailwind-merge react-day-picker date-fns
# or
pnpm add @radix-ui/react-tabs @radix-ui/react-popover @radix-ui/react-dropdown-menu clsx tailwind-merge react-day-picker date-fns
```

4. Set up your database (PostgreSQL recommended) and update the connection string in `src/db/index.ts`

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Project Structure

- `/src/app/(protected)/leads`: Lead management pages
- `/src/app/(protected)/sheets-to-leads`: Google Sheets integration
- `/src/components/leads`: Lead-related components (Kanban, Dashboard)
- `/src/components/integrations/google`: Google integration components
- `/src/db/schema.ts`: Database schema definitions

## Google Sheets Integration

To use the Google Sheets integration:

1. Go to the "Sheets to Leads" page
2. Enter your Google Sheet ID
3. Connect to the sheet
4. Use the "Add to Leads" action in the dropdown menu for any row you want to import

The first column will be used as the lead name, second as company name, third as email, and fourth as phone number.

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Drizzle ORM
- PostgreSQL
- Google Sheets API
- React DND (drag and drop)
- Recharts (for dashboard visualizations) 