import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { _axios } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

export const Route = createFileRoute('/wishlist/')({
  component: RouteComponent,
  // validateSearch: (search: Record<string, unknown>) => ({
  //   page: search.page ? Number(search.page) || 1 : 1,
  //   limit: 10,
  // }),
})

interface Product {
  _id: string
  brandName: string
  productName: string
  category: string
  style?: string
  primaryVariant?: any
}

function RouteComponent() {
  const navigate: any = useNavigate()
  const search: any = useSearch({ from: '/wishlist/' })
  const { page = 1 } = search
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist', { page }],
    queryFn: () =>
      _axios
        .get('/user/favorites', {
          params: {
            page,
            limit: 10,
          },
        })
        .then((r) => r.data),
    staleTime: 30_000,
  })

  const products = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="mx-auto px-4 py-8 w-[95%]">
      <h1 className="text-3xl text-primary text-center font-medium mb-4 font-jost">
        Wishlist
      </h1>
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
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products?.map((product: Product) => (
                <ProductCard key={product._id} product={product as any} />
              ))}
            </div>
          </>
        )}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12  bg-white py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() =>
              navigate({
                search: (prev: any) => ({ ...prev, page: page - 1 }),
              })
            }
            className="rounded-none w-9 h-9"
          >
            <ChevronLeft />
          </Button>

          {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
            const pageNum = i + 1
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  navigate({
                    search: (prev: any) => ({ ...prev, page: pageNum }),
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
          })}

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() =>
              navigate({
                search: (prev: any) => ({ ...prev, page: page + 1 }),
              })
            }
            className="rounded-none w-9 h-9"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}
