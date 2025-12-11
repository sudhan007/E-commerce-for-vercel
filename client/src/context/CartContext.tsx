// src/context/CartContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Define the shape without allowing null
type CartContextType = {
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
};

// Create context with undefined as initial (standard pattern)
const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <CartContext.Provider value={{ isCartOpen, setCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook with proper error
export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartContextProvider');
  }
  return context;
};