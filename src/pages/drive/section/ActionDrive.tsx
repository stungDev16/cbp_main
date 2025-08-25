import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Copy, HardDrive, RefreshCw, Search, UploadIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SettingButton from "@/pages/proxies/section/table/action/SettingButton";
  const files = [
    {
      id: "1",
      fileName: "Facebook_517.0.0.70.92_APKPu...",
      originalFileName: "Facebook_517.0.0.70.92_APKPu...",
      fileType: "App",
      fileSize: "143.78MB",
    },
  ]
export default function ActionDrive() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-[250px] border border-border rounded-lg bg-card">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search by Name or IP" className="pl-10 pr-10" />
          </div>
          <Select>
            <SelectTrigger className="w-[120px] border border-border rounded-lg bg-card">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button size="sm">Upload</Button>
          <Button size="sm" variant={"outline"}>
            Export
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <SettingButton />
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-blue-600">
          143.78MB / 5GB(Free Storage 5GB)
        </div>
        <Button
          variant="ghost"
          className="text-orange-500 hover:text-orange-600 "
        >
          Change Plan
        </Button>
      </div>

      {/* Files Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Original File Name</TableHead>
              <TableHead>File Type</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead className="w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length > 0 ? (
              files.map((file) => (
                <TableRow key={file.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium">{file.fileName}</TableCell>
                  <TableCell className="text-gray-600">
                    {file.originalFileName}
                  </TableCell>
                  <TableCell>{file.fileType}</TableCell>
                  <TableCell>{file.fileSize}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <UploadIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <HardDrive className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No files found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
