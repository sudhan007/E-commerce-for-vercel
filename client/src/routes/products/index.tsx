// src/routes/products/index.tsx
import React, { useState, useEffect, useRef } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { _axios } from '@/lib/axios'
import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  ListFilter,
  ArrowDownUp,
  Minus,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface Product {
  _id: string
  brandName: string
  productName: string
  category: string
  style?: string
  primaryVariant?: any
}

interface Brand {
  _id: string
  name: string
  productCount: number
}

interface StyleWithCount {
  name: string
  count: number
}

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || undefined,
    subcategory: (search.subcategory as string) || undefined,
    q: (search.q as string) || undefined,
    brands: search.brands
      ? Array.isArray(search.brands)
        ? (search.brands as string[])
        : [search.brands as string]
      : [],
    styles: search.styles
      ? Array.isArray(search.styles)
        ? (search.styles as string[])
        : [search.styles as string]
      : [],
    page: search.page ? Number(search.page) || 1 : 1,
    limit: 10,

    // Filter pagination & search
    brandPage: search.brandPage ? Number(search.brandPage) : 1,
    brandSearch: (search.brandSearch as string) || '',
    stylePage: search.stylePage ? Number(search.stylePage) : 1,
    styleSearch: (search.styleSearch as string) || '',
  }),
})

function ProductsPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/products/' })

  const {
    category,
    subcategory,
    q,
    brands = [],
    styles = [],
    page = 1,
    brandPage = 1,
    brandSearch: urlBrandSearch = '',
    stylePage = 1,
    styleSearch: urlStyleSearch = '',
  } = search

  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Local controlled inputs
  const [localBrandSearch, setLocalBrandSearch] = useState(urlBrandSearch)
  const [localStyleSearch, setLocalStyleSearch] = useState(urlStyleSearch)

  // Refs to track if we're currently typing (to prevent external updates)
  const isTypingBrandRef = useRef(false)
  const isTypingStyleRef = useRef(false)

  // Sync URL → local input when changed externally (e.g. back button)
  // But only if we're not actively typing
  useEffect(() => {
    if (!isTypingBrandRef.current) {
      setLocalBrandSearch(urlBrandSearch)
    }
  }, [urlBrandSearch])

  useEffect(() => {
    if (!isTypingStyleRef.current) {
      setLocalStyleSearch(urlStyleSearch)
    }
  }, [urlStyleSearch])

  // Debounced search values
  const [debouncedBrandSearch] = useDebounce(localBrandSearch, 500)
  const [debouncedStyleSearch] = useDebounce(localStyleSearch, 500)

  // Update URL when debounced value changes
  useEffect(() => {
    if (debouncedBrandSearch !== urlBrandSearch) {
      isTypingBrandRef.current = false
      navigate({
        search: (prev) => ({
          ...prev,
          brandSearch: debouncedBrandSearch || undefined,
          brandPage: 1,
        }),
        replace: true,
      })
    }
  }, [debouncedBrandSearch])

  useEffect(() => {
    if (debouncedStyleSearch !== urlStyleSearch) {
      isTypingStyleRef.current = false
      navigate({
        search: (prev) => ({
          ...prev,
          styleSearch: debouncedStyleSearch || undefined,
          stylePage: 1,
        }),
        replace: true,
      })
    }
  }, [debouncedStyleSearch])

  const [showAllBrands, setShowAllBrands] = useState(false)
  const [showAllStyles, setShowAllStyles] = useState(false)

  // Fetch Brands
  const {
    data: brandsResponse,
    isLoading: brandsLoading,
    isFetching: brandsFetching,
  } = useQuery({
    queryKey: ['brands', brandPage, debouncedBrandSearch],
    queryFn: () =>
      _axios
        .get('/user/brands', {
          params: {
            page: brandPage,
            limit: 50,
            q: debouncedBrandSearch || undefined,
          },
        })
        .then((r) => r.data),
    staleTime: 30000,
  })

  // Fetch Styles
  const {
    data: stylesResponse,
    isLoading: stylesLoading,
    isFetching: stylesFetching,
  } = useQuery({
    queryKey: ['styles', stylePage, debouncedStyleSearch],
    queryFn: () =>
      _axios
        .get('/user/products/styles', {
          params: {
            page: stylePage,
            limit: 50,
            search: debouncedStyleSearch || undefined,
          },
        })
        .then((r) => r.data),
    staleTime: 30000,
  })

  const brandsList = brandsResponse?.data || []
  const stylesList = stylesResponse?.data || []
  const brandsPagination = brandsResponse?.pagination
  const stylesPagination = stylesResponse?.pagination

  // Fetch Products
  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, subcategory, q, brands, styles, page }],
    queryFn: () =>
      _axios
        .get('/user/products', {
          params: {
            category: category || undefined,
            subcategory: subcategory || undefined,
            q: q || undefined,
            brands: brands.length ? brands : undefined,
            styles: styles.length ? styles : undefined,
            page,
            limit: 10,
          },
        })
        .then((r) => r.data),
    staleTime: 30_000,
  })

  const products = data?.data || []
  const pagination = data?.pagination

  const updateFilter = (
    key: 'brands' | 'styles',
    value: string,
    checked: boolean,
  ) => {
    const current = search[key] || []
    const newValues = checked
      ? [...current, value]
      : current.filter((v: string) => v !== value)

    navigate({
      search: (prev) => ({
        ...prev,
        [key]: newValues.length ? newValues : undefined,
        page: 1,
      }),
    })
  }

  const clearFilters = () => {
    navigate({
      search: {
        q: q || undefined, // Keep search query
        page: 1,
        brands: undefined,
        styles: undefined,
        brandPage: 1,
        stylePage: 1,
        brandSearch: undefined,
        styleSearch: undefined,
      },
      replace: true,
    })
    setLocalBrandSearch('')
    setLocalStyleSearch('')
  }

  const hasActiveFilters = brands.length > 0 || styles.length > 0

  const displayedBrands = showAllBrands ? brandsList : brandsList.slice(0, 8)
  const displayedStyles = showAllStyles ? stylesList : stylesList.slice(0, 8)

  return (
    <div className="md:max-h-screen">
      <div className="mx-auto px-4 py-8 w-[95%]">
        {/* Mobile Filter Button - Fixed at bottom */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary text-white flex items-center justify-between gap-2 shadow-lg h-13">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex gap-2 font-normal text-[16px] w-full justify-center flex-wrap"
          >
            <ArrowDownUp className="w-5 h-5" />
            Sort by
          </button>
          <Separator orientation="vertical" className="h-10" />
          <button
            onClick={() => setIsFilterOpen(true)}
            className="font-normal text-[16px] w-full justify-center"
          >
            Category
          </button>
          <Separator orientation="vertical" className="h-10" />
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex gap-2 font-normal text-[16px] w-full justify-center flex-wrap items-center"
          >
            <ListFilter />
            Filter
            {hasActiveFilters && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {brands.length + styles.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Drawer Overlay */}
        {isFilterOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-opacity-50 z-50"
            onClick={() => setIsFilterOpen(false)}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-8">
                <FilterHeader
                  pagination={pagination}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={clearFilters}
                  onClose={() => setIsFilterOpen(false)}
                />
                <BrandsFilter
                  brands={brands}
                  brandsList={displayedBrands}
                  localBrandSearch={localBrandSearch}
                  setLocalBrandSearch={setLocalBrandSearch}
                  isTypingBrandRef={isTypingBrandRef}
                  brandsFetching={brandsFetching}
                  updateFilter={updateFilter}
                  showAllBrands={showAllBrands}
                  setShowAllBrands={setShowAllBrands}
                  brandsPagination={brandsPagination}
                  brandPage={brandPage}
                  navigate={navigate}
                  allBrandsList={brandsList}
                />
                <StylesFilter
                  styles={styles}
                  stylesList={displayedStyles}
                  localStyleSearch={localStyleSearch}
                  setLocalStyleSearch={setLocalStyleSearch}
                  isTypingStyleRef={isTypingStyleRef}
                  stylesFetching={stylesFetching}
                  updateFilter={updateFilter}
                  showAllStyles={showAllStyles}
                  setShowAllStyles={setShowAllStyles}
                  stylesPagination={stylesPagination}
                  stylePage={stylePage}
                  navigate={navigate}
                  allStylesList={stylesList}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {/* Desktop Filters Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <FilterHeader
              pagination={pagination}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onClose={() => setIsFilterOpen(false)}
            />
            <BrandsFilter
              brands={brands}
              brandsList={displayedBrands}
              localBrandSearch={localBrandSearch}
              setLocalBrandSearch={setLocalBrandSearch}
              isTypingBrandRef={isTypingBrandRef}
              brandsFetching={brandsFetching}
              updateFilter={updateFilter}
              showAllBrands={showAllBrands}
              setShowAllBrands={setShowAllBrands}
              brandsPagination={brandsPagination}
              brandPage={brandPage}
              navigate={navigate}
              allBrandsList={brandsList}
            />
            <StylesFilter
              styles={styles}
              stylesList={displayedStyles}
              localStyleSearch={localStyleSearch}
              setLocalStyleSearch={setLocalStyleSearch}
              isTypingStyleRef={isTypingStyleRef}
              stylesFetching={stylesFetching}
              updateFilter={updateFilter}
              showAllStyles={showAllStyles}
              setShowAllStyles={setShowAllStyles}
              stylesPagination={stylesPagination}
              stylePage={stylePage}
              navigate={navigate}
              allStylesList={stylesList}
            />
          </aside>

          {/* Product Grid */}
          <div className="col-span-full lg:col-span-3 xl:col-span-4 2xl:col-span-5 md:max-h-screen overflow-auto scrollbar-hidden pb-20 lg:pb-0">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-none aspect-[3/4] animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-2">No products found</p>
                {q && (
                  <p className="text-sm text-gray-400">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {products.map((product: Product) => (
                    <ProductCard key={product._id} product={product as any} />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12 sticky bottom-4 bg-white py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrev}
                      onClick={() =>
                        navigate({
                          search: (prev) => ({ ...prev, page: page - 1 }),
                        })
                      }
                      className="rounded-none w-9 h-9"
                    >
                      <ChevronLeft />
                    </Button>

                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              navigate({
                                search: (prev) => ({ ...prev, page: pageNum }),
                              })
                            }
                            className={`rounded-none w-9 h-9 ${
                              page === pageNum
                                ? 'bg-[#828999] text-white hover:bg-[#828999]'
                                : 'bg-[#E8E8E8] text-[#828999] hover:bg-[#E8E8E8]'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        )
                      },
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNext}
                      onClick={() =>
                        navigate({
                          search: (prev) => ({ ...prev, page: page + 1 }),
                        })
                      }
                      className="rounded-none w-9 h-9"
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter Header Component
function FilterHeader({
  pagination,
  hasActiveFilters,
  onClearFilters,
  onClose,
}: any) {
  return (
    <div className="flex justify-between items-center border-b pb-3">
      <div>
        <h1 className="text-[18px] font-medium uppercase">FILTERS</h1>
        <p className="text-sm text-gray-600 mt-1">
          {pagination ? `${pagination.total} Products` : 'Loading...'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:underline hidden lg:block"
          >
            Clear All
          </button>
        )}
        <button onClick={onClose} className="lg:hidden">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

// Brands Filter Component
function BrandsFilter({
  brands,
  brandsList,
  localBrandSearch,
  setLocalBrandSearch,
  isTypingBrandRef,
  brandsFetching,
  updateFilter,
  showAllBrands,
  setShowAllBrands,
  brandsPagination,
  brandPage,
  navigate,
  allBrandsList,
}: any) {
  return (
    <div className="bg-white">
      <div className="flex justify-between items-center ">
        <h3 className="font-medium text-[16px]  ">Brands</h3>
        {/* <span className=""> <Minus /> </span> */}
      </div>
      <div className="mt-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          <Input
            placeholder="Search brands..."
            value={localBrandSearch}
            onChange={(e) => {
              isTypingBrandRef.current = true
              setLocalBrandSearch(e.target.value)
            }}
            onBlur={() => {
              isTypingBrandRef.current = false
            }}
            className="w-full rounded-none shadow-none outline-none ring-0 ring-offset-0
                       focus:outline-none focus:ring-0 focus:ring-offset-0
                       focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
                       focus:border-b-2 focus:border-primary"
          />
        </div>

        <div className="mt-4 space-y-3 max-h-80 overflow-y-auto scrollbar-hidden">
          {brandsFetching ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
                  <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : brandsList.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No brands found
            </p>
          ) : (
            brandsList.map((brand: Brand) => (
              <Label
                key={brand._id}
                className="flex items-center gap-3 cursor-pointer hover:text-primary text-sm"
              >
                <Checkbox
                  checked={brands.includes(brand.name)}
                  onCheckedChange={(checked: boolean) =>
                    updateFilter('brands', brand.name, checked)
                  }
                  className="rounded-none border-[#1F1F1F] data-[state=checked]:bg-primary data-[state=checked]:border-none"
                />
                <span className="flex-1 text-[#1F1F1F] font-normal">
                  {brand.name}
                </span>
                <span className="text-xs text-[#1F1F1F] bg-gray-200 px-2 py-0.5 rounded-full">
                  {brand.productCount}
                </span>
              </Label>
            ))
          )}
        </div>

        {allBrandsList.length > 8 &&
          !showAllBrands &&
          (!brandsPagination || brandsPagination.totalPages === 1) && (
            <button
              onClick={() => setShowAllBrands(true)}
              className="text-sm text-[#1F1F1F] underline flex items-center gap-1 mt-4"
            >
              See all {allBrandsList.length} <ChevronDown className="w-4 h-4" />
            </button>
          )}

        {brandsPagination && brandsPagination.totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-6 text-sm">
            <button
              disabled={!brandsPagination.hasPrev}
              onClick={() =>
                navigate({
                  search: (p) => ({ ...p, brandPage: brandPage - 1 }),
                })
              }
              className="disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              {brandPage} / {brandsPagination.totalPages}
            </span>
            <button
              disabled={!brandsPagination.hasNext}
              onClick={() =>
                navigate({
                  search: (p) => ({ ...p, brandPage: brandPage + 1 }),
                })
              }
              className="disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Styles Filter Component
function StylesFilter({
  styles,
  stylesList,
  localStyleSearch,
  setLocalStyleSearch,
  isTypingStyleRef,
  stylesFetching,
  updateFilter,
  showAllStyles,
  setShowAllStyles,
  stylesPagination,
  stylePage,
  navigate,
  allStylesList,
}: any) {
  return (
    <div className="bg-white border-t pt-6">
      <h3 className="font-medium text-[16px] mb-4">Style</h3>
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        <Input
          placeholder="Search styles..."
          value={localStyleSearch}
          onChange={(e) => {
            isTypingStyleRef.current = true
            setLocalStyleSearch(e.target.value)
          }}
          onBlur={() => {
            isTypingStyleRef.current = false
          }}
          className="w-full rounded-none shadow-none outline-none ring-0 ring-offset-0
                     focus:outline-none focus:ring-0 focus:ring-offset-0
                     focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
                     focus:border-b-2 focus:border-primary"
        />
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hidden">
        {stylesFetching ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
                <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : stylesList.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No styles found
          </p>
        ) : (
          stylesList.map(({ name: style, count }) => (
            <Label
              key={style}
              className="flex items-center gap-3 cursor-pointer hover:text-primary text-sm"
            >
              <Checkbox
                checked={styles.includes(style)}
                onCheckedChange={(checked: boolean) =>
                  updateFilter('styles', style, checked)
                }
                className="rounded-none border-[#1F1F1F] data-[state=checked]:bg-primary data-[state=checked]:border-none"
              />
              <span className="flex-1 text-[#1F1F1F] font-normal capitalize">
                {style.toLowerCase()}
              </span>
              <span className="text-xs text-[#1F1F1F] bg-gray-200 px-2 py-0.5 rounded-full">
                {count}
              </span>
            </Label>
          ))
        )}
      </div>

      {allStylesList.length > 8 &&
        !showAllStyles &&
        (!stylesPagination || stylesPagination.totalPages === 1) && (
          <button
            onClick={() => setShowAllStyles(true)}
            className="text-sm text-[#1F1F1F] underline flex items-center gap-1 mt-4"
          >
            See all {allStylesList.length} <ChevronDown className="w-4 h-4" />
          </button>
        )}

      {stylesPagination && stylesPagination.totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6 text-sm">
          <button
            disabled={!stylesPagination.hasPrev}
            onClick={() =>
              navigate({ search: (p) => ({ ...p, stylePage: stylePage - 1 }) })
            }
            className="disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            {stylePage} / {stylesPagination.totalPages}
          </span>
          <button
            disabled={!stylesPagination.hasNext}
            onClick={() =>
              navigate({ search: (p) => ({ ...p, stylePage: stylePage + 1 }) })
            }
            className="disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
