// src/components/HomePageProducts/HomePageProducts.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import type { ApiResponse, Product } from "@/types/product.types";
import ProductCard from "./ProductCard";

const HomePageProducts: React.FC = () => {
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const res = await _axios.get("/user/products/trending");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-xl aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !data?.data?.length) {
    return (
      <section className="py-20 text-center text-gray-600">
        No products found
      </section>
    );
  }

  const products: Product[] = data.data;

  return (
    <section className="w-[90%] mx-auto mt-3 lg:mt-20">
      <div className=" mx-auto">


        <div className="grid grid-cols-2  smd:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePageProducts;