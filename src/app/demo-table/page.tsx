import { DataTableDemo } from "@/components/data-table-demo";

export default function DataTableDemoPage() {
  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold tracking-tight mb-4'>
        Advanced Data Table Demo
      </h1>
      <p className='text-muted-foreground mb-8'>
        This table demonstrates advanced features including sorting, filtering,
        pagination, column visibility, row selection, bulk actions, and
        responsive design.
      </p>
      <DataTableDemo />
    </div>
  );
}
