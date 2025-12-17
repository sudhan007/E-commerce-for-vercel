// import OrderProductList from '@/components/order/OrderProductList'
import OrderProductList from '@/components/order/OrderProductList'
import OrderTracker from '@/components/order/OrderTimeLine'
import { _axios } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'

export const Route = createFileRoute('/order/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id: orderId } = Route.useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['view-single-order', orderId],
    queryFn: async () => {
      // Note: You had a hardcoded ID here — assuming you want to use the dynamic orderId
      const res = await _axios.get(`/user/orders/${orderId}`)
      return res.data.order // API returns { success: true, order: { ... } }
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading)
    return <div className="p-8 text-center">Loading order details...</div>
  if (error || !data)
    return (
      <div className="p-8 text-center text-red-600">Failed to load order</div>
    )

  const order = data // this is the full order object from your JSON

  const orderDate = format(new Date(order.createdAt), 'MMM d, yyyy')
  const confirmedDate = order.statusTimeline.find(
    (t: any) => t.status === 'CONFIRMED',
  )?.updatedAt
  const estimatedDelivery = 'Friday, 28 Nov 2025' // You can calculate this based on logic if needed

  return (
    <div className=" bg-muted/30 p-4 md:p-6 font-jost">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <span className="text-sm font-medium text-muted-foreground">
            {order.orderId}
          </span>
        </div>

        {/* Desktop Header */}
        <div className=" hidden items-center justify-between md:flex">
          <div className="flex items-center gap-2 text-base ">
            <a href="#" className="text-primary hover:underline">
              Order History
            </a>
            <span className="text-muted-foreground">/ {order.orderId}</span>
          </div>
          <div className="flex gap-2">
            <button className="py-1.5 cursor-pointer px-4  text-primary font-normal transition rounded text-[14px] font-serif">
              Return Order
            </button>
            <button className="py-1.5 cursor-pointer px-4 text-[14px] bg-[#0E3051] font-serif text-white rounded hover:bg-[#0a2642] transition font-normal ">
              Cancel
            </button>
          </div>
        </div>
        <div className="pt-3 items-center justify-between flex">
          <div className="flex items-center gap-2 text-base">
            <div className="text-[#828999]">
              Order Placed:<span className="text-black">{orderDate}</span>
            </div>
            <span className="text-muted-foreground">|</span>
            <div className="text-[#329911] font-medium flex gap-3">
              <img src="/design-icons/delivery-truck.svg" alt="" className="" />{' '}
              Estimated Delivery: {estimatedDelivery}
            </div>
          </div>
        </div>
        <OrderTracker
          statusTimeline={order.statusTimeline}
          currentStatus={order.orderStatus}
        />

        <OrderProductList order={order} />
      </div>
    </div>
  )
}
