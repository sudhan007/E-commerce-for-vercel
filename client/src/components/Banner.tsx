// export default function Banner() {
//   return (
//     <section className="w-full h-[200px] md:h-[75vh] bg-gray-100 relative overflow-hidden">
//       <img
//         src="/banner.png"
//         alt="Banner"
//         className="absolute w-full h-full"
//         style={{ objectPosition: 'center' }}
//       />
//     </section>
//   )
// }
'use client'

import * as React from 'react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

// Sample banner images for a dress shop - replace with your actual images
const bannerImages = [
  {
    id: 1,
    src: '/elegant-summer-dresses-collection-fashion-boutique.jpg',
    alt: 'Summer Collection - Elegant Dresses',
    title: 'Summer Collection 2024',
    subtitle: 'Discover our latest elegant summer dresses',
  },
  {
    id: 2,
    src: '/formal-evening-gowns-luxury-dresses.jpg',
    alt: 'Evening Gowns Collection',
    title: 'Evening Elegance',
    subtitle: 'Stunning gowns for your special moments',
  },
  {
    id: 3,
    src: '/casual-day-dresses-modern-fashion.jpg',
    alt: 'Casual Dress Collection',
    title: 'Everyday Comfort',
    subtitle: 'Stylish casual dresses for every occasion',
  },
  {
    id: 4,
    src: '/wedding-bridal-dresses-white-gowns.jpg',
    alt: 'Bridal Collection',
    title: 'Bridal Dreams',
    subtitle: 'Find your perfect wedding dress',
  },
]

export default function Banner() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  // Autoplay plugin configuration
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, active: true }),
  )

  React.useEffect(() => {
    if (!api) return

    // Update current slide index
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <section className="w-full relative">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
        // onMouseEnter={plugin.current.stop}
        // onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {bannerImages.map((image) => (
            <CarouselItem key={image.id}>
              <div className="relative font-jost  w-full h-[200px] md:h-[400px] lg:h-[75vh] overflow-hidden">
                <img
                  src={image.src || '/placeholder.svg'}
                  alt={image.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />

                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-12 lg:px-24">
                  <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 max-w-2xl text-balance">
                    {image.title}
                  </h2>
                  <p className="text-white/90 text-base md:text-xl lg:text-2xl max-w-xl text-pretty">
                    {image.subtitle}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons - Hidden on mobile, visible on md+ */}
        <CarouselPrevious className="hidden md:flex cursor-pointer  left-4 lg:left-8 size-10 lg:size-12 bg-white/90 hover:bg-white border-none shadow-lg" />
        <CarouselNext className="hidden md:flex cursor-pointer  right-4 lg:right-8 size-10 lg:size-12 bg-white/90 hover:bg-white border-none shadow-lg" />

        {/* Dot Indicators */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                current === index
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75',
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}
