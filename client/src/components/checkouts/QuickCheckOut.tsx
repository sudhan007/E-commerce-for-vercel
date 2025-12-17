import { useEffect, useState } from 'react'
import AddressDrawer from '../AddressDrawer'
import { _axios } from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionContext } from '@/context/SessionContext'
import { Loader2, X } from 'lucide-react'
import {
  checkPincodeServiceability,
  type ServiceabilityResult,
} from '@/lib/checkServiceability'
import { toast } from 'sonner'

export type QuickBuyProduct = {
  productId: string
  productName: string
  brandName: string
  variantId: string
  size: string
  color?: string
  price: number
  strikeAmount?: number
  image: string
  quantity: number
  gst: number
}
interface QuickCheckOutProps {
  product?: QuickBuyProduct
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
const QuickCheckOut = ({ product }: QuickCheckOutProps) => {
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false)
  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list')
  const session = useSessionContext()
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: product?.price ?? 0,
    tax: 0,
    totalPrice: product?.price ?? 0,
    deliveryCharge: 0,
  })
  const [serviceability, setServiceability] =
    useState<ServiceabilityResult | null>(null)
  const [checkingPincode, setCheckingPincode] = useState(false)
  const [deliveryOptions, setDeliveryOptions] = useState<{
    cod: any
    prepaid: any
  } | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'cod' | 'prepaid'
  >('prepaid')
  const queryClient = useQueryClient()

  const { data: address } = useQuery<Address>({
    queryKey: ['user-address', session?._id],
    queryFn: () =>
      _axios.get(`/user/address/${session?._id}`).then((res) => res.data.data),
    enabled: !!session?._id,
    staleTime: 5 * 60 * 1000,
  })

  const calculateTotals = (product: QuickBuyProduct) => {
    const subtotal = product.price * product.quantity

    const gstRate = product.gst ?? 0
    const tax = (subtotal * gstRate) / 100

    const deliveryCharge =
      selectedPaymentMethod === 'cod'
        ? deliveryOptions?.cod?.total_amount || 0
        : deliveryOptions?.prepaid?.total_amount || 0

    const totalPrice = subtotal + tax + deliveryCharge

    setTotals({ subtotal, tax, totalPrice, deliveryCharge })
  }

  useEffect(() => {
    if (product && deliveryOptions) {
      calculateTotals(product)
    }
  }, [selectedPaymentMethod, deliveryOptions, product])

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
        checkoutType: 'quick',
        quickProduct: {
          variantId: product?.variantId,
          quantity: product?.quantity,
          productId: product?.productId,
        },
      })
    },
    onSuccess: (response: any) => {
      const { success, paymentMethod, paymentUrl, message } = response.data
      if (!success) {
        toast.error(message || 'Payment initiation failed')
        return
      }
      toast.success('Order placed successfully!')
      queryClient.invalidateQueries({ queryKey: ['cart-count'] })
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
          `/user/courier/delivery-charge?pincode=${address.pincode}&variantId=${product?.variantId}&quantity=${product?.quantity}`,
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

  const removeItem = async (id: string) => {
    // try {
    //   await _axios.delete(`/user/cart/${id}`)
    //   const updated = cartItems.filter((i) => i._id !== id)
    //   setCartItems(updated)
    //   calculateTotals(updated)
    //   queryClient.invalidateQueries({ queryKey: ['cart-count'] })
    //   toast.success('Item removed')
    // } catch (err: any) {
    //   toast.error(err.response?.data?.message || 'Failed to remove item')
    // }
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-sm p-3 sm:p-6 md:p-8 shadow-sm">
              {/* Cart Items */}
              <div className="space-y-3 sm:space-y-4">
                {/* {cartItems.map((product) => {
                  const isLoading = itemLoadingStates[item._id]
                  return (
                 
                  )
                })} */}
                {product && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition relative">
                    <div className="flex gap-3 sm:gap-4 flex-1">
                      <img
                        src={product?.image || '/placeholder.jpg'}
                        alt={product?.productName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-2">
                          {product.productName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Sold by: {product.brandName}
                        </p>

                        {/* <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-600">
                          <span>Size: {product.variantId?.size}</span>
                          <span>•</span>
                          <span>Qty: {product.quantity}</span>
                        </div> */}

                        <div className="flex items-center justify-between mt-3 sm:mt-4">
                          <span className="text-lg sm:text-xl font-bold">
                            ₹ {product?.price ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                      <button
                        // onClick={() => removeItem(product._id)}
                        className="text-gray-400 hover:text-red-600 order-2 sm:order-1 cursor-pointer"
                      >
                        <X size={20} className="sm:w-[22px] sm:h-[22px]" />
                      </button>

                      {/* <div className="flex items-center gap-2 sm:gap-3 text-[11px] order-1 sm:order-2">
                        <div className="flex items-center max-h-6 bg-[#F1F3F5] rounded-[4px]">
                          <span className="text-[#828999] text-[11px] max-h-6 pl-2 bg-[#F1F3F5] shadow-none">
                            Size
                          </span>
                          <Select
                            value={product.variantId?._id}
                            onValueChange={(value) =>
                              handleSizeChange(product, value)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger className="text-[14px] border-none max-h-6 bg-[#F1F3F5] shadow-none text-[#000000] w-auto cursor-pointer">
                              <SelectValue>
                                {product.variantId?.size}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {product.availableSizes?.map((sizeOption) => (
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
                            value={product.quantity.toString()}
                            onValueChange={(value) =>
                              handleQuantityChange(
                                product,
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
                      </div> */}
                    </div>
                  </div>
                )}
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
                    className="text-primary cursor-pointer  font-medium text-sm"
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
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Item Total</span>
                    <span className="font-medium text-foreground">
                      ₹ {totals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-foreground">
                      ₹ {totals.tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Coupon discount</span>
                    <span className="text-green-600 font-medium">₹ 0</span>
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="text-green-600 font-medium">
                      ₹{totals.deliveryCharge?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    Total Amount
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-foreground">
                    ₹{totals.totalPrice?.toFixed(2)}
                  </span>
                </div>

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

export default QuickCheckOut
