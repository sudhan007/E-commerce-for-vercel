/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { _axios } from '@/lib/axios'
import AddressDrawer from './AddressDrawer'
import { useSessionContext } from '@/context/SessionContext'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'

import type { QuickBuyProduct } from '@/context/QuickBuy-Context'

interface availableSizes {
  size: string
  _id: string
}

interface CartItem {
  _id: string
  userId: string
  productId: {
    _id: string
    brandName: string
    productName: string
    pattern: string
    gst?: number
  }
  variantId?: {
    _id: string
    priceDetails?: {
      price: number
      strikeAmount: number
    }
    size: string
    color: string
    images: string[]
  }
  quantity: number
  availableSizes: availableSizes[]
}

interface CartTotals {
  subtotal: number
  tax: number
  totalPrice: number
  deliveryCharge: number
}

interface Address {
  _id: string
  receiverName: string
  receiverMobile: string
  flatorHouseno: string
  area: string
  landmark?: string
  addressType: string
  isPrimaryAddress: boolean
}

type QuickBuyDrawerProps = {
  isOpen: boolean
  onClose: () => void
  product?: QuickBuyProduct | null
}

const QuickBuyDrawer: React.FC<QuickBuyDrawerProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false)
  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list')
  const session = useSessionContext()
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    tax: 0,
    totalPrice: 0,
    deliveryCharge: 0,
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['quick-buy-order'],
    mutationFn: async () => {
      return await _axios.post('/user/orders/quick-buy', {
        deliveryAddressId: address?._id,
        productId: product?.productId,
        variantId: product?.variantId,
        quantity: product?.quantity,
        totalAmount: totals.totalPrice,
      })
    },
    onSuccess: () => {
      onClose()
      toast.success('Order placed successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to place order')
    },
  })

  const handlePlaceOrder = () => {
    if (!address) {
      toast.error('Please add a delivery address')
      setAddressDrawerOpen(true)
      return
    }
    mutate()
  }

  const { data: address } = useQuery<Address>({
    queryKey: ['user-address', session?._id],
    queryFn: () =>
      _axios.get(`/user/address/${session?._id}`).then((res) => res.data.data),
    enabled: !!session?._id && isOpen,
    staleTime: 5 * 60 * 1000,
  })
  useEffect(() => {
    if (!product) {
      setTotals({
        subtotal: 0,
        tax: 0,
        totalPrice: 0,
        deliveryCharge: 0,
      })
      return
    }

    const subtotal = product.price * product.quantity
    const deliveryCharge = 0
    const tax = 0
    const totalPrice = subtotal + deliveryCharge + tax

    setTotals({
      subtotal,
      tax,
      totalPrice,
      deliveryCharge,
    })
  }, [product])
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const renderCartItems = () => (
    <div className="divide-y divide-gray-100">
      <div className="flex p-4 gap-3 relative">
        <img
          src={product?.image || '/placeholder.jpg'}
          alt={product?.productName}
          className="w-[110px] h-[117px] md:h-[125px] object-contain"
          onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
        />

        <div className="flex flex-col ">
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Brand Name */}
            <div>
              <div className="font-normal text-[12px] text-[#828999] mb-0.5 capitalize tracking-wide">
                {product?.brandName}
              </div>

              {/* Product Name */}
              <div className="text-xs md:text-[15px] uppercase font-medium text-[#000000] line-clamp-2 leading-tight mb-2">
                {product?.productName}
              </div>

              {/* Size and Quantity Row */}
              {/* <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center  max-h-6 bg-[#F1F3F5]">
                  <span className="text-[#828999] text-[11px] max-h-6 pl-2 bg-[#F1F3F5] shadow-none">
                    Size
                  </span>
                  <Select
                    value={item.variantId?._id}
                    onValueChange={(value) => handleSizeChange(item, value)}
                    disabled={isItemLoading}
                  >
                    <SelectTrigger className=" text-[14px] border-none max-h-6 bg-[#F1F3F5] shadow-none text-[#000000] w-auto">
                      <SelectValue>{item.variantId?.size}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {item.availableSizes?.map((sizeOption) => (
                        <SelectItem
                          key={sizeOption._id}
                          value={sizeOption._id}
                          className="text-[11px]"
                        >
                          {sizeOption.size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center rounded-[4px]  max-h-6 bg-[#F1F3F5]">
                      <span className="text-[#828999] text-[11px] max-h-6 pl-2 bg-[#F1F3F5] shadow-none">
                        Qty
                      </span>
                      <Select
                        value={item.quantity.toString()}
                        onValueChange={(value) =>
                          handleQuantityChange(item, parseInt(value))
                        }
                        disabled={isItemLoading}
                      >
                        <SelectTrigger className="text-[14px] border-none max-h-6 bg-[#F1F3F5] shadow-none text-[#000000] w-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem
                              key={num}
                              value={num.toString()}
                              className="text-[11px]"
                            >
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
              </div> */}
            </div>

            {/* Price at bottom left */}
          </div>

          {/* Total Price - Bottom Right */}
          <div className="flex items-center justify-between h-full">
            <div className="text-xs  text-[#828999] font-medium ">
              ₹{product?.price ?? 0}
            </div>
            <div className="text-sm font-semibold text-gray-900 ">
              <span className="text-[#828999] text-[16px] font-medium">
                Total:
              </span>{' '}
              ₹{((product?.price ?? 0) * product?.quantity)?.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {product && (
        <div className="border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <h3 className=" text-[20px] font-semibold text-[#1F1F1F] mb-3">
              Bill Summary
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[16px] md:text-[20px] font-normal text-[#828999]">
                  Item Total
                </span>
                <span className="text-[16px] md:text-[20px] font-normal text-[#000000]">
                  ₹{totals.subtotal.toFixed(0)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[16px] md:text-[20px] text-[#828999] font-normal">
                  Delivery Charge
                </span>
                <span className="text-[16px] md:text-[20px] font-normal text-[#000000]">
                  ₹{totals.deliveryCharge}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-[18px] md:text-[22px] font-semibold text-[#828999] ">
                    Total Amount
                  </span>
                  <span className="text-[18px] md:text-[22px] font-semibold text-[#000000] ">
                    ₹{totals.totalPrice.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Drawer */}
      <div
        className={`
          fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out
          top-0 right-0 w-full md:w-[400px] h-full
          hidden md:block
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-[24px] font-medium text-[#000000]">Basket</h2>
              <button
                onClick={onClose}
                className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
                aria-label="Close cart"
              >
                <X className="text-[#000000] cursor-pointer" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* {loading && cartItems.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Loading cart...
              </div>
            )}
            {error && (
              <div className="p-4 text-red-600 text-center">{error}</div>
            )}
            {!loading && !error && cartItems.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-2">Add some amazing products!</p>
              </div>
            )} */}
            {renderCartItems()}
          </div>

          {/* Address Section */}
          <div className="pb-1">
            <div className="flex items-start bg-[#F6FBFF] justify-between py-3 px-6 ">
              <div className="flex-1 min-w-0">
                <div className="text-[16px] text-[#828999] font-medium mb-0.5">
                  {address?.receiverName || 'No address selected'},{' '}
                  {address?.receiverMobile || ''}
                </div>
                {address && (
                  <div className="text-[14px] font-sans text-[#000000] font-light line-clamp-2">
                    {address.flatorHouseno}, {address.area}
                    {address.landmark ? `, ${address.landmark}` : ''}
                  </div>
                )}
              </div>
              <button
                onClick={() => setAddressDrawerOpen(true)}
                className="text-sm  text-primary font-medium md:text-[18px] ml-3 shrink-0"
              >
                {address?.isPrimaryAddress ? 'Change' : 'Add Address'}
              </button>
            </div>
          </div>

          {/* Bill Summary */}

          <div className="flex p-5 gap-4">
            <div className="">
              <span className="text-xs whitespace-nowrap font-normal text-primary">
                View Bill
              </span>
            </div>
            <button
              className="w-full h-[50px] bg-primary hover:bg-primary text-center  justify-center text-white py-3 rounded font-medium text-sm transition-colors flex items-center  px-4"
              onClick={handlePlaceOrder}
            >
              <span className="font-semibold flex items-center gap-2">
                {isPending ? (
                  <div className="flex items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-wh" />
                  </div>
                ) : (
                  <span className="w-full h-[50px] bg-primary hover:bg-primary text-center justify-center text-white py-3 rounded font-medium text-sm transition-colors flex items-center px-4">
                    Place Order (₹{totals.totalPrice.toFixed(0)})
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full Screen */}
      <div
        className={`
          fixed inset-0 z-50 bg-white flex flex-col
          transition-opacity duration-300 md:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">Basket</h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
            >
              <X />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{renderCartItems()}</div>

        {product && (
          <>
            <div className=" bg-white">
              <div className="pb-1">
                <div className="flex items-start bg-[#F6FBFF] justify-between py-3 px-6 ">
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] text-[#828999] font-medium mb-0.5">
                      {address?.receiverName || 'No address selected'},{' '}
                      {address?.receiverMobile || ''}
                    </div>
                    {address && (
                      <div className="text-[14px] font-sans text-[#000000] font-light line-clamp-2">
                        {address.flatorHouseno}, {address.area}
                        {address.landmark ? `, ${address.landmark}` : ''}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setAddressDrawerOpen(true)}
                    className="text-sm  text-primary font-medium md:text-[18px] ml-3 shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="flex p-5 gap-4">
                <div className="">
                  <span className="text-xs whitespace-nowrap font-normal text-primary">
                    View Bill
                  </span>
                </div>
                <button
                  className="w-full h-[50px] bg-primary hover:bg-primary text-center  justify-center text-white py-3 rounded font-medium text-sm transition-colors flex items-center  px-4"
                  onClick={handlePlaceOrder}
                >
                  <span className="font-semibold">
                    {isPending ? (
                      <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <span className="w-full h-[50px] bg-primary hover:bg-primary text-center justify-center text-white py-3 rounded font-medium text-sm transition-colors flex items-center px-4">
                        Place Order (₹{totals.totalPrice.toFixed(0)})
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Address Drawer */}
      <AddressDrawer
        isOpen={addressDrawerOpen}
        onClose={() => setAddressDrawerOpen(false)}
        mode={mode}
        setMode={setMode}
      />
    </>
  )
}

export default QuickBuyDrawer
