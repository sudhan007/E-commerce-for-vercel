import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  Contact,
  LogOut,
  MessageCircleQuestionMark,
  ShoppingCart,
  Truck,
} from 'lucide-react'

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const menu = [
    {
      label: 'Orders History',
      link: '/profile/orders',
      icon: <ShoppingCart />,
    },
    { label: 'Address Management', link: '/profile/address', icon: <Truck /> },
    {
      label: 'FAQs',
      link: '/profile/faq',
      icon: <MessageCircleQuestionMark />,
    },
    { label: 'Support', link: '/profile/support', icon: <Contact /> },
    { label: 'Logout', link: '/logout', icon: <LogOut /> },
  ]
  const router = useRouter()
  const currentPath = router.history.location.pathname
  const isActive = (path: string) => currentPath === path

  return (
    <>
      {/* For Mobile use */}

      <div className=" bg-white font-jost block lg:hidden">
        <div className="p-4 text-center">
          <h1 className="text-2xl font-medium text-[#3C4242]">Hello Jhanvi</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome to your Account</p>
        </div>

        <nav className="px-2 space-y-1">
          {menu.map((item) => {
            const active = isActive(item.link)
            return (
              <Link
                key={item.link}
                to={item.link}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-base font-medium transition-all ${
                  active
                    ? 'bg-[#E8E8E8] text-black'
                    : 'text-[#828999] hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
