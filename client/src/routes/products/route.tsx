import Categories from '@/components/Categories'
import QuickBuyDrawer from '@/components/QuickBuyDrawer'
import { useQuickBuyContext } from '@/context/QuickBuy-Context'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  component: RouteComponent,
})

function RouteComponent() {
  const quickBuy = useQuickBuyContext()
  const { isQuickBuyOpen, setQuickBuyOpen, quickBuyProduct } = quickBuy
  return (
    <div>
      <Categories />
      <Outlet />
      {
        <QuickBuyDrawer
          isOpen={isQuickBuyOpen}
          onClose={() => setQuickBuyOpen(false)}
          product={quickBuyProduct}
        />
      }
    </div>
  )
}
