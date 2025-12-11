import { Link, useLocation } from '@tanstack/react-router'
import {
  Contact,
  LogOut,
  MessageCircleQuestionMark,
  ShoppingCart,
  Truck,
} from 'lucide-react'

export default function ProfileSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

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

  const isActive = (path: string) => currentPath === path

  return (
    <>
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 font-jost">
        <div className="pt-8 pb-6 px-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-10 bg-[#8A33FD] rounded-full" />
            <div>
              <h1 className="text-2xl font-medium text-[#3C4242]">
                Hello Jhanvi
              </h1>
            </div>
          </div>
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
