/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { _axios } from '@/lib/axios'
import AddressDrawer from './AddressDrawer'
import { useSessionContext } from '@/context/SessionContext'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  checkPincodeServiceability,
  type ServiceabilityResult,
} from '@/lib/checkServiceability'

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
  pincode: string
}

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    tax: 0,
    totalPrice: 0,
    deliveryCharge: 0,
  })
  const [serviceability, setServiceability] =
    useState<ServiceabilityResult | null>(null)
  const [checkingPincode, setCheckingPincode] = useState(false)
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false)
  const session = useSessionContext()
  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list')
  // Track loading state per item
  const [itemLoadingStates, setItemLoadingStates] = useState<
    Record<string, boolean>
  >({})
  const [deliveryOptions, setDeliveryOptions] = useState<{
    cod: any
    prepaid: any
  } | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'cod' | 'prepaid'
  >('prepaid')
  const queryClient = useQueryClient()
  // Fetch cart
  const fetchCart = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await _axios.get(`/user/cart/${userId}`)
      const items: CartItem[] = res.data.data || []

      const validItems = items.filter(
        (
          item,
        ): item is CartItem & {
          variantId: NonNullable<CartItem['variantId']>
        } => {
          return (
            !!item.variantId &&
            !!item.variantId.priceDetails &&
            typeof item.variantId.priceDetails.price === 'number' &&
            !!item.productId
          )
        },
      )

      setCartItems(validItems)
      calculateTotals(validItems)
    } catch (err: any) {
      console.error('Failed to fetch cart:', err)
      setError(err.response?.data?.message || 'Failed to load cart')
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  // Size change mutation
  const sizeChangeMutation = useMutation({
    mutationFn: async ({
      userId,
      productId,
      newVariantId,
      quantity,
      existingVariantId,
      itemId,
    }: {
      userId: string
      productId: string
      newVariantId: string
      existingVariantId: string
      quantity: number
      itemId: string
    }) => {
      setItemLoadingStates((prev) => ({ ...prev, [itemId]: true }))
      await _axios.put('/user/cart', {
        userId,
        productId,
        newVariantId,
        existingVariantId,
        quantity,
      })
    },
    onSuccess: (_, variables) => {
      fetchCart(session?._id ?? '')
      toast.success('Size updated successfully')
      setItemLoadingStates((prev) => ({ ...prev, [variables.itemId]: false }))
    },
    onError: (err: any, variables) => {
      toast.error(err.response?.data?.message || 'Failed to update size')
      fetchCart(session?._id ?? '')
      setItemLoadingStates((prev) => ({ ...prev, [variables.itemId]: false }))
    },
  })

  // Quantity change mutation
  const updateQuantityMutation = useMutation({
    mutationKey: ['updateQuantity'],
    mutationFn: async ({
      userId,
      productId,
      variantId,
      quantity,
      itemId,
    }: {
      userId: string
      productId: string
      variantId: string
      quantity: number
      itemId: string
    }) => {
      setItemLoadingStates((prev) => ({ ...prev, [itemId]: true }))
      const res = await _axios.patch(`/user/cart`, {
        userId,
        productId,
        variantId,
        quantity,
      })
      return res
    },
    onSuccess: (_, variables) => {
      fetchCart(session?._id ?? '')
      setItemLoadingStates((prev) => ({ ...prev, [variables.itemId]: false }))
    },
    onError: (err: any, variables) => {
      toast.error(err.response?.data?.message || 'Failed to update quantity')
      fetchCart(session?._id ?? '')
      setItemLoadingStates((prev) => ({ ...prev, [variables.itemId]: false }))
    },
  })

  const calculateTotals = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const price = item.variantId?.priceDetails?.price ?? 0
      return sum + price * item.quantity
    }, 0)

    const tax = items.reduce((sum, item) => {
      const gstRate = item.productId?.gst ?? 0
      const price = item.variantId?.priceDetails?.price ?? 0
      return sum + (price * item.quantity * gstRate) / 100
    }, 0)

    const deliveryCharge =
      selectedPaymentMethod === 'cod'
        ? deliveryOptions?.cod?.total_amount || 0
        : deliveryOptions?.prepaid?.total_amount || 0

    const totalPrice = subtotal + deliveryCharge

    setTotals({ subtotal, tax, totalPrice, deliveryCharge })
  }

  useEffect(() => {
    if (cartItems.length > 0 && deliveryOptions) {
      calculateTotals(cartItems)
    }
  }, [selectedPaymentMethod, deliveryOptions, cartItems])

  // Handle size change
  const handleSizeChange = (item: CartItem, newVariantId: string) => {
    if (!session?._id) return

    sizeChangeMutation.mutate({
      userId: session._id,
      productId: item.productId._id,
      newVariantId: newVariantId,
      existingVariantId: item?.variantId?._id ?? '',
      quantity: item.quantity,
      itemId: item._id,
    })
  }

  // Handle quantity change
  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (!session?._id || !item.variantId) return

    updateQuantityMutation.mutate({
      userId: session._id,
      productId: item.productId._id,
      variantId: item.variantId._id,
      quantity: newQuantity,
      itemId: item._id,
    })
  }

  // Remove item
  const removeItem = async (id: string) => {
    try {
      await _axios.delete(`/user/cart/${id}`)
      const updated = cartItems.filter((i) => i._id !== id)
      setCartItems(updated)
      calculateTotals(updated)
      toast.success('Item removed')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove item')
    }
  }

  const { mutate, isPending } = useMutation({
    mutationKey: ['placeOrder'],
    mutationFn: async (data: any) => {
      console.log(data)
      return await _axios.post('/user/orders', {
        deliveryAddressId: data.deliveryAddressId,
        paymentMethod: data.pamentMethod,
        deliveryCharge: data.deliveryCharge,
        totalAmount: data.totalAmount,
      })
    },
    onSuccess: () => {
      onClose()
      toast.success('Order placed successfully')
      fetchCart(session?._id ?? '')
      queryClient.invalidateQueries({ queryKey: ['cart-count'] })
      setCartItems([])
      setTotals({ subtotal: 0, tax: 0, totalPrice: 0, deliveryCharge: 0 })
    },
  })

  const handlePlaceOrder = () => {
    if (!address) {
      toast.error('Please add a delivery address')
      setAddressDrawerOpen(true)
      return
    }
    if (!serviceability?.isServiceable) {
      toast.error('Sorry, delivery is not available to your area.')
      setAddressDrawerOpen(true)
      return
    }

    if (selectedPaymentMethod === 'cod' && !deliveryOptions?.cod.available) {
      toast.error('COD not available. Please select online payment.')
      return
    }

    mutate({
      deliveryAddressId: address._id,
      totalAmount: totals.totalPrice,
      pamentMethod: selectedPaymentMethod,
      deliveryCharge: totals.deliveryCharge,
    })
  }

  // Fetch address
  const { data: address } = useQuery<Address>({
    queryKey: ['user-address', session?._id],
    queryFn: () =>
      _axios.get(`/user/address/${session?._id}`).then((res) => res.data.data),
    enabled: !!session?._id && isOpen,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!address?.pincode) {
      setServiceability(null)

      return
    }

    setCheckingPincode(true)
    checkPincodeServiceability(address.pincode)
      .then((result) => {
        setServiceability(result)
        console.log(result, 'resykk')
        if (!result.isServiceable) {
          toast.error(`Delivery not available to pincode ${address.pincode}`)
        }
      })
      .finally(() => setCheckingPincode(false))
  }, [address?.pincode])

  useEffect(() => {
    if (!address?.pincode) {
      setDeliveryOptions(null)
      return
    }

    const fetchDeliveryCharges = async () => {
      try {
        const response = await _axios.get(
          `/user/courier/delivery-charge?pincode=${address.pincode}`,
        )
        setDeliveryOptions(response.data.payment_options)

        if (!response.data.payment_options.cod.available) {
          setSelectedPaymentMethod('prepaid')
          toast.info('COD not available. Prepaid payment selected.')
        }
      } catch (error) {
        console.error('Failed to fetch delivery charges:', error)
      }
    }

    fetchDeliveryCharges()
  }, [address?.pincode])

  useEffect(() => {
    if (isOpen && session?._id) {
      fetchCart(session?._id)
    } else {
      setCartItems([])
      setTotals({ subtotal: 0, tax: 0, totalPrice: 0, deliveryCharge: 0 })
    }
  }, [isOpen, session?._id])

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
      {cartItems.map((item) => {
        const isItemLoading = itemLoadingStates[item._id]

        return (
          <div key={item._id} className="flex p-4 gap-3 relative">
            {/* Loading Overlay */}
            {isItemLoading && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            <img
              src={item.variantId?.images?.[0] || '/placeholder.jpg'}
              alt={item.productId.productName}
              className="w-[110px] h-[117px] md:h-[125px] object-contain"
              onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
            />

            {/* Remove Button - Top Right */}
            <button
              onClick={() => removeItem(item._id)}
              className="absolute top-4 right-4 text-primary text-xs font-medium underline hover:text-primary transition-colors"
            >
              Remove
            </button>

            <div className="flex flex-col ">
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Brand Name */}
                <div>
                  <div className="font-normal text-[12px] text-[#828999] mb-0.5 capitalize tracking-wide">
                    {item.productId.brandName}
                  </div>

                  {/* Product Name */}
                  <div className="text-xs md:text-[15px] uppercase font-medium text-[#000000] line-clamp-2 leading-tight mb-2">
                    {item.productId.productName}
                  </div>

                  {/* Size and Quantity Row */}
                  <div className="flex items-center gap-3 text-[11px]">
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
                  </div>
                </div>

                {/* Price at bottom left */}
              </div>

              {/* Total Price - Bottom Right */}
              <div className="flex items-center justify-between h-full">
                <div className="text-xs  text-[#828999] font-medium ">
                  ₹{item.variantId?.priceDetails?.price ?? 0}
                </div>
                <div className="text-sm font-semibold text-gray-900 ">
                  <span className="text-[#828999] text-[16px] font-medium">
                    Total:
                  </span>{' '}
                  ₹
                  {(
                    (item.variantId?.priceDetails?.price ?? 0) * item.quantity
                  ).toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {cartItems.length > 0 && (
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
                    ₹{totals.totalPrice}
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
            {loading && cartItems.length === 0 && (
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
            )}
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

          {deliveryOptions && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#1F1F1F] mb-3">
                Payment Method
              </h3>

              <div className="space-y-3">
                {/* Prepaid Option */}
                <label
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPaymentMethod === 'prepaid'
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="prepaid"
                    checked={selectedPaymentMethod === 'prepaid'}
                    onChange={(e) =>
                      setSelectedPaymentMethod(e.target.value as 'prepaid')
                    }
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[16px] font-semibold text-[#000000]">
                          Pay Online (UPI/Card/Wallet)
                        </p>
                        <p className="text-[14px] text-[#828999] mt-0.5">
                          Delivery: ₹
                          {deliveryOptions.prepaid.total_amount.toFixed(2)}
                        </p>
                      </div>
                      {deliveryOptions.prepaid.savings_vs_cod > 0 && (
                        <span className="text-[12px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          Save ₹
                          {deliveryOptions.prepaid.savings_vs_cod.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </label>

                {/* COD Option */}
                <label
                  className={`flex items-start p-3 border-2 rounded-lg transition-all ${
                    !deliveryOptions.cod.available
                      ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                      : selectedPaymentMethod === 'cod'
                        ? 'border-primary bg-blue-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={selectedPaymentMethod === 'cod'}
                    onChange={(e) =>
                      setSelectedPaymentMethod(e.target.value as 'cod')
                    }
                    disabled={!deliveryOptions.cod.available}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[16px] font-semibold text-[#000000]">
                          Cash on Delivery
                          {!deliveryOptions.cod.available && (
                            <span className="text-[12px] ml-2 text-red-600 font-normal">
                              (Not Available)
                            </span>
                          )}
                        </p>
                        {deliveryOptions.cod.available && (
                          <p className="text-[14px] text-[#828999] mt-0.5">
                            Delivery: ₹
                            {deliveryOptions.cod.total_amount.toFixed(2)}
                            <span className="text-[12px] ml-1">
                              (incl. ₹{deliveryOptions.cod.cod_handling_fee} COD
                              fee)
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Delivery Breakdown - Expandable */}
              <details className="mt-3 text-[14px]">
                <summary className="cursor-pointer text-primary font-medium">
                  View Delivery Breakdown
                </summary>
                <div className="mt-2 pl-4 space-y-1 text-[#828999]">
                  <p>
                    Base Delivery: ₹
                    {selectedPaymentMethod === 'cod'
                      ? deliveryOptions.cod.base_delivery_charge.toFixed(2)
                      : deliveryOptions.prepaid.base_delivery_charge.toFixed(2)}
                  </p>
                  {selectedPaymentMethod === 'cod' &&
                    deliveryOptions.cod.cod_handling_fee > 0 && (
                      <p>
                        COD Handling: ₹
                        {deliveryOptions.cod.cod_handling_fee.toFixed(2)}
                      </p>
                    )}
                  <p>
                    Tax (GST): ₹
                    {selectedPaymentMethod === 'cod'
                      ? deliveryOptions.cod.tax.toFixed(2)
                      : deliveryOptions.prepaid.tax.toFixed(2)}
                  </p>
                  <p className="font-semibold text-[#000000] pt-1 border-t">
                    Total Delivery: ₹
                    {selectedPaymentMethod === 'cod'
                      ? deliveryOptions.cod.total_amount.toFixed(2)
                      : deliveryOptions.prepaid.total_amount.toFixed(2)}
                  </p>
                </div>
              </details>
            </div>
          )}

          {/* Bill Summary */}

          <div className="flex p-5 gap-4">
            <div className="">
              <p className="text-xs whitespace-nowrap font-semibold text-[#000000] text-[18px]">
                {cartItems.length} Items
              </p>
              <span className="text-xs whitespace-nowrap font-normal text-primary">
                View Bill
              </span>
            </div>
            <button
              className={`w-full h-[50px] rounded font-medium text-sm transition-all flex items-center justify-center px-4 ${
                !address || !serviceability?.isServiceable || isPending
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary text-white'
              }`}
              onClick={handlePlaceOrder}
              disabled={
                !address ||
                !serviceability?.isServiceable ||
                isPending ||
                checkingPincode
              }
            >
              {isPending || checkingPincode ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : !address ? (
                'Add Delivery Address'
              ) : !serviceability?.isServiceable ? (
                'Delivery Not Available'
              ) : (
                `Place Order (₹${totals.totalPrice})`
              )}
            </button>
            {/* <button
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
            </button> */}
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

        <div className="flex-1 overflow-y-auto">
          {loading && cartItems.length === 0 && (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          )}
          {error && <div className="p-4 text-red-600 text-center">{error}</div>}
          {!loading && !error && cartItems.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">Your cart is empty</p>
            </div>
          )}
          {renderCartItems()}
        </div>

        {cartItems.length > 0 && (
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
                  <p className="text-xs whitespace-nowrap font-semibold text-[#000000] text-[18px]">
                    {cartItems.length} Items
                  </p>
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

export default CartDrawer
