import Banner from '@/components/Banner'
import ExploreCards from '@/components/ExploreCards'
import FooterBanner from '@/components/FooterBanner'
import HomePageProducts from '@/components/HomePageProducts'
import Icons from '@/components/Icons'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
  <div>
     <Banner />
     <Icons />
     <ExploreCards />
     <HomePageProducts />
     <FooterBanner />
  </div>
  )
}
