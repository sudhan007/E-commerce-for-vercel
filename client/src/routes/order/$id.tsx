import OrderProductList from '@/components/order/OrderProductList'
import OrderTracker from '@/components/order/OrderTimeLine'
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/order/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const orderData = {
    id: '#9778523765783',
    orderDate: 'Feb 16, 2022',
    estimatedDelivery: 'May 16, 2022',
    totalAmount: 1500,
    status: 'delivered',
    products: [
      {
        id: 1,
        name: 'XOLDAA Strawberry Fruit Seeds Seed (190 Per Packet)',
        weight: '250 g',
        price: 200,
        originalPrice: 100,
        quantity: 2,
        image: '/strawberry-seeds.jpg',
      },
      {
        id: 2,
        name: 'XOLDAA Strawberry Fruit Seeds Seed (190 Per Packet)',
        weight: '250 g',
        price: 200,
        originalPrice: 100,
        quantity: 2,
        image: '/strawberry-seeds.jpg',
      },
      {
        id: 3,
        name: 'XOLDAA Strawberry Fruit Seeds Seed (190 Per Packet)',
        weight: '250 g',
        price: 200,
        originalPrice: 100,
        quantity: 2,
        image: '/strawberry-seeds.jpg',
      },
    ],
    shippingAddress: {
      name: 'Sushmitha',
      phone: '8368559846',
      address: '12/7A Gandhi street, Vadasery, Nagercoil, Pin - 695216',
    },
    billing: {
      itemTotal: 1400,
      deliveryCharge: 100,
      totalAmount: 1500,
      paymentMode: 'GPay',
      transactionId: '#7429#pop',
    },
  }

  const orderSteps = [
    {
      title: 'Order Confirmed',
      date: 'Wed, 18th Feb',
      status: 'completed' as const,
    },
    {
      title: 'In-Progress',
      date: 'Thu, 19th Feb',
      status: 'current' as const,
    },
    {
      title: 'Out for delivery',
      date: 'Fri, 19th Feb',
      status: 'pending' as const,
    },
    {
      title: 'Delivered',
      date: 'Expected by Sat, 19th Feb',
      status: 'pending' as const,
    },
  ]

  const steps = [
    { title: 'Order Confirmed', date: 'Wed, 18th Feb', status: 'completed' },
    { title: 'In-Progress', date: 'Thu, 19th Feb', status: 'pending' },
    { title: 'Out for delivery', date: 'Fri, 19th Feb', status: 'pending' },
    {
      title: 'Delivered',
      date: 'Expected by Sat, 19th Feb',
      status: 'pending',
    },
  ]

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6 font-jost">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <span className="text-sm font-medium text-muted-foreground">
            {orderData.id}
          </span>
        </div>

        {/* Desktop Header */}
        <div className=" hidden items-center justify-between md:flex">
          <div className="flex items-center gap-2 text-base ">
            <a href="#" className="text-primary hover:underline">
              Order History
            </a>
            <span className="text-muted-foreground">/ {orderData.id}</span>
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
              Order Placed:<span className="text-black">Feb 16, 2022</span>
            </div>
            <span className="text-muted-foreground">|</span>
            <div className="text-[#329911] font-medium flex gap-3">
              <img src="/design-icons/delivery-truck.svg" alt="" className="" />{' '}
              Estimated Delivery: Friday, 28 Nov 2025
            </div>
          </div>
        </div>
        <OrderTracker />

        {/* <Card className="overflow-hidden mt-4">
          <OrderStatusTimeline status={orderData.status} />
        </Card> */}

        <OrderProductList products={orderData.products} />
        {/* <div className="border-t pt-6">
              <BillSummary billing={orderData.billing} />
            </div> */}
      </div>
    </div>
  )
}
