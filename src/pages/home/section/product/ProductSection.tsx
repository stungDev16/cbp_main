import { products } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Monitor,
  Cpu,
  HardDrive,
  Smartphone,
  Shield,
  Star,
  ShoppingCart,
  Heart,
} from "lucide-react";

export default function ProductSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border bg-card backdrop-blur-sm"
        >
          <div className="relative">
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white z-10 px-3 py-1 text-xs font-bold shadow-lg rounded-full">
              🔥 Giảm {product.sale}
            </Badge>

            <button className="absolute top-2 right-16 bg-card/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card z-10">
              <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500" />
            </button>

            <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 z-10">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold">{product.rating}</span>
            </div>

            <div className="aspect-[4/5] bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <img
                src={
                  product.image ||
                  "/placeholder.svg?height=300&width=240&query=modern smartphone"
                }
                alt={product.name}
                className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-card-foreground leading-tight group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="text-right">
                <div className="text-xl font-bold text-orange-600 font-sans">
                  {product.price}
                </div>
                <div className="text-xs text-muted-foreground">mỗi ngày</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            <div className="flex justify-between items-center mb-4 p-3 bg-muted rounded-xl">
              <div className="text-sm">
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    product.available > 0 ? "text-accent" : "text-destructive"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      product.available > 0 ? "bg-accent" : "bg-destructive"
                    }`}
                  ></div>
                  {product.available > 0
                    ? `Còn ${product.available} máy`
                    : "Hết hàng"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{product.sold}</span> đã thuê
              </div>
            </div>

            <div className="space-y-2 mb-5 p-4 bg-muted rounded-xl">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-card-foreground">
                  <Monitor className="w-3 h-3 text-primary" />
                  <span className="font-medium">
                    {product.specs.resolution}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-card-foreground">
                  <Cpu className="w-3 h-3 text-accent" />
                  <span className="font-medium">{product.specs.cpu}</span>
                </div>
                <div className="flex items-center gap-1 text-card-foreground">
                  <HardDrive className="w-3 h-3 text-purple-500" />
                  <span className="font-medium">{product.specs.ram}</span>
                </div>
                <div className="flex items-center gap-1 text-card-foreground">
                  <Smartphone className="w-3 h-3 text-orange-500" />
                  <span className="font-medium">{product.specs.android}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs pt-1 border-t border-border">
                <Shield className="w-3 h-3 text-red-500" />
                <span
                  className={`font-medium ${
                    product.specs.rooted.includes("Rooted") &&
                    !product.specs.rooted.includes("Not")
                      ? "text-red-600"
                      : "text-card-foreground"
                  }`}
                >
                  {product.specs.rooted}
                </span>
              </div>
            </div>

            {product.outOfStock ? (
              <Badge
                variant="destructive"
                className="w-full justify-center py-3 text-sm font-medium rounded-xl"
              >
                Tạm hết hàng
              </Badge>
            ) : (
              <div className="space-y-2">
                <Button className="w-full font-semibold py-3 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Thuê ngay - {product.price}
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-2 text-sm border-border hover:bg-muted rounded-xl bg-transparent"
                >
                  Xem chi tiết
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
