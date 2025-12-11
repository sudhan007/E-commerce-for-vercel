import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { _axios } from '@/lib/axios'
import { ChevronDown, Minus, Plus, X } from 'lucide-react'
import { Button } from './ui/button'
import { useSessionContext } from '@/context/SessionContext'
import LoginModal from './Loginpage'
import QuickViewSkeleton from './skeletons/QuickViewSkeleton'
import { useCartContext } from '@/context/CartContext'

interface PriceDetails {
  actualPrice: number
  offerPercentage: number
  strikeAmount: number
  price: number
}

interface Variant {
  _id: string
  color: string
  size: string
  bustSize?: string
  bottomLength?: string
  stock: number
  priceDetails: PriceDetails
  images: string[]
  isPrimary?: boolean
  isAddedToCart?: boolean
  quantity?: number
}

interface ProductResponse {
  product: {
    _id: string
    brandName: string
    productName: string
    pattern?: string
    sizeChartImage?: string
    isFavourite: boolean
  }
  variants: Variant[]
}

interface QuickViewModalProps {
  open: boolean
  onClose: () => void
  productId: string
}

interface AddToCardBody {
  productId: string
  quantity: number
  userId: string
  variantId: string
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  open,
  onClose,
  productId,
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const cart = useCartContext()
  const { setCartOpen } = cart
  const [localQuantity, setLocalQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const session = useSessionContext()
  const queryClient = useQueryClient()
  const [shake, setShake] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['quickview-product', productId],
    queryFn: async (): Promise<ProductResponse> => {
      let api = `/user/products/${productId}`
      if (session?._id) {
        api += `${api.includes('?') ? '&' : '?'}userId=${session._id}`
      }
      const res = await _axios.get(api)
      return res.data.data
    },
    enabled: open && !!productId,
    staleTime: 1000 * 60 * 5,
  })

  const addToCartMutation = useMutation({
    mutationKey: ['addToCart'],
    mutationFn: async (data: AddToCardBody) => {
      const res = await _axios.post('/user/cart', data)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quickview-product', productId],
      })
      queryClient.invalidateQueries({ queryKey: ['cart'] })

      toast.success('Product added to cart')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add product to cart')
    },
  })

  const addToFavouriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await _axios.post('/user/favorites', { productId })
      return res.data
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ['quickview-product', productId],
      })
      if (data?.message) {
        toast.success(data?.message)
      } else {
        toast.success(data?.message)
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add product to favorites')
    },
  })

  // Compute selectedVariant and cart status
  const selectedVariant = useMemo(() => {
    if (!data?.variants) return null

    return (
      data.variants.find((v) => {
        if (selectedSize && selectedColor)
          return v.size === selectedSize && v.color === selectedColor
        if (selectedSize) return v.size === selectedSize
        if (selectedColor) return v.color === selectedColor
        return v.isPrimary
      }) || data.variants[0]
    )
  }, [data, selectedSize, selectedColor])

  const isCurrentVariantInCart = selectedVariant?.isAddedToCart ?? false
  const serverQuantity = selectedVariant?.quantity || 0

  const updateQuantityMutation = useMutation({
    mutationKey: ['updateQuantity'],
    mutationFn: async (payload: any) => {
      const res = await _axios.patch(`/user/cart`, payload)
      return res
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["quickview-product", productId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update quantity')
      console.error(err)
      setLocalQuantity(serverQuantity > 0 ? serverQuantity : 1)
    },
  })

  // Debounced quantity update
  const debouncedUpdateQuantity = useCallback(
    (newQuantity: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        const payload = {
          userId: session?._id,
          productId: data?.product?._id,
          variantId: selectedVariant?._id,
          quantity: newQuantity,
        }
        updateQuantityMutation.mutate(payload)
      }, 400)
    },
    [
      session?._id,
      data?.product?._id,
      selectedVariant?._id,
      updateQuantityMutation,
    ],
  )

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setSelectedSize(null)
      setSelectedColor(null)
      setShowSizeChart(false)
      setLocalQuantity(1)
      setCurrentImageIndex(0)
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  useEffect(() => {
    if (!data?.variants) return

    const uniqueColors = Array.from(
      new Set(data.variants.map((v) => v.color).filter(Boolean)),
    )

    if (uniqueColors.length > 0 && !selectedColor) {
      setSelectedColor(uniqueColors[0])
    }
  }, [data, selectedSize, selectedColor])

  // Helper function to check if a size is available for the selected color
  const isSizeAvailableForColor = useCallback(
    (size: string, color: string) => {
      if (!data?.variants) return false
      return data.variants.some(
        (v) => v.size === size && v.color === color && v.stock > 0,
      )
    },
    [data?.variants],
  )

  // Reset image index when variant changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedVariant?._id])

  // Auto carousel for images
  useEffect(() => {
    const images = selectedVariant?.images || []
    if (images.length <= 1) return

    autoSlideRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 3000)

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
    }
  }, [selectedVariant?.images])

  // Sync local quantity with server quantity when variant changes
  useEffect(() => {
    if (!selectedSize) {
      setLocalQuantity(1) // Default quantity before size selection
      return
    }

    if (isCurrentVariantInCart && serverQuantity > 0) {
      setLocalQuantity(serverQuantity)
    } else if (!isCurrentVariantInCart) {
      setLocalQuantity(1) // Min quantity is 1
    }
  }, [isCurrentVariantInCart, serverQuantity, selectedVariant, selectedSize])

  // NOW safe to early return
  if (!open) return null

  if (isLoading) {
    return <QuickViewSkeleton onClose={onClose} />
  }

  if (!data) return null

  const { product, variants } = data

  const uniqueSizes = Array.from(
    new Set(variants.map((v) => v.size).filter(Boolean)),
  )
  const uniqueColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean)),
  )

  const price = selectedVariant?.priceDetails.price
  const mrp =
    selectedVariant?.priceDetails?.strikeAmount &&
    price &&
    selectedVariant?.priceDetails?.strikeAmount > price
      ? selectedVariant.priceDetails?.strikeAmount
      : selectedVariant?.priceDetails?.actualPrice
  const offerPercentage = selectedVariant?.priceDetails?.offerPercentage
  const hasDiscount =
    selectedVariant?.priceDetails?.offerPercentage &&
    selectedVariant?.priceDetails?.offerPercentage > 0
  const mainImage = selectedVariant?.images[0] || ''
  const hasMeasurements =
    selectedVariant?.bustSize || selectedVariant?.bottomLength

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setSelectedSize(null)
    setLocalQuantity(1)
  }

  const handleSizeClick = (size: string) => {
    setSelectedSize(size)
    setLocalQuantity(1) // Reset to min quantity when size changes
    queryClient.invalidateQueries({
      queryKey: ['quickview-product', productId],
    })
  }

  const checkAuthentication = () => {
    const isLoggedIn = session?._id !== undefined
    if (!isLoggedIn) {
      setShowLogin(true)
      return false
    }
    return true
  }

  const handleQuantityClick = (type: 'increment' | 'decrement') => {
    if (!checkAuthentication()) return

    const maxStock = 10

    const newQuantity =
      type === 'increment'
        ? Math.min(localQuantity + 1, maxStock) // Cap at stock
        : Math.max(localQuantity - 1, 1) // Min is 1

    if (newQuantity === localQuantity) return // No change needed

    setLocalQuantity(newQuantity)

    if (isCurrentVariantInCart && selectedSize) {
      debouncedUpdateQuantity(newQuantity)
    }
  }

  const addToCart = () => {
    if (!checkAuthentication()) return

    if (!selectedSize) {
      setShake(true)
      setTimeout(() => setShake(false), 1000)
      return
    }

    if (!selectedVariant || selectedVariant.stock === 0) {
      toast.error('Product is out of stock')
      return
    }

    const data: AddToCardBody = {
      userId: session?._id ?? '',
      productId: product?._id,
      variantId: selectedVariant._id,
      quantity: localQuantity,
    }

    addToCartMutation.mutate(data)
  }

  const handleGoToBasket = () => {
    if (!checkAuthentication()) return
    setCartOpen(true)
    onClose()
  }

  const handleFavouriteClick = () => {
    if (!checkAuthentication()) return
    addToFavouriteMutation.mutate(product._id)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 items-center justify-center font-sans hidden md:flex">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        <div className="relative z-10 w-full max-w-5xl mx-2 bg-white rounded-none overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-2 right-2 z-20 w-10 h-10 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X />
          </button>
          <div className="w-full md:w-[38%] flex items-center justify-center relative h-[400px] md:h-[550px]">
            {/* Image Carousel */}
            <div className="relative w-full h-full">
              <img
                src={
                  selectedVariant?.images[currentImageIndex] ||
                  '/placeholder.jpg'
                }
                alt={product.productName}
                className="h-full w-full object-cover"
              />

              {/* Dots Navigation */}
              {selectedVariant?.images && selectedVariant.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {selectedVariant.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        currentImageIndex === index
                          ? 'bg-primary w-4'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-[62%] p-4 md:p-6 flex flex-col">
            <div className="flex flex-col">
              <p className="text-xs font-normal text-primary md:text-[16px] capitalize font-sans">
                {product.brandName}
              </p>
              <h1 className="text-[#1F1F1F] font-medium text-[16px] md:text-[24px] uppercase tracking-wide font-sans">
                {product.productName}
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-2 font-sans">
              {hasDiscount !== 0 && (
                <span className="text-sm text-[#828999] font-semibold flex gap-2">
                  <span className="text-[#1F1F1F] text-[14px] font-normal hidden md:inline">
                    MRP
                  </span>
                  {mrp && (
                    <span className="line-through">
                      ₹{mrp && mrp?.toLocaleString('en-IN')}
                    </span>
                  )}
                </span>
              )}
              <span className="text-[#000000] font-medium text-[11px] md:text-[14px]">
                ₹{price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount !== 0 && (
                <span className="text-[#E51C23] text-[11px] md:text-[14px] font-normal whitespace-nowrap">
                  {offerPercentage}% OFF
                </span>
              )}
            </div>
            <p className="text-[14px] font-light text-[#828999] mt-2 font-sans">
              Inclusive of all taxes
            </p>

            <div className="mt-2 bg-[#F1F3F5] p-2 rounded">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img
                    src="/design-icons/tape-measure1.png"
                    alt="size guide"
                    className="w-5 h-5 md:w-6.5 md:h-6.5"
                  />
                  <span className="text-sm md:text-[16px] font-normal text-[#1F1F1F] font-sans">
                    Select Perfect Fit To Your Size
                  </span>
                </div>
                {product.sizeChartImage && (
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-xs cursor-pointer text-primary md:text-[16px] underline font-medium"
                  >
                    View Size Chart
                  </button>
                )}
              </div>

              <div
                className={`flex flex-wrap gap-3 transition-all ${shake ? 'animate-shake' : ''}`}
              >
                {uniqueSizes.map((size) => {
                  const disabled = selectedColor
                    ? !isSizeAvailableForColor(size, selectedColor)
                    : false

                  return (
                    <button
                      key={size}
                      onClick={() => !disabled && handleSizeClick(size)}
                      disabled={disabled}
                      className={`min-w-10 min-h-7 text-sm text-[#1F1F1F] font-medium rounded border-2 transition-all uppercase ${
                        selectedSize === size
                          ? 'bg-[#F1F3F5] border-primary cursor-pointer'
                          : disabled
                            ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-white border-none rounded-none cursor-pointer'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {hasMeasurements && (
              <div className="flex gap-2">
                {selectedVariant.bustSize && (
                  <span className="text-[14px] font-light text-[#828999] mt-2 font-sans">
                    Product Bust:{' '}
                    <span className="text-[#000000] text-[14px] font-medium">
                      {selectedVariant.bustSize} in
                    </span>
                  </span>
                )}
                {selectedVariant.bottomLength && (
                  <span className="text-[14px] font-light text-[#828999] mt-2 font-sans">
                    Product Bottom Length:{' '}
                    <span className="text-[#000000] text-[14px] font-medium">
                      {selectedVariant.bottomLength} in
                    </span>
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-8 mt-6 justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="font-medium font-sans text-sm md:text-[18px] text-[#1F1F1F]">
                  Colour :
                </span>
                <div className="flex gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'scale-110 ring-1 ring-primary/50'
                          : 'ring-0'
                      } ${
                        color.toLowerCase() === '#ffffff' || color === 'white'
                          ? 'border-2 border-gray-300'
                          : ''
                      }`}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              {product.pattern && (
                <div className="flex items-center gap-3">
                  <span className="font-medium font-sans text-sm md:text-[18px] text-[#1F1F1F]">
                    Pattern :
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-[#828999] rounded-none text-xs md:text-[16px] font-normal uppercase">
                    {product.pattern}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-8">
              <Button
                onClick={handleFavouriteClick}
                className={`bg-transparent h-full flex items-center justify-center max-w-[50px] cursor-pointer hover:bg-transparent overflow-hidden border border-[#0E3051] rounded-[4px]`}
              >
                <img
                  src={`${product.isFavourite ? '/design-icons/red-heart.svg' : '/design-icons/heart1.svg'}`}
                  alt=""
                  className="scale-170"
                />
              </Button>
              <div className="flex items-center justify-between border border-primary rounded h-full">
                <button
                  onClick={() => handleQuantityClick('decrement')}
                  className="w-12 h-12 text-center flex justify-center cursor-pointer items-center  text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={localQuantity <= 1}
                >
                  <Minus />
                </button>
                <span className="w-16 text-center font-normal text-[24px] flex items-center justify-center">
                  {localQuantity}
                </span>
                <button
                  onClick={() => handleQuantityClick('increment')}
                  className="w-12 h-12 text-center flex justify-center cursor-pointer items-center  text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    selectedVariant
                      ? localQuantity >= selectedVariant.stock
                      : false
                  }
                >
                  <Plus />
                </button>
              </div>

              {isCurrentVariantInCart && selectedSize ? (
                <button
                  onClick={handleGoToBasket}
                  className="flex-1 bg-primary cursor-pointer h-full text-white font-medium md:text-[18px] font-sans rounded uppercase tracking-wider hover:bg-[#083050] transition-all text-sm"
                >
                  GO TO BASKET
                </button>
              ) : (
                <button
                  onClick={addToCart}
                  className="flex-1 bg-primary cursor-pointer h-full text-white font-medium md:text-[18px] font-sans rounded uppercase tracking-wider hover:bg-[#083050] transition-all text-sm"
                >
                  Add to Cart{' '}
                  <span className="font-light">
                    (₹{price && (price * localQuantity).toLocaleString('en-IN')}
                    )
                  </span>
                </button>
              )}
            </div>

            <div className="border-t border-gray-200 mt-8 pt-6 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[14px] text-[#1F1F1F] font-sans md:text-[18px] uppercase">
                  Select Delivery Address
                </span>
                <div className="text-[#329911] font-medium flex gap-3">
                  <img
                    src="/design-icons/delivery-truck.svg"
                    alt=""
                    className=""
                  />{' '}
                  Estimated Delivery: Friday, 28 Nov 2025
                </div>
              </div>
              <p className="text-primary flex items-center gap-2 font-normal text-[18px]">
                <img src="/design-icons/location.svg" alt="" className="" />
                Select to see availability to{' '}
                <span className="font-semibold flex">
                  your location <ChevronDown className="" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSizeChart && product.sizeChartImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div
            className="absolute inset-0"
            onClick={() => setShowSizeChart(false)}
          />

          <div className="relative max-w-full max-h-full">
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              <img
                src={product.sizeChartImage}
                alt="Size Chart"
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>

            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute -top-4 -right-4 cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl  transition focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {showLogin && (
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      )}

      <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }
                .animate-shake { animation: shake 0.6s ease-in-out; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
    </>
  )
}

export default QuickViewModal
