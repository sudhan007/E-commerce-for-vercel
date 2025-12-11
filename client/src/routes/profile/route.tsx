import ProfileSidebar from '@/components/profile/layout/ProfileSidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
  component: MyProfileLayout,
})

function MyProfileLayout() {
  return (
    <div className=" max-w-7xl mx-auto p-2  md:p-6 lg:flex gap-6 ">
      <aside className="hidden lg:block  w-64 sticky top-24 ">
        <ProfileSidebar />
      </aside>

      <main className="lg:flex-1">
        <Outlet />
      </main>
    </div>
  )
}
