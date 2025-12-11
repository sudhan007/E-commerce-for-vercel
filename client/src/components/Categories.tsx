// src/components/Categories.tsx
import { useMatch, Link } from "@tanstack/react-router";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { _axios } from "@/lib/axios";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import { Route } from "@/routes/products";

interface Category { _id: string; name: string }

export default function Categories() {
  const match = useMatch({ from: Route.id, shouldThrow: false });

  // ← All hooks must be called unconditionally, before any early return
  const { category = "", subcategory = "" } = (match?.search ?? {}) as {
    category?: string;
    subcategory?: string;
  };

  const isSubcategoryMode = !!category;
  const parentCategory = category || undefined;

  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["categories", parentCategory],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await _axios.get("/user/categories", {
          params: { page: pageParam, limit: 15, category: parentCategory },
        });
        return res.data.categories as Category[];
      },
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length < 15 ? undefined : allPages.length + 1,
      initialPageParam: 1,
    });

  const allCategories = data?.pages.flat() ?? [];

  // Scroll restoration
  useEffect(() => {
    const saved = sessionStorage.getItem("categories-scroll");
    if (saved && scrollRef.current) {
      scrollRef.current.scrollLeft = parseInt(saved, 10);
    }
  }, []);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["categories", parentCategory] });
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    sessionStorage.removeItem("categories-scroll");
  }, [parentCategory, queryClient]);

  const handleScroll = () => {
    if (scrollRef.current) {
      sessionStorage.setItem("categories-scroll", scrollRef.current.scrollLeft.toString());
    }
  };

  // ← NOW safe to early return
  if (!match) return null;

  return (
    <div className="border-y hidden lg:flex border-gray-200 bg-[#F6FBFF] pt-2  overflow-hidden  justify-center">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-8 px-6 overflow-x-auto scrollbar-hidden whitespace-nowrap lg:max-w-[80%]"
      >
        {/* ALL */}
        <CategoryButton
          label="ALL"
          isActive={!subcategory}
          search={{ category, subcategory: undefined }}
        />

        {/* Categories */}
        {allCategories.map((cat) => (
          <CategoryButton
            key={cat._id}
            label={cat.name.toUpperCase()}
            isActive={
              isSubcategoryMode
                ? subcategory === cat.name
                : category === cat.name
            }
            search={
              isSubcategoryMode
                ? { category, subcategory: cat.name }
                : { category: cat.name, subcategory: undefined }
            }
          />
        ))}

        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          ))}

        {/* Load more */}
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-black whitespace-nowrap"
          >
            {isFetchingNextPage ? "Loading..." : "MORE"}
          </button>
        )}
      </div>
    </div>
  );
}

function CategoryButton({
  label,
  isActive,
  search,
}: {
  label: string;
  isActive: boolean;
  search: Record<string, any>;
}) {
  return (
    <Link
      to="/products"
      search={search}
      className={clsx(
        "px-6 py-2 text-sm md:text-[16px] tracking-wider transition-all duration-200 border-b-2 font-normal capitalize" ,
        isActive
          ? "text-primary border-primary "
          : "text-[#000000] border-transparent hover:text-black"
      )}
    >
      {label}
    </Link>
  );
}