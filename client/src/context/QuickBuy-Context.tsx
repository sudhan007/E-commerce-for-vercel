// src/context/CartContext.tsx
import React, { createContext, useContext, useState } from 'react'

// Define the shape without allowing null

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

type QuickBuyContextType = {
  isQuickBuyOpen: boolean
  setQuickBuyOpen: (isOpen: boolean) => void
  quickBuyProduct: QuickBuyProduct | null
  setQuickBuyProduct: (product: QuickBuyProduct | null) => void
}

// Create context with undefined as initial (standard pattern)
const QuickBuyContext = createContext<QuickBuyContextType | undefined>(
  undefined,
)

export default function QuickBuyContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isQuickBuyOpen, setQuickBuyOpen] = useState(false)
  const [quickBuyProduct, setQuickBuyProduct] =
    useState<QuickBuyProduct | null>(null)
  return (
    <QuickBuyContext.Provider
      value={{
        isQuickBuyOpen,
        setQuickBuyOpen,
        quickBuyProduct,
        setQuickBuyProduct,
      }}
    >
      {children}
    </QuickBuyContext.Provider>
  )
}

// Custom hook with proper error
export const useQuickBuyContext = (): QuickBuyContextType => {
  const context = useContext(QuickBuyContext)
  if (!context) {
    throw new Error(
      'useQuickbuyContext must be used within a QuickBuyContextProvider',
    )
  }
  return context
}
