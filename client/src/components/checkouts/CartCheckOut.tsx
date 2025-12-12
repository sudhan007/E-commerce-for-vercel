import { AlertCircle, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { _axios } from '@/lib/axios'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionContext } from '@/context/SessionContext'
import {
  checkPincodeServiceability,
  type ServiceabilityResult,
} from '@/lib/checkServiceability'
import AddressDrawer from '@/components/AddressDrawer'

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
const CartCheckOut = () => {
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
      return await _axios.post('/user/userauth/create-payment', {
        deliveryAddressId: data.deliveryAddressId,
        paymentMethod: data.pamentMethod,
        deliveryCharge: data.deliveryCharge,
        totalAmount: data.totalAmount,
        userId: session?._id,
      })
    },
    onSuccess: (response: any) => {
      const { success, paymentMethod, paymentUrl, message } = response.data
      if (!success) {
        toast.error(message || 'Payment initiation failed')
        return
      }
      toast.success('Order placed successfully!')
      fetchCart(session?._id ?? '')
      queryClient.invalidateQueries({ queryKey: ['cart-count'] })
      setCartItems([])
      setTotals({ subtotal: 0, tax: 0, totalPrice: 0, deliveryCharge: 0 })
      if (paymentMethod === 'prepaid' && paymentUrl) {
        toast.loading('Redirecting to payment gateway...', { duration: 3000 })
        window.location.href = paymentUrl
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to place order'
      toast.error(msg)
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
    enabled: !!session?._id,
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
    if (session?._id) {
      fetchCart(session?._id)
    } else {
      setCartItems([])
      setTotals({ subtotal: 0, tax: 0, totalPrice: 0, deliveryCharge: 0 })
    }
  }, [session?._id])

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading your cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-50 rounded-full p-8 mb-6">
          <svg
            className="w-20 h-20 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-600 text-sm max-w-xs">
          Looks like you haven't added anything to your cart yet.
        </p>
        <button
          // onClick={() => /* Navigate to shop or homepage */}
          className="mt-6 px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-sm p-3 sm:p-6 md:p-8 shadow-sm">
              {/* Cart Items */}
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item) => {
                  const isLoading = itemLoadingStates[item._id]
                  return (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition relative"
                    >
                      {isLoading && (
                        <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center z-10">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}

                      <div className="flex gap-3 sm:gap-4 flex-1">
                        <img
                          src={
                            item.variantId?.images?.[0] || '/placeholder.jpg'
                          }
                          alt={item.productId.productName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">
                            {item.productId.productName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Sold by: {item.productId.brandName}
                          </p>

                          <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-600">
                            <span>Size: {item.variantId?.size}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                          </div>

                          <div className="flex items-center justify-between mt-3 sm:mt-4">
                            <span className="text-lg sm:text-xl font-bold">
                              ₹ {item.variantId?.priceDetails?.price ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-gray-400 hover:text-red-600 order-2 sm:order-1 cursor-pointer"
                        >
                          <X size={20} className="sm:w-[22px] sm:h-[22px]" />
                        </button>

                        <div className="flex items-center gap-2 sm:gap-3 text-[11px] order-1 sm:order-2">
                          <div className="flex items-center max-h-6 bg-[#F1F3F5] rounded-[4px]">
                            <span className="text-[#828999] text-[11px] max-h-6 pl-2 bg-[#F1F3F5] shadow-none">
                              Size
                            </span>
                            <Select
                              value={item.variantId?._id}
                              onValueChange={(value) =>
                                handleSizeChange(item, value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger className="text-[14px] border-none max-h-6 bg-[#F1F3F5] shadow-none text-[#000000] w-auto cursor-pointer">
                                <SelectValue>
                                  {item.variantId?.size}
                                </SelectValue>
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

                          <div className="flex items-center rounded-[4px] max-h-6 bg-[#F1F3F5]">
                            <span className="text-[#828999] text-[11px] max-h-6 pl-2 bg-[#F1F3F5] shadow-none">
                              Qty
                            </span>
                            <Select
                              value={item.quantity.toString()}
                              onValueChange={(value) =>
                                handleQuantityChange(
                                  item,
                                  Number.parseInt(value),
                                )
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger className="text-[14px] border-none max-h-6 bg-[#F1F3F5] shadow-none text-[#000000] w-auto  cursor-pointer">
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
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Coupons Card */}

              {/* Delivery Address Card */}
              <div className="bg-white rounded-sm p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-base sm:text-lg">
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => setAddressDrawerOpen(true)}
                    className="text-primary font-medium text-sm"
                  >
                    {address ? 'Change' : 'Add Address'}
                  </button>
                </div>
                {address ? (
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      {address.receiverName} • {address.receiverMobile}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {address.flatorHouseno}, {address.area}
                      {address.landmark && `, ${address.landmark}`},{' '}
                      {address.pincode}
                    </p>
                    {checkingPincode && (
                      <p className="text-xs sm:text-sm text-orange-600 mt-2">
                        Checking delivery...
                      </p>
                    )}
                    {serviceability && !serviceability.isServiceable && (
                      <p className="text-xs sm:text-sm text-red-600 mt-2">
                        Not serviceable
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No address selected</p>
                )}
              </div>

              {/* Payment Method Card */}
              {deliveryOptions && (
                <div className="bg-white rounded-sm p-4 sm:p-6 shadow-sm">
                  <h3 className="font-semibold text-base sm:text-lg mb-4">
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 sm:p-4 border rounded-sm cursor-pointer">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="radio"
                          name="pay"
                          checked={selectedPaymentMethod === 'prepaid'}
                          onChange={() => setSelectedPaymentMethod('prepaid')}
                        />
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            Pay Online
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            ₹{deliveryOptions.prepaid.total_amount} delivery
                          </p>
                        </div>
                      </div>
                      {deliveryOptions.prepaid.savings_vs_cod > 0 && (
                        <span className="text-green-600 text-xs sm:text-sm font-medium">
                          Save ₹{deliveryOptions.prepaid.savings_vs_cod}
                        </span>
                      )}
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 sm:p-4 border rounded-sm ${!deliveryOptions.cod.available ? 'opacity-50' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="radio"
                          name="pay"
                          checked={selectedPaymentMethod === 'cod'}
                          onChange={() =>
                            deliveryOptions.cod.available &&
                            setSelectedPaymentMethod('cod')
                          }
                          disabled={!deliveryOptions.cod.available}
                        />
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            Cash on Delivery
                          </p>
                          {deliveryOptions.cod.available ? (
                            <p className="text-xs sm:text-sm text-gray-600">
                              ₹{deliveryOptions.cod.total_amount} (incl. COD
                              fee)
                            </p>
                          ) : (
                            <p className="text-xs sm:text-sm text-red-600">
                              Not Available
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>

                  <details className="mt-4 text-xs sm:text-sm">
                    <summary className="cursor-pointer text-primary font-medium hover:underline">
                      View Delivery Breakdown
                    </summary>
                    <div className="mt-3 pl-3 sm:pl-4 space-y-1.5 text-[#828999] bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex justify-between">
                        <span>Base Delivery:</span>
                        <span>
                          ₹
                          {selectedPaymentMethod === 'cod'
                            ? deliveryOptions.cod.base_delivery_charge.toFixed(
                                2,
                              )
                            : deliveryOptions.prepaid.base_delivery_charge.toFixed(
                                2,
                              )}
                        </span>
                      </div>
                      {selectedPaymentMethod === 'cod' &&
                        deliveryOptions.cod.cod_handling_fee > 0 && (
                          <div className="flex justify-between">
                            <span>COD Handling:</span>
                            <span>
                              ₹{deliveryOptions.cod.cod_handling_fee.toFixed(2)}
                            </span>
                          </div>
                        )}
                      <div className="flex justify-between">
                        <span>Tax (GST):</span>
                        <span>
                          ₹
                          {selectedPaymentMethod === 'cod'
                            ? deliveryOptions.cod.tax.toFixed(2)
                            : deliveryOptions.prepaid.tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-[#000000] pt-2 border-t border-gray-300">
                        <span>Total Delivery:</span>
                        <span>
                          ₹
                          {selectedPaymentMethod === 'cod'
                            ? deliveryOptions.cod.total_amount.toFixed(2)
                            : deliveryOptions.prepaid.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Price Details Card */}
              <div className="bg-white rounded-sm p-4 sm:p-6 shadow-sm">
                <h3 className="font-semibold text-foreground text-base sm:text-lg mb-4">
                  Price Details
                </h3>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {cartItems.length} Items
                  </div>

                  {/* Item Details */}
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Item Total</span>
                    <span className="font-medium text-foreground">
                      ₹ {totals.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Discount */}
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Coupon discount</span>
                    <span className="text-green-600 font-medium">₹ 0</span>
                  </div>

                  {/* Delivery */}
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="text-green-600 font-medium">
                      ₹{totals.deliveryCharge?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    Total Amount
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-foreground">
                    ₹{totals.totalPrice?.toFixed(2)}
                  </span>
                </div>

                {/* Place Order Button */}
                <button
                  className={`w-full h-[50px] rounded font-medium cursor-pointer  text-sm transition-all flex items-center justify-center px-4 ${
                    !address ||
                    !serviceability?.isServiceable ||
                    isPending ||
                    checkingPincode
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary text-white '
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
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddressDrawer
        isOpen={addressDrawerOpen}
        onClose={() => setAddressDrawerOpen(false)}
        mode={mode}
        setMode={setMode}
      />
    </div>
  )
}

export default CartCheckOut
