import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Cpu, HardDrive, Smartphone, Shield, Filter, RotateCcw } from "lucide-react"

export default function FilterSection() {
  return (
   <div className="sticky top-0 z-30">
      <div className="bg-card backdrop-blur-sm rounded-xl p-4 mb-6 border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 min-w-[140px]">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <Select>
              <SelectTrigger className="h-9 shadow border-border text-sm">
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vietnam">Việt Nam</SelectItem>
                <SelectItem value="singapore">Singapore</SelectItem>
                <SelectItem value="usa">Mỹ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 min-w-[120px]">
            <Cpu className="w-4 h-4 text-accent" />
            <Select>
              <SelectTrigger className="h-9 shadow border-border text-sm">
                <SelectValue placeholder="CPU" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="snapdragon">Snapdragon</SelectItem>
                <SelectItem value="exynos">Exynos</SelectItem>
                <SelectItem value="mediatek">MediaTek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 min-w-[110px]">
            <HardDrive className="w-4 h-4 text-purple-600" />
            <Select>
              <SelectTrigger className="h-9 shadow border-border text-sm">
                <SelectValue placeholder="RAM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3gb">3GB</SelectItem>
                <SelectItem value="6gb">6GB</SelectItem>
                <SelectItem value="8gb">8GB</SelectItem>
                <SelectItem value="12gb">12GB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 min-w-[130px]">
            <Smartphone className="w-4 h-4 text-orange-600" />
            <Select>
              <SelectTrigger className="h-9 shadow border-border text-sm">
                <SelectValue placeholder="Android" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="android9">Android 9</SelectItem>
                <SelectItem value="android10">Android 10</SelectItem>
                <SelectItem value="android11">Android 11</SelectItem>
                <SelectItem value="android13">Android 13</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 min-w-[120px]">
            <Shield className="w-4 h-4 text-red-600" />
            <Select>
              <SelectTrigger className="h-9 shadow border-border text-sm">
                <SelectValue placeholder="Root" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Có Root</SelectItem>
                <SelectItem value="no">Không Root</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="h-9 px-3 text-sm border-border hover:bg-muted bg-transparent">
              <RotateCcw className="w-4 h-4 mr-1" />
              Đặt lại
            </Button>
            <Button size="sm" className="h-9 px-4 text-sm bg-primary hover:bg-primary/90">
              <Filter className="w-4 h-4 mr-1" />
              Lọc
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
