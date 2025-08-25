import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Smartphone,
  Grid3X3,
  Pause,
  ChevronDown,
  ArrowUpDown,
  RefreshCw,
  ChevronUp,
} from "lucide-react";
export default function CloudPhonePage() {
  const [selectedCount, setSelectedCount] = useState(0);
  console.log(setSelectedCount);
  return (
    <div className="w-full mx-auto">
      <div>
        <div className="flex items-center justify-between translate-y-2 relative z-0">
          <div className="flex items-center bg-white flex-wrap gap-2 p-2 px-2.5 pb-4 h-fit w-fit rounded-t-xl">
            <Button className="text-white w-10 h-10 p-0">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-10 h-10 p-0 bg-transparent">
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="pointer-events-none h-10 bg-transparent"
            >
              Đã chọn: {selectedCount}
            </Button>

            <Button variant="secondary" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Điều khiển đồng bộ
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white flex">
              <Smartphone className="w-4 h-4" />
              Gia hạn
            </Button>
          </div>

          <div className="flex items-center bg-white flex-wrap gap-2 p-2 px-2.5 pb-4 h-fit w-fit rounded-t-xl">
            <Button variant="destructive" className="w-10 h-10 p-0">
              <Pause className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                  Tiện ích
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Tiện ích 1</DropdownMenuItem>
                <DropdownMenuItem>Tiện ích 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Card className="bg-white relative z-10 pt-0 border-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      N...
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Tên
                        <div className="flex flex-col">
                          <ChevronUp className="w-3 h-3 text-gray-400" />
                          <ChevronDown className="w-3 h-3 text-gray-400 -mt-1" />
                        </div>
                      </div>
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      Serial
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Hành động
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Gói
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Online
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Proxy
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        Proxy
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      Ghi chú
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-1">
                        OS Version
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">
                      #
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={12} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Smartphone className="w-8 h-8 text-gray-400" />
                        </div>
                        <span className="text-gray-500">No data</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
