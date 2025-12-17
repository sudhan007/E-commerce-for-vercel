import { OrderCard } from '@/components/profile/order/OrderCard'
import { OrderCardSkeleton } from '@/components/profile/order/orderSkeletion'
import { OrderTabs } from '@/components/profile/order/tabs'
import { useSessionContext } from '@/context/SessionContext'
import { _axios } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/profile/orders')({
  component: RouteComponent,
})
interface Order {
  _id: string
  orderId: string
  createdAt: string
  estimatedDeliveryTime?: string
  addressCopy: {
    flatorHouseno?: string
    area?: string
    landmark?: string
  }
  orderItems: Array<{
    productId: { _id: string }
    variantId: { _id: string; images?: [] }
  }>
  totalAmount: number
  orderStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED'
}
function RouteComponent() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('PENDING')
  const session = useSessionContext()
  console.log(activeTab, 'ac')
  // const params = new URLSearchParams()

  const { data, isLoading } = useQuery({
    queryKey: ['user-orders', session?._id, activeTab],
    queryFn: async () => {
      const res = await _axios.get(`/user/orders?status=${activeTab}`)
      return res.data
    },
    enabled: !!session?._id,
    staleTime: 5 * 60 * 1000,
  })

  const orders: Order[] = data?.orders || []

  return (
    <div className="w-full">
      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-8 space-y-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)
        ) : orders?.length > 0 ? (
          orders?.map((order) => (
            <OrderCard
              key={order._id}
              orderId={order.orderId}
              orderPlaced={new Date(order.createdAt).toDateString()}
              estimatedDelivery={
                order.estimatedDeliveryTime
                  ? new Date(order.estimatedDeliveryTime).toDateString()
                  : 'N/A'
              }
              deliveryAddress={`${order.addressCopy.flatorHouseno}, ${order.addressCopy.area}, ${order.addressCopy.landmark}`}
              products={order.orderItems.map((item) => ({
                varientId: item.variantId._id,
                images: item.variantId.images || [],
              }))}
              orderedAmount={order.totalAmount}
              status={order.orderStatus.toLowerCase() as any}
              onTrackOrder={() => {
                navigate({
                  to: `/order/${order._id}`,
                })
              }}
              onReorder={() => console.log('Reorder:', order._id)}
              onViewOrder={() => console.log('View order:', order._id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}
