// src/components/ProductCard/ProductCard.tsx
import React from "react";
import type { Product, PrimaryVariant } from "@/types/product.types";
import { Button } from '@/components/ui/button';
import { useNavigate } from "@tanstack/react-router";
import QuickViewModal from "./QuickViewModal";


interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

  const navigate = useNavigate()
  const [showQuickView, setShowQuickView] = React.useState(false);
  const variant: PrimaryVariant | null =
    typeof product.primaryVariant === "object" ? product.primaryVariant : null;

  if (!variant || !variant.images?.length || !variant.priceDetails) {
    return null;
  }

  const handleProductClick = () => {
    navigate({
      to: `/products/${product._id}`,
    })
  }

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickView(!showQuickView)
  }

  const { images, priceDetails } = variant;
  const { price, strikeAmount, offerPercentage } = priceDetails;

  const mrp = strikeAmount > price ? strikeAmount : priceDetails.actualPrice;
  const hasDiscount = offerPercentage > 0;

  return (
<>
    <div onClick={handleProductClick} className="group relative transition-all duration-300 w-full font-sans cursor-pointer">
      {/* Image Container */}
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
        <img
          src={images[0]!}
          alt={product.productName}
          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute hidden w-full bottom-2 md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button onClick={handleQuickViewClick} className="rounded-none w-[90%] hover:bg-primary cursor-pointer h-7 font-sans text-[14px] font-normal">
              QUICK VIEW
            </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-col gap-1 overflow-x-auto scrollbar-hidden">
        <p className="text-xs text-[#828999] font-normal capitalize">
          {product.brandName}
        </p>
        <h3 className="text-[#1F1F1F] font-normal md:font-medium capitalize md:uppercase text-xs md:text-[14px] text-justify">
          {product.productName}
        </h3>
        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="text-sm text-[#828999] font-semibold flex gap-2">
              <span className="text-[#1F1F1F] text-[14px] font-normal hidden md:inline">
                MRP
              </span>
              <span className="line-through">₹{mrp.toLocaleString("en-IN")}</span>
            </span>
          )}
          <span className="text-[#000000] font-medium text-[11px] md:text-[14px]">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <span className="text-[#E51C23] text-[11px] md:text-[14px] font-normal whitespace-nowrap">
              {offerPercentage}% OFF
            </span>
          )}
        </div>
      </div>
    </div>

{showQuickView && <QuickViewModal
  productId={product._id}
  open={showQuickView}
  onClose={() => setShowQuickView(false)}
/>}
</>
  );
};

export default ProductCard;