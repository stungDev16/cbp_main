import FilterSection from "./section/filter/FilterSection";
import Product from "./section/product/ProductSection";

export default function HomePage() {
  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 font-sans">
          Thuê Điện Thoại Cloud
        </h1>
        <p className="text-lg text-muted-foreground">
          Chọn cấu hình phù hợp cho nhu cầu của bạn
        </p>
      </div>
        <FilterSection />
        <Product />
    </div>
  );
}
