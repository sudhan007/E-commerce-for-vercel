import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SessionContextProvider from '@/context/SessionContext'
import { Toaster } from '@/components/ui/sonner'
import CartContextProvider from '@/context/CartContext'
import QuickBuyContextProvider from '@/context/QuickBuy-Context'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <SessionContextProvider>
      <CartContextProvider>
        <QuickBuyContextProvider>
          <Header />
          <Outlet />
          <Footer />
          <Toaster
            position="top-right"
            duration={2000}
            toastOptions={{
              classNames: {
                toast:
                  '!flex !items-center !gap-3 !p-4 !rounded-lg !shadow-lg !border !text-sm !font-medium',
                title: '!font-semibold',
                description: '!text-muted-foreground',
                success:
                  '!bg-green-50 !dark:bg-green-950 !border-green-200 !dark:border-green-800 !text-green-800 !dark:text-green-300',
                error:
                  '!bg-red-50 !dark:bg-red-950 !border-red-200 !dark:border-red-800 !text-red-800 !dark:text-red-300',
                warning:
                  '!bg-yellow-50 !dark:bg-yellow-950 !border-yellow-200 !dark:border-yellow-800 !text-yellow-800 !dark:text-yellow-300',
                info: '!bg-blue-50 !dark:bg-blue-950 !border-blue-200 !dark:border-blue-800 !text-blue-800 !dark:text-blue-300',
                default: '!bg-card !border',
                icon: '!shrink-0',
                actionButton:
                  '!bg-primary !text-primary-foreground !hover:bg-primary/90',
                cancelButton:
                  '!bg-secondary !text-secondary-foreground !hover:bg-secondary/90',
              },
            }}
          />
        </QuickBuyContextProvider>
      </CartContextProvider>
    </SessionContextProvider>
  )
}
