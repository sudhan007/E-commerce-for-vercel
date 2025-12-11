// src/components/RecommendedProperties/RecommendedProperties.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import type { ApiResponse, Product } from "@/types/product.types";
import ProductCard from "@/components/ProductCard"; // adjust path if needed

interface RecommendedPropertiesProps {
  keywords: string[]; // e.g. ["floral", "summer", "cotton"]
  title?: string;
  limit?: number;
}

const RecommendedProperties: React.FC<RecommendedPropertiesProps> = ({
  keywords,
  title = "Recommended for You",
  limit = 20,
}) => {
  const queryKey = ["recommended-products", keywords, limit];

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey,
    queryFn: async () => {
      const res = await _axios.get("/user/products/recommended", {
        params: {
          keyword: keywords, // axios will serialize array correctly
          limit,
          page: 1,
        },
      });
      return res.data;
    },
    enabled: keywords.length > 0, // only run if keywords exist
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const products: Product[] = data?.data || [];

  // Loading Skeleton
  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">{title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 border-2 border-dashed rounded-xl aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No results
  if (error || products.length === 0) {
    return null; // or show a subtle message
    // return <div className="text-center py-10 text-gray-500">No recommendations yet</div>;
  }

  return (
    <section className="w-[90%] mx-auto py-12 lg:py-20">
      <div className=" mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#000000]  text-center">
          {title}
        </h2>

        <div className="grid grid-cols-2 smd:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProperties;