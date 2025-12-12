import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import CartCheckOut from '@/components/checkouts/CartCheckOut'
import QuickCheckOut from '@/components/checkouts/QuickCheckOut'

export const Route = createFileRoute('/order/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    checkOutType: (search.checkOutType as string) || undefined,
  }),
})

function RouteComponent() {
  const search = useSearch({ from: '/order/' })
  const navigate = useNavigate()

  const { checkOutType } = search

  if (checkOutType === 'cart') {
    return <CartCheckOut />
  }

  if (checkOutType === 'quickCart') {
    return <QuickCheckOut />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-2xl font-semibold text-red-500">
        404 — Page not found
      </h2>
      <p className="text-gray-500">
        The checkout type you requested is invalid.
      </p>

      <Button onClick={() => navigate({ to: '/' })} className="mt-4">
        Go to Home
      </Button>
    </div>
  )
}
