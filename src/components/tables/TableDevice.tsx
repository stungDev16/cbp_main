/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table"
import {
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState, useMemo } from "react";
import { useDevices } from "@/context/devices/hooks/useDevices";
import { streamingService } from "@/apis/services/stream/streaming-service"

export type Device = {
    id: string | number;
    name: string;
    seri: string;
    status: "active" | "inactive";
    expiration_date: string;
    [key: string]: unknown;
};

const useDeviceColumns = () => useMemo<ColumnDef<Device>[]>(() => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="border-gray-200"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="border-gray-200"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div>{row.original.id}</div>,
    },
    {
        accessorKey: "name",
        header: "Tên thiết bị",
        cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
        accessorKey: "seri",
        header: "Seri",
        cell: ({ row }) => <div>{row.original.seri}</div>,
    },
    {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
            <span
                className={
                    row.original.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                }
            >
                {row.original.status === "active" ? "Active" : "Inactive"}
            </span>
        ),
    },
    {
        accessorKey: "expiration_date",
        header: "Ngày hết hạn",
        cell: ({ row }) => <div>{row.original.expiration_date}</div>,
    },
], []);


export function TableDevice() {
    const { setSelectedDevices, selectedDevices, data } = useDevices()
    const tableData: Device[] = useMemo(() => {
        const all = data?.map((d: any) => ({
            id: d.id,
            name: d.name,
            seri: d.serial_number,
            status: d.status === 1 ? "active" : "inactive",
            expiration_date: d.expiration_date,
            ...d
        })) || [];
        if (!selectedDevices?.length) return all;
        const selectedIds = new Set(selectedDevices.map(d => d.id));
        return all.filter(d => !selectedIds.has(d.id));
    }, [data, selectedDevices]);

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

    const columns = useDeviceColumns();
    const table = useReactTable({
        data: tableData,
        columns,
        getRowId: row => String(row.id),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <>
            <DialogHeader>
                <DialogTitle>Danh sách thiết bị</DialogTitle>
                <DialogDescription />
            </DialogHeader>
            <div className="w-full">
                <div className="flex items-center py-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                    </Table>
                    <div style={{ maxHeight: 380, overflowY: "auto" }}>
                        <Table>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="text-muted-foreground flex-1 text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    {/* Đã bỏ nút phân trang */}
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                    disabled={!table.getSelectedRowModel().rows.length}
                    onClick={async () => {
                        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
                        const { data } = await streamingService.start_streaming({ order_id: "33" });
                        console.log(data);
                        console.log(JSON.parse(data?.metadata?.encoders));
                        setSelectedDevices(selectedRows);
                        setRowSelection({});
                    }}
                >
                    Add
                </Button>
            </DialogFooter>
        </>

    )
}
