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
import React from 'react'

interface Product {
  id: number
  name: string
  weight: string
  price: number
  quantity: number
  image: string
}

interface OrderData {
  orderId: string
  shipTo: string
  receiver: string
  phone: string
  products: Product[]
  itemTotal: number
  deliveryCharge: number
  totalAmount: number
  paymentMode: string
  transactionId: string
}

export default function OrderReceipt() {
  const orderData: OrderData = {
    orderId: '#79785237657883',
    shipTo: '12/7A Gandhi street, Vadasery, Nagercoil, Pin - 695216',
    receiver: 'Sushmitha',
    phone: '8368559846',
    products: [
      {
        id: 1,
        name: 'XOLDAA Strawberry Fruit Seeds Seed (190 Per Packet)',
        weight: '250 g',
        price: 200,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop',
      },
      {
        id: 2,
        name: 'XOLDAA Strawberry Fruit Seeds Seed (190 Per Packet)',
        weight: '250 g',
        price: 200,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop',
      },
      {
        id: 3,
        name: 'XOLDAA Strawberry Fruit Seeds Seed (190 Per Packet)',
        weight: '250 g',
        price: 200,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop',
      },
      {
        id: 4,
        name: 'XOLDAA Strawberry Fruit Seeds Seed (190 Per Packet)',
        weight: '250 g',
        price: 200,
        quantity: 2,
        image:
          'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&h=200&fit=crop',
      },
    ],
    itemTotal: 1400,
    deliveryCharge: 100,
    totalAmount: 1500,
    paymentMode: 'Gpay',
    transactionId: '#T4y389op',
  }

  return (
    <div className=" bg-white mt-4 rounded-lg shadow-md">
      {/* Header Section */}
      <div className=" px-4 md:px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <span className="text-gray-600 text-sm">Ship To: </span>
            <span className="text-gray-900 text-sm">{orderData.shipTo}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600 text-sm">Order ID: </span>
            <span className="text-gray-900 text-sm font-medium">
              {orderData.orderId}
            </span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mt-2">
          <div>
            <span className="text-gray-600 text-sm">Receiver Detail: </span>
            <span className="text-gray-900 text-sm">
              {orderData.receiver}, {orderData.phone}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-600 text-sm">Total Amount: </span>
            <span className="text-gray-900 text-xl font-bold">
              ₹{orderData.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="p-4 md:p-6">
        {orderData.products.map((product, index) => (
          <div key={product.id}>
            <div className="flex items-start gap-4 py-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded"
                />
              </div>

              {/* Product Details */}
              <div className="flex-grow min-w-0">
                <h3 className="text-sm md:text-base text-gray-900 font-medium mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">{product.weight}</p>
              </div>

              {/* Price Details */}
              <div className="flex-shrink-0 text-right">
                <div className="text-sm text-gray-600 mb-1">
                  ₹{product.price}*{product.quantity}
                </div>
                <div className="text-base md:text-lg font-semibold text-gray-900">
                  ₹{product.price * product.quantity}
                </div>
              </div>
            </div>
            {index < orderData.products.length - 1 && (
              <hr className="border-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* Bill Summary Section */}
      {/* <div className="px-4 md:px-6 pb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Bill Summary</h2>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
          <div className="flex gap-8">
            <div>
              <span className="text-gray-600 text-sm">Payment Mode: </span>
              <span className="text-gray-900 text-sm font-medium">
                {orderData.paymentMode}
              </span>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Transaction ID: </span>
              <span className="text-gray-900 text-sm font-medium">
                {orderData.transactionId}
              </span>
            </div>
          </div>

          <div className="space-y-2 sm:min-w-[200px]">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Item Total</span>
              <span className="text-gray-900 font-medium">
                : ₹{orderData.itemTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Charge</span>
              <span className="text-gray-900 font-medium">
                : ₹{orderData.deliveryCharge}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-gray-900">
                : ₹{orderData.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}
