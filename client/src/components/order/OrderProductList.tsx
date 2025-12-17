// interface Product {
//   id: number
//   name: string
//   weight: string
//   price: number
//   originalPrice: number
//   quantity: number
//   image: string
// }

// export default function OrderProductList({
//   products,
// }: {
//   products: Product[]
// }) {
//   return (
//     <div className="space-y-3">
//       {/* Mobile List */}
//       <div className="block md:hidden space-y-3">
//         {products.map((product) => (
//           <div
//             key={product.id}
//             className="flex gap-3 rounded-lg bg-muted/30 p-3"
//           >
//             <img
//               src={product.image || '/placeholder.svg'}
//               alt={product.name}
//               width={80}
//               height={80}
//               className="h-20 w-20 rounded object-cover"
//             />
//             <div className="flex-1">
//               <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
//               <p className="text-xs text-muted-foreground">{product.weight}</p>
//               <div className="mt-2 flex items-end justify-between">
//                 <div className="space-y-1">
//                   <p className="text-xs text-muted-foreground line-through">
//                     ₹{product.originalPrice}×{product.quantity}
//                   </p>
//                   <p className="font-semibold">₹{product.price}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Desktop Table */}
//       <div className="hidden md:block overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b">
//               <th className="px-4 py-2 text-left font-medium">Product</th>
//               <th className="px-4 py-2 text-right font-medium">
//                 Original Price
//               </th>
//               <th className="px-4 py-2 text-right font-medium">Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((product) => (
//               <tr key={product.id} className="border-b">
//                 <td className="px-4 py-3">
//                   <div className="flex gap-3">
//                     <img
//                       src={product.image || '/placeholder.svg'}
//                       alt={product.name}
//                       width={64}
//                       height={64}
//                       className="h-16 w-16 rounded object-cover"
//                     />
//                     <div>
//                       <p className="font-medium line-clamp-2">{product.name}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {product.weight}
//                       </p>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 text-right text-muted-foreground">
//                   ₹{product.originalPrice}×{product.quantity}
//                 </td>
//                 <td className="px-4 py-3 text-right font-semibold">
//                   ₹{product.price}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// OrderReceipt.tsx
interface Product {
  productId: {
    _id: string
    productName: string
  }
  variantId: {
    _id: string
    priceDetails: {
      price: number
      strikeAmount?: number
    }
    images: string[]
  }
  quantity: number
  priceAtPurchase: number
  _id: string
}
interface OrderReceiptProps {
  order: {
    orderId: string
    orderItems: Product[]
    totalAmount: number
    productsTotalAmount: number
    taxAmount: number
    deliveryCharge: number
    paymentMethod: string
    addressCopy: {
      receiverName: string
      reciverMobile: string
      addressType: string
      flatorHouseno: string
      area: string
      landmark: string
    }
  }
}
export default function OrderReceipt({ order }: OrderReceiptProps) {
  const fullAddress = `${order.addressCopy.flatorHouseno}, ${order.addressCopy.area}, ${order.addressCopy.landmark}`

  return (
    <div className=" bg-white mt-4 rounded-lg shadow-md">
      {/* Header Section */}
      <div className=" px-4 md:px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <span className="text-gray-600 text-sm">Ship To: </span>
            <span className="text-gray-900 text-sm">{fullAddress}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600 text-sm">Order ID: </span>
            <span className="text-gray-900 text-sm font-medium">
              {order.orderId}
            </span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mt-2">
          <div>
            <span className="text-gray-600 text-sm">Receiver Detail: </span>
            <span className="text-gray-900 text-sm">
              {order.addressCopy.receiverName},{' '}
              {order.addressCopy.reciverMobile}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-600 text-sm">Total Amount: </span>
            <span className="text-gray-900 text-xl font-bold">
              ₹{order?.totalAmount?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="p-4 md:p-6">
        {order.orderItems.map((item) => (
          <div
            key={item._id}
            className="flex gap-4 pb-6 border-b border-gray-100 last:border-0"
          >
            <div className="flex-shrink-0">
              <img
                src={item.variantId.images[0] || '/placeholder.svg'}
                alt="Product"
                width={80}
                height={80}
                className="rounded-md object-cover w-16 h-16 sm:w-20 sm:h-20"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 leading-snug mb-2">
                {item.productId.productName}
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-8 flex-shrink-0">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                ₹ {item.priceAtPurchase}*{item.quantity}
              </span>
              <span className="text-base font-semibold text-gray-900 whitespace-nowrap">
                ₹ {(item.priceAtPurchase * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary Section */}

      <div className="px-4 sm:px-6 md:px-8 py-6 border-t border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bill Summary
        </h2>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex gap-2">
              <span className="text-sm text-gray-600">Payment Mode :</span>
              <span className="text-sm text-gray-900 font-medium">
                {order.paymentMethod}
              </span>
            </div>
            {/* <div className="flex gap-2">
              <span className="text-sm text-gray-600">Transaction ID :</span>
              <span className="text-sm text-gray-900 font-medium">
                {orderData.transactionId}
              </span>
            </div> */}
          </div>

          <div className="space-y-2 sm:text-right">
            <div className="flex justify-between sm:justify-end gap-4 sm:gap-8">
              <span className="text-sm text-gray-600">Item Total</span>
              <span className="text-sm text-gray-600  hidden md:block">:</span>
              <span className="text-sm text-gray-900 font-medium min-w-20 text-right">
                ₹{order?.productsTotalAmount?.toFixed(2) ?? 0}
              </span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4 sm:gap-8">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm text-gray-600 hidden md:block">:</span>
              <span className="text-sm text-gray-900 font-medium min-w-20 text-right">
                ₹{order?.taxAmount?.toFixed(2) ?? 0}
              </span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4 sm:gap-8">
              <span className="text-sm text-gray-600">Delivery Charge</span>
              <span className="text-sm text-gray-600 hidden md:block">:</span>
              <span className="text-sm text-gray-900 font-medium min-w-20 text-right">
                ₹{order?.deliveryCharge?.toFixed(2) ?? 0}
              </span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4 sm:gap-8 pt-2 ">
              <span className="text-base font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-base font-semibold text-gray-900 hidden md:block">
                :
              </span>
              <span className="text-base font-semibold text-gray-900 min-w-[80px] text-right">
                ₹{order?.totalAmount?.toFixed(2) ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
