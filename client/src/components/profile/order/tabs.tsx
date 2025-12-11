interface OrderTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function OrderTabs({ activeTab, onTabChange }: OrderTabsProps) {
  const tabs = [
    { id: 'PENDING', label: 'Pending' },
    { id: 'DELIVERED', label: 'Delivered' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ]

  return (
    <div className="flex items-center gap-2  md:gap-5 font-jost w-full overflow-x-scroll scrollbar-hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={` px-2  md:px-6  py-1 md:py-3 rounded-md cursor-pointer  font-medium text-base transition-all whitespace-nowrap
              ${isActive ? 'bg-[#F9FCFF] text-[#0E3051] border border-[#0E3051] ' : 'text-black hover:bg-gray-100'}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
