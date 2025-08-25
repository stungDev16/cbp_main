import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchIcon } from "lucide-react";
import Action from "./action/Action";
export default function TableSection() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <Action />
      {/* Data Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Outbound IP</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Related Cloud Phone</TableHead>
              <TableHead>Proxy Information</TableHead>
              <TableHead>IP Checker</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Empty State */}
            <TableRow>
              <TableCell colSpan={9} className="h-64">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <SearchIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg font-medium">
                    No Data
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
