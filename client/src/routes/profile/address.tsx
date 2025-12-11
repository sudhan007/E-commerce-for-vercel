import AddressDrawer from '@/components/AddressDrawer'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { _axios } from '@/lib/axios'
import { useSessionContext } from '@/context/SessionContext'
import { toast } from 'sonner'

export const Route = createFileRoute('/profile/address')({
  component: RouteComponent,
})

interface Address {
  _id: string
  userId: string
  receiverName: string
  receiverMobile: string
  flatorHouseno: string
  area: string
  landmark?: string
  addressType: 'Home' | 'Office'
  isPrimaryAddress: boolean
}

function RouteComponent() {
  const session = useSessionContext()
  const userId = session?._id

  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false)
  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('create')
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  // Fetch addresses
  const {
    data: addressesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: async () => {
      const res = await _axios.get(`/user/address/${userId}?type=all`)
      return res.data
    },
    enabled: !!userId,
  })

  const addresses: Address[] = addressesData?.data || []

  const handleEdit = (address: Address) => {
    setSelectedAddress(address)
    setMode('edit')
    setAddressDrawerOpen(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await _axios.delete(`/user/address/${addressId}`)
      if (response.status === 200) {
        toast.success('Address deleted successfully')
        refetch()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete address')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-2  md:p-6">
      <div className="flex justify-end md:justify-between items-center mb-6">
        <div className="md:block hidden">
          <h1 className="text-2xl font-semibold text-gray-900">
            Delivery Address
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your delivery addresses
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedAddress(null)
            setMode('create')
            setAddressDrawerOpen(true)
          }}
          className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded font-light text-sm transition-colors flex items-center gap-2"
        >
          + New Address
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="mb-4">
              <img
                src="/design-icons/home-address.svg"
                alt="No addresses"
                className="w-16 h-16 mx-auto opacity-50"
              />
            </div>
            <p className="text-gray-600 font-medium mb-2">No addresses found</p>
            <p className="text-sm text-gray-500 mb-4">
              Add your first address to continue
            </p>
            <button
              onClick={() => {
                setSelectedAddress(null)
                setMode('create')
                setAddressDrawerOpen(true)
              }}
              className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded font-medium text-sm transition-colors inline-flex items-center gap-2"
            >
              + Add Address
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                address.isPrimaryAddress
                  ? 'border border-primary'
                  : 'border border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start gap-6">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                    <img
                      src={
                        address.addressType === 'Home'
                          ? '/design-icons/house.svg'
                          : '/design-icons/office-address.svg'
                      }
                      alt="icon"
                      className="w-6 h-6"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {address.addressType}
                      </h3>
                      {address.isPrimaryAddress && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                          Primary Address
                        </span>
                      )}
                    </div>

                    <p className="text-base text-[#1F1F1F] md:truncate hidden md:block">
                      {address.flatorHouseno}, {address.area}
                      {address.landmark && `, ${address.landmark}`}
                    </p>
                  </div>
                </div>

                <div className=" flex md:hidden gap-2 items-center justify-end">
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="py-1 cursor-pointer px-4  text-primary font-normal transition rounded text-[14px] font-serif"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleEdit(address)}
                    className="py-1 cursor-pointer px-4 text-[14px] bg-[#0E3051] font-serif text-white rounded hover:bg-[#0a2642] transition font-normal "
                  >
                    Edit
                  </button>
                </div>

                <div className="text-right md:flex flex-col items-end hidden">
                  <p className="text-sm text-[#828999] font-medium">
                    Receiver Detail:&nbsp;
                    <span className="font-normal text-black text-base">
                      {address.receiverName}, {address.receiverMobile}
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-base text-[#1F1F1F] pt-1 md:hidden block">
                {address.flatorHouseno}, {address.area}
                {address.landmark && `, ${address.landmark}`}
              </p>

              <div className=" hidden   md:flex gap-2 items-center justify-end">
                <button
                  onClick={() => handleDelete(address._id)}
                  className="py-1 cursor-pointer px-4  text-primary font-normal transition rounded text-[14px] font-serif"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(address)}
                  className="py-1 cursor-pointer px-4 text-[14px] bg-[#0E3051] font-serif text-white rounded hover:bg-[#0a2642] transition font-normal "
                >
                  Edit
                </button>
              </div>
              <div className=" flex flex-col pt-3 md:hidden  ">
                <p className="text-sm text-[#828999] font-medium">
                  Receiver Detail:&nbsp;
                  <span className="font-normal text-black text-base">
                    {address.receiverName}, {address.receiverMobile}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <AddressDrawer
        isOpen={addressDrawerOpen}
        onClose={() => {
          setAddressDrawerOpen(false)
          setSelectedAddress(null)
        }}
        isDirectClose={true}
        mode={mode}
        setMode={setMode}
        selectedAddress={selectedAddress}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
