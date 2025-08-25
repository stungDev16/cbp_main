import { useSelector } from "react-redux";

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
import { useState, useMemo, useCallback } from "react";
import type { RootState } from "@/store";
import { useDevices } from "@/context/devices/hooks/useDevices";

export type Device = {
    id: string
    seri: string
    status: "active" | "inactive"
    desc: string
}

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
        accessorKey: "seri",
        header: "Seri",
        cell: ({ row }) => <div>{row.original.seri}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span
                className={
                    row.original.status === "active"
                        ? "text-green-600"
                        : row.original.status === "inactive"
                            ? "text-yellow-600"
                            : "text-red-600"
                }
            >
                {row.original.status}
            </span>
        ),
    },
    {
        accessorKey: "desc",
        header: "Mô tả",
        cell: ({ row }) => <div>{row.original.desc}</div>,
    },
], []);


export function TableDevice() {
    const { setSelectedDevices, selectedDevices } = useDevices()
    const { devices } = useSelector((state: RootState) => state.adb);
    // Chuyển đổi dữ liệu sang dạng Device cho bảng, dùng useMemo để tối ưu
    const tableData: Device[] = useMemo(() => {
        const all = devices?.map((d) => ({
            id: d.serial,
            seri: d.serial,
            status: d.displays && d.displays.length > 0 ? "active" : "inactive",
            desc: `Có ${d.encoders?.length || 0} encoder, độ phân giải: ${d.displays && d.displays.length > 0 ? d.displays[0].resolution : 'N/A'}`,
            ...d
        })) || [];
        if (!selectedDevices?.length) return all;
        const selectedIds = new Set(selectedDevices.map(d => d.id));
        return all.filter(d => !selectedIds.has(d.id));
    }, [devices, selectedDevices]);

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

    const columns = useDeviceColumns();
    const table = useReactTable({
        data: tableData,
        columns,
        getRowId: row => row.id, // Đảm bảo rowSelection hoạt động đúng với id là serial
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
                    onClick={() => {
                        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
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
