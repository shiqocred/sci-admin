import { ColumnDef } from '@tanstack/react-table';

export const column: ColumnDef<any>[] = [
  {
    header: () => <div className="text-center text-xs">No</div>,
    id: 'id',
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(1 + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    header: '',
    accessorKey: 'images',
    cell: '',
  },
  {
    header: () => <div className="text-xs">Product</div>,
    accessorKey: 'product',
    cell: '',
  },
  {
    header: () => <div className="text-xs">Status</div>,
    accessorKey: 'status',
    cell: '',
  },
  {
    header: () => <div className="text-xs">Stock</div>,
    accessorKey: 'stock',
    cell: '',
  },
  {
    header: () => <div className="text-xs">Category</div>,
    accessorKey: 'category',
    cell: '',
  },
  {
    header: () => <div className="text-xs">Suplier</div>,
    accessorKey: 'suplier',
    cell: '',
  },
];
