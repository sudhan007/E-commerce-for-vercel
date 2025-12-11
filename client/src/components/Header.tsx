import { useCartContext } from '@/context/CartContext'
import CartDrawer from './CartDrawer'
import Navbar from './Navbar'
import Quates from './Quates'

export default function Header() {
  const cart = useCartContext()
  const { isCartOpen, setCartOpen } = cart
  return (
    <>
      <Quates />
      <Navbar />
      {<CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />}
    </>
  )
}
