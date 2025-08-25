import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import AddDevice from "./button/AddDevice";
import { useDevices } from "@/context/devices/hooks/useDevices";
export default function ControlPanel() {
  const { screenScale, setScreenScale } = useDevices();
  return (
    <div className="bg-white rounded-lg shadow p-4 w-56 min-w-[200px] h-fit flex flex-col space-y-4 sticky top-0 ">
      <div className="space-y-1">
        <p className="font-medium text-sm">Tỷ lệ màn hình</p>
        <div className="flex items-center gap-3">
          <Slider onValueChange={(value) => setScreenScale(value[0])} defaultValue={[screenScale]} max={100} step={1} className="flex-1" />
          <span className="w-10 text-right text-sm text-muted-foreground">
            {screenScale}%
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-sm">Độ sáng</p>
        <div className="flex items-center gap-3">
          <Slider defaultValue={[50]} max={100} step={1} className="flex-1" />
          <span className="w-10 text-right text-sm text-muted-foreground">
            50%
          </span>
        </div>
      </div>

      <AddDevice />

      <div className="flex gap-1">
        <Button
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-500 to-emerald-700"
        >
          <Plus className="w-3 h-3" /> Xoay
        </Button>
        <Button size="sm" className="flex-1 border border-border bg-gradient-to-br from-emerald-500 to-emerald-700">
          <Plus className="w-3 h-3" /> Cài đặt
        </Button>
      </div>

      <Button size="sm" className="w-fit border border-border flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-500 to-emerald-700">
        <Plus className="w-4 h-4" /> Tiện ích
      </Button>

      <Separator className="my-2" />

      <div className="flex items-center gap-2">
        <Checkbox
          id="select-all"
          className="border-gray-300"
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          Chọn tất cả
        </label>
      </div>
    </div>
  );
}
