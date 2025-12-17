import { Button } from '@/components/ui/button'

interface ProductPreview {
  varientId: string
  images: string[]
}

interface OrderCardProps {
  orderId: string
  orderPlaced: string
  estimatedDelivery: string
  deliveryAddress: string
  products: ProductPreview[]
  orderedAmount: number
  status?: string
  onTrackOrder?: () => void
}

export function OrderCard({
  orderId,
  orderPlaced,
  estimatedDelivery,
  deliveryAddress,
  products,
  orderedAmount,
  onTrackOrder,
}: OrderCardProps) {
  const allImages = products.flatMap((p) => p.images)
  console.log(allImages, 'a')
  const displayImages = allImages.slice(0, 2)
  const extraCount = allImages.length > 2 ? allImages.length - 2 : 0
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-jost">
      <div className=" p-3 md:p-5">
        <div className="flex flex-nowrap text-nowrap md:flex-wrap gap-3   md:gap-6 text-sm text-gray-600 mb-2  md:mb-4">
          <div className="">
            <p className="text-[#828999] text-[14px] font-medium ">
              Order Placed:
            </p>
            <p className="font-normal pt-2 text-sm  md:text-base text-black">
              {orderPlaced}
            </p>
          </div>
          <div>
            <p className="text-[#828999] text-[14px] font-medium ">
              Est Delivered:
            </p>
            <p className="font-normal pt-2   text-sm  md:text-base text-black">
              {estimatedDelivery}
            </p>
          </div>
          <div className="md:flex-1 min-w-[100px] md:min-w-[200px]">
            <p className="text-[#828999] text-[14px] font-medium ">
              Deliver order to :
            </p>
            <p className="font-normal pt-2  text-sm truncate  md:text-base text-black">
              {deliveryAddress}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[#828999] text-[14px] font-normal">
              Order ID :{' '}
              <span className="font-normal  text-base text-black">
                {orderId}
              </span>
            </p>
            <Button
              onClick={onTrackOrder}
              className="bg-[#0E3051] cursor-pointer  mt-2 text-[14px] hover:bg-[#0a2442] text-white rounded-lg font-normal"
            >
              Track Order
            </Button>
          </div>
        </div>

        <hr />

        <div className="flex pt-2 items-center justify-between">
          <div className="flex items-center gap-3">
            {displayImages.map((img, i) => (
              <div
                key={i}
                className="md:w-16 md:h-16 h-12 w-12  rounded-xl border border-gray-200 overflow-hidden bg-gray-50"
              >
                <img
                  src={img || '/login-image.png'}
                  alt="product"
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
            {extraCount > 0 && (
              <div className="md:w-16 md:h-16 h-12 w-12  rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-600">
                +{extraCount}
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-[#828999] text-[12px]  md:text-[14px] font-normal">
              Ordered Amount
            </p>
            <p className="text-xl md:text-2xl font-medium pt-1  md:font-semibold text-black ">
              ₹ {orderedAmount}
            </p>
          </div>
        </div>
        <div className=" flex justify-between items-center pt-2 md:hidden">
          <p className="text-[#828999] text-[14px] font-normal">
            Order ID :{' '}
            <span className="font-medium  text-base text-black">{orderId}</span>
          </p>
          <button
            onClick={onTrackOrder}
            className="bg-primary cursor-pointer   p-1.5 text-[12px]  md:text-[14px] hover:bg-[#0a2442] text-white rounded-lg font-normal"
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  )
}
