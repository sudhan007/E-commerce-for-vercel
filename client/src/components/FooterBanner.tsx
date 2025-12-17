import { useNavigate } from '@tanstack/react-router'

export default function FooterBanner() {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate({ to: path })
  }
  return (
    <section className=" w-[90%] mx-auto mt-5 lg:mt-20 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
        {/* Left Panel - Dark with Leaves */}
        <div className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
          <img
            src="/footerbanner2.png"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Tropical background"
          />

          {/* Content Overlay */}
          <div className="relative z-10 px-8 md:px-12 lg:px-14 py-12 w-full">
            <h2 className="text-white text-[28px] md:text-[32px] lg:text-[34px] font-extrabold mb-3 leading-[1.2] tracking-wide">
              WE MADE YOUR EVERYDAY
              <br />
              FASHION BETTER!
            </h2>
            <p className="text-white text-[13px] md:text-[20px] mb-6 max-w-[380px] leading-relaxed font-light tracking-wide">
              In our journey to improve everyday fashion, euphoria presents
              EVERYDAY wear range - Comfortable & Affordable fashion 24/7
            </p>
            <button
              onClick={() => {
                handleNavigation('/products?category=store')
              }}
              className="bg-white cursor-pointer  text-black text-[15px] font-medium px-10 py-2.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Right Panel - Yellow with People */}
        <div className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
          <img
            src="/footerbanner1.png"
            className="w-full h-full object-cover"
            alt="Fashion models"
          />
        </div>
      </div>
    </section>
  )
}
