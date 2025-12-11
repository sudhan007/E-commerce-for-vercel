import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { _axios } from '@/lib/axios'
import { Minus, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSessionContext } from '@/context/SessionContext'
import LoginModal from '@/components/Loginpage'
import { useCartContext } from '@/context/CartContext'
import RecommendedProperties from '@/components/RecomentedProperties'
import {
  useQuickBuyContext,
  type QuickBuyProduct,
} from '@/context/QuickBuy-Context'
import PincodeChecker from '@/components/PinCodeTracker'

export const Route = createFileRoute('/products/$id')({
  component: RouteComponent,
})

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
    productCode: string
    description: string
    brandName: string
    productName: string
    pattern?: string
    sizeChartImage?: string
    isFavourite: boolean
  }
  variants: Variant[]
}

interface AddToCardBody {
  productId: string
  quantity: number
  userId: string
  variantId: string | undefined
}

function RouteComponent() {
  const { id: productId } = Route.useParams()
  const [canProceed, setCanProceed] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const cart = useCartContext()
  const { setCartOpen } = cart
  const quickBuy = useQuickBuyContext()
  const { setQuickBuyOpen, setQuickBuyProduct } = quickBuy
  const [localQuantity, setLocalQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const session = useSessionContext()
  const queryClient = useQueryClient()
  const [shake, setShake] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const minSwipeDistance = 50

  const { data, isLoading } = useQuery({
    queryKey: ['product-details', productId],
    queryFn: async (): Promise<ProductResponse> => {
      let api = `/user/products/${productId}`
      if (session?._id) {
        api += `${api.includes('?') ? '&' : '?'}userId=${session._id}`
      }
      const res = await _axios.get(api)
      return res.data.data
    },
    enabled: !!productId,
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
        queryKey: ['product-details', productId],
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
        queryKey: ['product-details', productId],
      })
      if (data?.message) {
        toast.success(data?.message)
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add product to favorites')
    },
  })

  const selectedVariant: any = useMemo(() => {
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
    onSuccess: () => {},
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update quantity')
      console.error(err)
      setLocalQuantity(serverQuantity > 0 ? serverQuantity : 1)
    },
  })

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

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!data?.variants) return

    const uniqueColors = Array.from(
      new Set(data.variants.map((v) => v.color).filter(Boolean)),
    )

    if (uniqueColors.length > 0 && !selectedColor) {
      setSelectedColor(uniqueColors[0])
    }
  }, [data, selectedSize, selectedColor])

  const isSizeAvailableForColor = useCallback(
    (size: string, color: string) => {
      if (!data?.variants) return false
      return data.variants.some(
        (v) => v.size === size && v.color === color && v.stock > 0,
      )
    },
    [data?.variants],
  )

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedVariant?._id])

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

  useEffect(() => {
    if (!selectedSize) {
      setLocalQuantity(1)
      return
    }

    if (isCurrentVariantInCart && serverQuantity > 0) {
      setLocalQuantity(serverQuantity)
    } else if (!isCurrentVariantInCart) {
      setLocalQuantity(1)
    }
  }, [isCurrentVariantInCart, serverQuantity, selectedVariant, selectedSize])

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe || isRightSwipe) {
      const images = selectedVariant?.images || []
      if (images.length <= 1) return

      if (isLeftSwipe) {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      } else if (isRightSwipe) {
        setCurrentImageIndex(
          (prev) => (prev - 1 + images.length) % images.length,
        )
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  if (isLoading) {
    return (
      <div className="font-sans flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="font-sans flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

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
  const hasMeasurements =
    selectedVariant?.bustSize || selectedVariant?.bottomLength

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setSelectedSize(null)
    setLocalQuantity(1)
  }

  const handleSizeClick = (size: string) => {
    setSelectedSize(size)
    setLocalQuantity(1)
    queryClient.invalidateQueries({ queryKey: ['product-details', productId] })
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
        ? Math.min(localQuantity + 1, maxStock)
        : Math.max(localQuantity - 1, 1)

    if (newQuantity === localQuantity) return

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
      toast.error('Please select a size')
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
  }
  const handleBuyNowClick = () => {
    if (!checkAuthentication()) return

    const productToBuy: QuickBuyProduct = {
      productId: product?._id ?? '',
      productName: product?.productName ?? '',
      brandName: product?.brandName ?? '',
      variantId: selectedVariant._id ?? '',
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: selectedVariant.priceDetails?.price ?? 0,
      strikeAmount: selectedVariant.priceDetails?.strikeAmount,
      image: selectedVariant.images[0] || '/placeholder.jpg',
      quantity: localQuantity,
    }

    setQuickBuyProduct(productToBuy)
    setQuickBuyOpen(true)
  }

  const handleFavouriteClick = () => {
    if (!checkAuthentication()) return
    addToFavouriteMutation.mutate(product._id)
  }

  const keywords = [product.productName, product.brandName]
  return (
    <>
      <div className="font-sans md:min-h-screen bg-white py-0 md:py-8 px-0 md:px-8 mt-5 md:mt-0">
        <div className="w-[90%] mx-auto">
          <div className="grid md:grid-cols-2 gap-0 md:gap-5 lg:gap-5">
            {/* Product Image Section */}
            <div className="flex md:hidden flex-col border-b pb-2 md:pb-0">
              <p className="text-sm font-normal text-primary md:text-[16px] capitalize">
                {product.brandName}
              </p>
              <h1 className="text-[#1F1F1F] font-medium text-base md:text-[24px] uppercase tracking-wide">
                {product.productName}
              </h1>
            </div>
            <div className="w-full">
              <div className="relative w-full md:h-[600px] lg:h-[700px]">
                {/* Mobile Image with Swipe */}
                <div
                  className="md:hidden"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={
                      selectedVariant?.images[currentImageIndex] ||
                      '/placeholder.jpg'
                    }
                    alt={product.productName}
                    className="h-full w-full object-contain rounded-none"
                  />
                </div>

                {/* Desktop Images */}
                <div className="md:flex hidden flex-col max-h-[800px] overflow-auto   scrollbar-hidden">
                  {selectedVariant?.images.map((image: any, index: any) => (
                    <img
                      key={index}
                      src={image}
                      alt={product.productName}
                      className="h-full w-full object-contain rounded-none pt-5"
                    />
                  ))}
                </div>

                {/* Dots Navigation - Mobile Only */}
                {selectedVariant?.images &&
                  selectedVariant.images.length > 1 && (
                    <div className="absolute bottom-4 md:hidden left-1/2 transform -translate-x-1/2 flex gap-2">
                      {selectedVariant.images.map((_: any, index: any) => (
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

            {/* Product Details Section */}
            <div className="w-full flex flex-col ">
              <div className="md:flex hidden flex-col border-b pb-2 md:pb-0">
                <p className="text-sm font-normal text-primary md:text-[16px] capitalize">
                  {product.brandName}
                </p>
                <h1 className="text-[#1F1F1F] font-medium text-base md:text-[24px] uppercase tracking-wide">
                  {product.productName}
                </h1>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {hasDiscount !== 0 && mrp && (
                  <span className="text-xs md:text-sm text-[#828999] font-semibold flex gap-1 md:gap-2 items-center">
                    <span className="text-[#1F1F1F] text-xs md:text-sm font-normal">
                      MRP
                    </span>
                    <span className="line-through text-base md:text-[20px]">
                      ₹{mrp?.toLocaleString('en-IN')}
                    </span>
                  </span>
                )}
                <span className="text-[#000000] font-medium text-base md:text-[20px]">
                  ₹{price?.toLocaleString('en-IN')}
                </span>
                {hasDiscount !== 0 && (
                  <span className="text-[#E51C23] text-xs md:text-[20px] font-normal">
                    {offerPercentage}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm font-light text-[#828999] mt-1">
                Inclusive of all taxes
              </p>

              {/* Size Selection */}
              <div className="mt-3 md:mt-2 bg-[#F1F3F5] p-3 rounded-[4px]">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <img
                      src="/design-icons/tape-measure1.png"
                      alt="size guide"
                      className="w-5 h-5 md:w-6 md:h-6"
                    />
                    <span className="text-xs md:text-base font-normal text-[#1F1F1F]">
                      Select Perfect Fit To Your Size
                    </span>
                  </div>
                  {product.sizeChartImage && (
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-xs md:text-base cursor-pointer text-primary underline font-medium whitespace-nowrap"
                    >
                      View Size Chart
                    </button>
                  )}
                </div>

                <div
                  className={`flex flex-wrap gap-2 md:gap-3 transition-all ${shake ? 'animate-shake' : ''}`}
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
                        className={`min-w-10 md:min-w-12 min-h-7 px-2 text-xs md:text-sm text-[#1F1F1F] font-normal rounded-[2px] transition-all uppercase ${
                          selectedSize === size
                            ? 'bg-[#F1F3F5] border-primary cursor-pointer border'
                            : disabled
                              ? 'text-gray-400 border-gray-300 cursor-not-allowed opacity-50 border-2'
                              : 'bg-white cursor-pointer hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Measurements */}
              {hasMeasurements && (
                <div className="flex gap-2 mt-2 flex-wrap text-xs md:text-sm">
                  {selectedVariant.bustSize && (
                    <span className="font-light text-[#828999]">
                      Product Bust:{' '}
                      <span className="text-[#000000] font-medium">
                        {selectedVariant.bustSize} in
                      </span>
                    </span>
                  )}
                  {selectedVariant.bottomLength && (
                    <span className="font-light text-[#828999]">
                      Product Bottom Length:{' '}
                      <span className="text-[#000000] font-medium">
                        {selectedVariant.bottomLength} in
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Color and Pattern */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mt-3 flex-wrap md:border-b md:pb-5 md:border-gray-300 justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="font-medium text-sm md:text-[18px] text-[#1F1F1F]">
                    Colour:
                  </span>
                  <div className="flex gap-2">
                    {uniqueColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        style={{ backgroundColor: color }}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-all cursor-pointer ${
                          selectedColor === color
                            ? 'scale-110 ring-2 ring-primary/50'
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
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="font-medium text-sm md:text-[18px] text-[#1F1F1F]">
                      Pattern:
                    </span>
                    <span className="px-1 bg-white border border-[#828999] rounded-[2px] text-xs md:text-[16px] font-normal uppercase">
                      {product.pattern}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions - Mobile Layout */}
              <div className="flex fixed p-2 z-40 shadow-custom md:shadow-none bg-white w-full justify-between py-8 md:py-0   md:justify-start md:static left-0 bottom-0 flex-row items-stretch md:items-center gap-3 md:gap-4 mt-6 md:mt-8">
                <div className="flex md:contents gap-3">
                  <Button
                    onClick={handleFavouriteClick}
                    className="bg-transparent h-11 md:h-full flex items-center justify-center w-11 md:max-w-[50px] cursor-pointer hover:bg-transparent border border-[#0E3051] rounded-[4px] p-0"
                  >
                    <img
                      src={`${product.isFavourite ? '/design-icons/red-heart.svg' : '/design-icons/heart1.svg'}`}
                      alt=""
                      className="w-5 h-5 md:scale-150"
                    />
                  </Button>

                  <div className="flex items-center justify-between border border-primary rounded h-11 md:h-12 flex-1 md:flex-initial">
                    <button
                      onClick={() => handleQuantityClick('decrement')}
                      className="w-11 md:w-12 h-11 md:h-12 text-center flex justify-center cursor-pointer items-center  disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={localQuantity <= 1}
                    >
                      <Minus className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <span className="w-12 md:w-16 text-center font-normal text-lg md:text-xl flex items-center justify-center">
                      {localQuantity}
                    </span>
                    <button
                      onClick={() => handleQuantityClick('increment')}
                      className="w-11 md:w-12 h-11 md:h-12 text-center flex justify-center cursor-pointer items-center  disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        selectedVariant
                          ? localQuantity >= selectedVariant.stock
                          : false
                      }
                    >
                      <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>

                {isCurrentVariantInCart && selectedSize ? (
                  <button
                    onClick={handleGoToBasket}
                    className="w-full md:flex-1 h-11 md:h-12 bg-primary cursor-pointer text-white font-medium text-sm md:text-lg rounded uppercase tracking-wider hover:bg-[#083050] transition-all"
                  >
                    GO TO BASKET
                  </button>
                ) : (
                  <button
                    onClick={addToCart}
                    className="w-full md:flex-1 h-11 md:h-12 bg-primary cursor-pointer text-white font-medium text-sm md:text-[18px] rounded uppercase tracking-wider hover:bg-[#083050] transition-all"
                  >
                    Add to Cart{' '}
                    <span className="font-normal text-xs md:text-[16px]">
                      (₹
                      {price && (price * localQuantity).toLocaleString('en-IN')}
                      )
                    </span>
                  </button>
                )}
                <button
                  onClick={handleBuyNowClick}
                  className="w-full md:flex-1 h-11 md:h-12  cursor-pointer text- border border-primary font-medium text-sm md:text-lg rounded uppercase tracking-wider  transition-all"
                >
                  BUY NOW
                </button>
              </div>

              {/* Delivery Info */}
              <div className="border-t border-gray-200 mt-6 md:mt-8 pt-4 md:pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                  {/* <span className="font-medium text-sm md:text-[18px] text-[#1F1F1F] uppercase">
                    Select Delivery Address
                  </span> */}
                  {/* <div className="text-[#329911] font-normal flex gap-2 items-center text-xs md:text-base">
                    <img
                      src="/design-icons/delivery-truck.svg"
                      alt="delivery"
                      className="w-4 h-4 md:w-5 md:h-5"
                    />
                    <span className="text-xs md:text-base">
                      Estimated Delivery: Friday, 28 Nov 2025
                    </span>
                  </div> */}
                </div>
                <p className="text-primary flex items-center gap-2 font-normal text-sm md:text-[18px]">
                  <img
                    src="/design-icons/location.svg"
                    alt="location"
                    className="w-4 h-4 md:w-5 md:h-5"
                  />
                  Select to see availability to{' '}
                  <span className="font-semibold flex">
                    your location <ChevronDown className="" />
                  </span>
                </p>

                <PincodeChecker
                  onServiceabilityChange={(result) => {
                    setCanProceed(result?.isServiceable || false)
                  }}
                />
              </div>

              {/* Product Description */}
              <div className="mt-3 border-t border-gray-200">
                <button
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                  className="w-full flex justify-between items-center py-3 md:py-4 text-left"
                >
                  <h3 className="font-sans font-medium text-[#1F1F1F] text-sm md:text-[18px] uppercase">
                    PRODUCT DESCRIPTION
                  </h3>
                  <svg
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 ${
                      isDescriptionOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isDescriptionOpen ? 'max-h-96 pb-4' : 'max-h-0'
                  }`}
                >
                  <p className="text-xs md:text-[16px] text-gray-600 mt-2">
                    Product code: {product.productCode}
                  </p>
                  <p className="font-normal mt-3 md:mt-6 text-xs md:text-[16px] text-gray-600">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecommendedProperties keywords={keywords} title="RECOMMENDED PRODUCTS" />
      {/* Size Chart Modal */}
      {showSizeChart && product.sizeChartImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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
              className="absolute -top-2 -right-2 cursor-pointer flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white text-black shadow-xl hover:bg-gray-100 transition text-lg md:text-xl"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
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
            `}</style>
    </>
  )
}
