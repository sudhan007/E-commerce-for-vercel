import { useEffect, useState, useCallback, useRef } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useCartContext } from '@/context/CartContext'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { _axios } from '@/lib/axios'
import { useSessionContext } from '@/context/SessionContext'
import LoginModal from './Loginpage'

const list = [
  { name: 'WOMEN', path: '/products?category=WOMEN', categoryValue: 'WOMEN' },
  { name: 'MEN', path: '/products?category=MEN', categoryValue: 'MEN' },
  { name: 'KIDS', path: '/products?category=KIDS', categoryValue: 'KIDS' },
  { name: 'LUXE', path: '/products?category=LUXE', categoryValue: 'LUXE' },
  {
    name: 'Find Store',
    path: '/products?category=store',
    categoryValue: 'store',
    icon: '/design-icons/store-location.svg',
    className: 'font-normal flex items-center gap-2.5',
  },
]

const searchExamples = ['T-shirts', 'Jeans', 'Shoes', 'Accessories']

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useSessionContext()

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { data: count } = useQuery({
    queryKey: ['cart-count'],
    queryFn: async () => {
      const res = await _axios.get(`/user/cart/count?userId=${session?._id}`)
      return res.data.count
    },
    enabled: !!session?._id,
  })

  const getCurrentCategory = () => {
    if (location.pathname === '/products') {
      let searchParams: URLSearchParams
      if (typeof location.search === 'string') {
        searchParams = new URLSearchParams(location.search)
      } else if (location.search && typeof location.search === 'object') {
        const entries = Object.entries(location.search)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]) as [string, string][]
        searchParams = new URLSearchParams(entries)
      } else {
        searchParams = new URLSearchParams()
      }
      return searchParams.get('category')?.toUpperCase() ?? null
    }
    return null
  }

  // Get search query from URL
  const getSearchQuery = () => {
    if (location.pathname === '/products') {
      let searchParams: URLSearchParams
      if (typeof location.search === 'string') {
        searchParams = new URLSearchParams(location.search)
      } else if (location.search && typeof location.search === 'object') {
        const entries = Object.entries(location.search)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]) as [string, string][]
        searchParams = new URLSearchParams(entries)
      } else {
        searchParams = new URLSearchParams()
      }
      return searchParams.get('q') ?? ''
    }
    return ''
  }

  const handleBasket = () => {
    navigate({
      to: '/order',
      search: { checkOutType: 'cart' },
    })
  }

  const currentCategory = getCurrentCategory()

  const [search, setSearch] = useState(getSearchQuery())
  const [isSideBarOpen, setIsSideBarOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  const [openGender, setOpenGender] = useState<string | null>(currentCategory)
  const [showLogin, setShowLogin] = useState(false)

  // Update search state when URL changes (including refresh)
  useEffect(() => {
    const urlSearchQuery = getSearchQuery()
    setSearch(urlSearchQuery)
  }, [location.search, location.pathname])

  // Debounced search handler
  const performSearch = useCallback(
    (searchValue: string) => {
      if (searchValue.trim()) {
        navigate({
          to: '/products',
          search: { q: searchValue.trim(), page: 1 },
        })
      } else {
        // If search is empty and we're on products page, remove the search param
        if (location.pathname === '/products') {
          const currentParams = new URLSearchParams(
            typeof location.search === 'string'
              ? location.search
              : new URLSearchParams(
                  Object.entries(location.search || {})
                    .filter(([, v]) => v !== undefined)
                    .map(([k, v]) => [k, String(v)]) as [string, string][],
                ).toString(),
          )
          currentParams.delete('q')
          const newSearch: any = {}
          currentParams.forEach((value, key) => {
            newSearch[key] = value
          })
          navigate({
            to: '/products',
            search: newSearch,
          })
        }
      }
    },
    [navigate, location.pathname, location.search],
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value)
    }, 500) // 500ms debounce delay
  }

  // Handle search submission (immediate search on Enter)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    performSearch(search)
    setShowSearch(false)
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e as any)
    }
  }

  const handleToggleSideBar = () => {
    setIsSideBarOpen((prev) => !prev)
  }

  const handleNavigation = (path: string) => {
    navigate({ to: path })
    setIsSideBarOpen(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % searchExamples.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSideBarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setOpenGender(currentCategory)
  }, [currentCategory])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const isActive = (categoryValue: string) => {
    return currentCategory === categoryValue.toUpperCase()
  }

  const checkAuthentication = (destination: string) => {
    const isLoggedIn = session?._id !== undefined
    if (!isLoggedIn) {
      setShowLogin(true)
      return false
    }
    navigate({ to: destination })
    return true
  }

  return (
    <>
      <header className="flex justify-between items-center h-18 relative px-2 lg:px-5 sm:shadow-custom">
        <Menu
          onClick={handleToggleSideBar}
          className="lg:hidden cursor-pointer"
        />

        {/* Desktop Nav */}
        <ul className="gap-3 hidden lg:flex">
          {list.map((item) => {
            const active = isActive(item.categoryValue)
            return (
              <li
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`
                  text-[#000000] text-[16px] p-1.5 font-sans font-medium 
                  cursor-pointer transition-all duration-200
                  ${active ? 'text-white bg-primary' : 'hover:text-white hover:bg-primary '}
                  ${item.className || ''}
                `}
              >
                {item.icon && (
                  <img src={item.icon} alt="" className="inline w-5 h-5 mr-2" />
                )}
                {item.name}
              </li>
            )
          })}
        </ul>

        <div className="absolute ml-8 lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
          <img
            onClick={() => navigate({ to: '/' })}
            src="/logo.png"
            alt="Logo"
            className="cursor-pointer w-24 md:w-auto"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4.5">
          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="h-[46px] relative hidden xl:block"
          >
            <Search className="absolute left-3 w-6 h-6 text-primary pointer-events-none z-10 top-1/2 -translate-y-1/2" />
            {!search && (
              <div className="absolute left-12 top-1/2 -translate-y-1/2 font-sans font-light text-[#828999] pointer-events-none select-none flex items-center h-6 overflow-hidden">
                <span>Search products </span>
                <span
                  className="font-medium inline-block relative h-6 ml-1 overflow-hidden"
                  style={{ width: '100px' }}
                >
                  {searchExamples.map((example, index) => (
                    <span
                      key={index}
                      className="absolute left-0 top-0 transition-all duration-500 ease-in-out block whitespace-nowrap"
                      style={{
                        transform: `translateY(${(index - currentExampleIndex) * 100}%)`,
                        opacity: index === currentExampleIndex ? 1 : 0,
                      }}
                    >
                      "{example}"
                    </span>
                  ))}
                </span>
              </div>
            )}
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              className="pl-12 pr-4 bg-[#F9FCFF] h-[46px] w-[274px] text-base border border-[#E8E8E8] rounded-[10px] focus:outline-none placeholder-transparent"
              placeholder="Search..."
            />
          </form>

          {/* Mobile Icons */}
          {!showSearch && (
            <img
              src="/design-icons/search.svg"
              onClick={() => setShowSearch(true)}
              className="h-4.5 w-4.5 sm:w-6 sm:h-6 xl:hidden cursor-pointer"
              alt="Search"
            />
          )}
          <img
            onClick={() => {
              checkAuthentication('/profile/orders')
            }}
            src="/design-icons/user.svg"
            className="h-4.5 w-4.5 sm:w-6 sm:h-6 cursor-pointer hidden lg:block "
            alt="User"
          />
          <img
            onClick={() => {
              checkAuthentication('/profile/')
            }}
            src="/design-icons/user.svg"
            className="h-4.5 w-4.5 sm:w-6 sm:h-6 cursor-pointer block lg:hidden "
            alt="User"
          />
          <img
            onClick={() => {
              checkAuthentication('/wishlist')
            }}
            src="/design-icons/heart.svg"
            className="h-4.5 w-4.5 sm:w-6 sm:h-6 cursor-pointer"
            alt="Wishlist"
          />
          <Button
            disabled={(session?._id ? false : true) || count === 0}
            onClick={handleBasket}
            className="flex font-serif font-normal items-center gap-2 sm:h-[46px] sm:w-[109px] rounded-[8px] disabled:bg-[#E8E8E8] hover:bg-primary hover:text-white cursor-pointer"
          >
            <img
              src="/design-icons/basket.svg"
              className="h-4.5 w-4.5 sm:min-w-[20px] sm:min-h-[20px]"
              alt="Basket"
            />
            <span className="hidden sm:block">
              {count ? `${count} ${count > 1 ? 'Items' : 'Item'}` : `Basket`}
            </span>
          </Button>
        </div>
      </header>

      {showLogin && (
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      )}

      {/* Mobile Search Bar */}
      {showSearch && (
        <form
          onSubmit={handleSearchSubmit}
          className="p-2 relative xl:hidden w-full bg-white border-b"
        >
          <Search className="absolute left-5 w-6 h-6 text-primary pointer-events-none z-10 top-1/2 -translate-y-1/2" />
          {!search && (
            <div className="absolute left-12 top-1/2 -translate-y-1/2 font-sans font-light text-[#828999] pointer-events-none select-none flex items-center h-6 overflow-hidden">
              <span>Search products </span>
              <span
                className="font-medium inline-block relative h-6 ml-1 overflow-hidden"
                style={{ width: '100px' }}
              >
                {searchExamples.map((example, index) => (
                  <span
                    key={index}
                    className="absolute left-0 top-0 transition-all duration-500 ease-in-out block whitespace-nowrap"
                    style={{
                      transform: `translateY(${(index - currentExampleIndex) * 100}%)`,
                      opacity: index === currentExampleIndex ? 1 : 0,
                    }}
                  >
                    "{example}"
                  </span>
                ))}
              </span>
            </div>
          )}
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10 py-3 bg-[#F9FCFF] w-full text-base border border-[#E8E8E8] rounded-[10px] focus:outline-none"
            autoFocus
          />
          <X
            onClick={() => {
              setShowSearch(false)
              setSearch('')
              performSearch('')
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer text-gray-500"
          />
        </form>
      )}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isSideBarOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={handleToggleSideBar}
      />

      {/* Mobile Sidebar with Real Categories */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-lg transition-transform duration-300 overflow-y-auto ${isSideBarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <img src="/logo.png" alt="Logo" className="w-[96px]" />
          <button onClick={handleToggleSideBar}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col">
          {list.slice(0, 4).map((item) => {
            const isGenderActive = isActive(item.categoryValue)
            const isOpen = openGender === item.categoryValue

            return (
              <GenderAccordion
                key={item.name}
                item={item}
                isOpen={isOpen}
                isActive={isGenderActive}
                onToggle={() =>
                  setOpenGender(isOpen ? null : item.categoryValue)
                }
                onNavigate={() => setIsSideBarOpen(false)}
              />
            )
          })}

          {/* Find Store */}
          <a
            href="/products?category=store"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation('/products?category=store')
            }}
            className="flex items-center gap-3 px-6 py-5 border-t border-gray-100 text-gray-900 font-normal text-lg hover:bg-gray-50"
          >
            <img
              src="/design-icons/store-location.svg"
              alt="Store"
              className="w-6 h-6"
            />
            Find Store
          </a>
        </div>
      </div>
    </>
  )
}

function GenderAccordion({
  item,
  isOpen,
  isActive,
  onToggle,
  onNavigate,
}: {
  item: { name: string; categoryValue: string }
  isOpen: boolean
  isActive: boolean
  onToggle: () => void
  onNavigate: () => void
}) {
  const location = useLocation()

  // Properly parse query params
  const searchParams = new URLSearchParams(location.search)
  const selectedCategory = searchParams.get('category')
  const selectedSubcategory = searchParams.get('subcategory')

  // Determine if this gender/category is active (either selected directly or has active subcategory)
  const isGenderActive = selectedCategory === item.categoryValue

  // Load subcategories only when accordion is open
  const { data, isLoading } = useInfiniteQuery({
    queryKey: ['categories', item.categoryValue],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await _axios.get('/user/categories', {
        params: { page: pageParam, limit: 50, category: item.categoryValue },
      })
      return res.data.categories
    },
    getNextPageParam: () => undefined,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  const categories = data?.pages.flat() ?? []

  return (
    <div className="border-b border-gray-100">
      {/* Main Gender Button */}
      <button
        onClick={onToggle}
        className={`
          w-full px-6 py-5 flex justify-between items-center text-left text-lg font-medium
          transition-all duration-200
          ${isGenderActive || isActive ? 'text-primary font-bold bg-gray-50' : 'text-gray-900'}
        `}
      >
        <span>{item.name}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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

      {/* Subcategories Dropdown */}
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="bg-gray-50 py-2">
          {/* All Products Link */}
          <button
            onClick={() => {
              onNavigate()
              window.location.href = `/products?category=${item.categoryValue}`
            }}
            className={`w-full text-left px-10 py-3 font-normal transition-colors
              ${isGenderActive && !selectedSubcategory ? 'text-primary font-normal bg-white' : 'text-[#000000] hover:bg-white'}`}
          >
            All
          </button>

          {/* Loading State */}
          {isLoading ? (
            <div className="px-10 py-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-32 bg-gray-200 animate-pulse rounded"
                />
              ))}
            </div>
          ) : (
            /* Subcategories List */
            categories.map((cat: any) => {
              const isSubcategoryActive =
                isGenderActive && selectedSubcategory === cat.name

              return (
                <button
                  key={cat._id}
                  onClick={() => {
                    onNavigate()
                    window.location.href = `/products?category=${item.categoryValue}&subcategory=${cat.name}`
                  }}
                  className={`
                    block w-full text-left px-10 py-3 text-gray-700 transition-colors
                    ${
                      isSubcategoryActive
                        ? 'text-primary font-normal bg-white'
                        : 'hover:text-primary hover:bg-white'
                    }
                  `}
                >
                  {cat.name}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
