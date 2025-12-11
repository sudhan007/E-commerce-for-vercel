'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Home as HomeIcon, Building2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { _axios } from '@/lib/axios'
import { useSessionContext } from '@/context/SessionContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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
  pincode: string
}

interface AddressFormData {
  receiverName: string
  receiverMobile: string
  flatorHouseno: string
  area: string
  landmark: string
  addressType: 'Home' | 'Office'
  isPrimaryAddress: boolean
  userId: string
  pincode: string
}

interface ValidationErrors {
  receiverName?: string
  receiverMobile?: string
  flatorHouseno?: string
  area?: string
  receiverMobileFormat?: string
}

interface AddressDrawerProps {
  isDirectClose?: boolean
  selectedAddress?: Address | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  mode?: 'list' | 'edit' | 'create'
  setMode?: (mode: 'list' | 'edit' | 'create') => void
}

export default function AddressDrawer({
  isDirectClose = false,
  isOpen,
  onClose,
  onSuccess,
  mode: externalMode,
  setMode: externalSetMode,
  selectedAddress: externalSelectedAddress,
}: AddressDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const session = useSessionContext()
  const userId = session?._id
  const queryClient = useQueryClient()

  const [internalMode, setInternalMode] = useState<'list' | 'edit' | 'create'>(
    'list',
  )
  const mode = externalMode || internalMode
  const setMode = externalSetMode || setInternalMode

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState<AddressFormData>({
    receiverName: '',
    receiverMobile: '',
    flatorHouseno: '',
    area: '',
    landmark: '',
    addressType: 'Home',
    isPrimaryAddress: false,
    userId: userId ?? '',
    pincode: '',
  })

  const [errors, setErrors] = useState<ValidationErrors>({})

  // Fetch all addresses
  const {
    data: addressesData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: async () => {
      const res = await _axios.get(`/user/address/${userId}?type=all`)
      return res.data
    },
    enabled: !!userId && isOpen,
  })

  const addresses: Address[] = addressesData?.data || []

  // Determine initial mode based on addresses
  useEffect(() => {
    if (isOpen && addresses.length === 0 && !loading) {
      setMode('create')
    } else if (isOpen && addresses.length > 0 && mode === 'list') {
      setMode('list')
    }
  }, [isOpen, addresses.length, loading])

  // Sync userId
  useEffect(() => {
    setForm((prev) => ({ ...prev, userId: userId ?? '' }))
  }, [userId])

  // Close on ESC + body scroll lock
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (mode !== 'list' && addresses.length > 0) {
          setMode('list')
          setSelectedAddress(null)
          resetForm()
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, mode, addresses.length])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Reset when closing
      setTimeout(() => {
        setMode('list')
        setSelectedAddress(null)
        resetForm()
      }, 300)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Reset form
  const resetForm = () => {
    setForm({
      receiverName: '',
      receiverMobile: '',
      flatorHouseno: '',
      area: '',
      landmark: '',
      addressType: 'Home',
      isPrimaryAddress: false,
      userId: userId ?? '',
      pincode: '',
    })
    setErrors({})
  }

  // Load address for editing
  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address)
    setForm({
      receiverName: address.receiverName,
      receiverMobile: address.receiverMobile,
      flatorHouseno: address.flatorHouseno,
      area: address.area,
      landmark: address.landmark || '',
      addressType: address.addressType,
      isPrimaryAddress: address.isPrimaryAddress,
      userId: userId ?? '',
      pincode: address.pincode,
    })
    setMode('edit')
  }

  // Use external selected address if provided
  useEffect(() => {
    if (externalSelectedAddress && mode === 'edit') {
      setSelectedAddress(externalSelectedAddress)
      setForm({
        receiverName: externalSelectedAddress.receiverName,
        receiverMobile: externalSelectedAddress.receiverMobile,
        flatorHouseno: externalSelectedAddress.flatorHouseno,
        area: externalSelectedAddress.area,
        landmark: externalSelectedAddress.landmark || '',
        addressType: externalSelectedAddress.addressType,
        isPrimaryAddress: externalSelectedAddress.isPrimaryAddress,
        userId: userId ?? '',
        pincode: externalSelectedAddress.pincode,
      })
    }
  }, [externalSelectedAddress, mode, userId])

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await _axios.delete(`/user/address/${addressId}`)
      if (response.status === 200) {
        toast.success('Address deleted successfully')
        refetch()
        queryClient.invalidateQueries({ queryKey: ['user-address', userId] })
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete address')
    }
  }

  // Validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!form.receiverName.trim()) newErrors.receiverName = 'Name is required'
    if (!form.receiverMobile.trim())
      newErrors.receiverMobile = 'Phone is required'

    const phoneRegex = /^\+?\d{10}$/
    if (
      form.receiverMobile &&
      !phoneRegex.test(form.receiverMobile.replace(/\s/g, ''))
    ) {
      newErrors.receiverMobileFormat =
        'Enter a valid phone number (exactly 10 digits)'
    }

    if (!form.flatorHouseno.trim())
      newErrors.flatorHouseno = 'Flat/House no. is required'
    if (!form.area.trim()) newErrors.area = 'Area is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input change
  const handleChange = (
    field: keyof AddressFormData,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (field === 'receiverMobile' && errors.receiverMobileFormat) {
      setErrors((prev) => ({ ...prev, receiverMobileFormat: undefined }))
    }
  }

  const makePrimaryAddress = async (addressId: string) => {
    try {
      const response = await _axios.patch(
        `/user/address/${userId}?id=${addressId}`,
      )
      if (response.status === 200) {
        toast.success(response.data.message || 'Address made primary')
        refetch()
        queryClient.invalidateQueries({ queryKey: ['user-address', userId] })
        queryClient.invalidateQueries({ queryKey: ['session'] })
        onClose()
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to make address primary',
      )
    }
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      if (mode === 'edit' && selectedAddress) {
        // Update existing address
        const response = await _axios.put(
          `/user/address/${selectedAddress._id}`,
          form,
        )
        if (response.status === 200) {
          toast.success(response.data.message || 'Address updated successfully')
          refetch()
          queryClient.invalidateQueries({ queryKey: ['user-address', userId] })
          queryClient.invalidateQueries({ queryKey: ['session'] })
          setMode('list')
          setSelectedAddress(null)
          resetForm()
          onSuccess?.()
        }
      } else {
        // Create new address
        const response = await _axios.post('/user/address', form)
        if (response.status === 200) {
          toast.success(response.data.message || 'Address added successfully')
          refetch()
          queryClient.invalidateQueries({ queryKey: ['user-address', userId] })
          queryClient.invalidateQueries({ queryKey: ['session'] })
          setMode('list')
          resetForm()
          onSuccess?.()
        }
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to save address'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Render List View
  const renderListView = () => (
    <div className="flex flex-col h-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="font-sans font-medium text-[#000000] text-[24px]">
          Address
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-sm cursor-pointer"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Add New Address Button */}
      <div className="p-4 flex items-center justify-between">
        <p className="text-[16px] font-medium whitespace-nowrap">
          Add New Address
        </p>
        <button
          onClick={() => {
            resetForm()
            setMode('create')
          }}
          className="flex cursor-pointer items-center justify-center gap-2 py-3 px-2 rounded-[4px] bg-[#0E3051] text-white hover:bg-[#0a2642] h-8 font-light transition"
        >
          <Plus className="w-5 h-5" />
          <span className="font-light text-[14px]">New Address</span>
        </button>
      </div>

      {/* Address List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No addresses found</p>
            <p className="text-sm mt-2">Add your first address to continue</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className={` ${address.isPrimaryAddress ? `border border-primary` : ``}  rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition`}
            >
              {/* Header with Icon, Type and Action Buttons */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/* Icon */}
                  <div className="w-8 h-8  rounded-full flex items-center justify-center flex-shrink-0">
                    {address.addressType === 'Home' ? (
                      <img
                        src="/design-icons/home-address.svg"
                        alt=""
                        className=""
                      />
                    ) : (
                      <Building2 className="w-6 h-6" />
                    )}
                  </div>

                  {/* Address Type */}
                  <span className="font-medium text-[#000000] text-[20px] font-serif">
                    {address.addressType}
                  </span>
                </div>

                {/* Action Buttons - Right Side */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="py-1.5 cursor-pointer px-4  text-primary font-normal transition rounded text-[14px] font-serif"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="py-1.5 cursor-pointer px-4 text-[14px] bg-[#0E3051] font-serif text-white rounded hover:bg-[#0a2642] transition font-normal "
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="text-[14px] font-medium text-[#1F1F1F] space-y-1">
                <p className="leading-relaxed">
                  {address.flatorHouseno}, {address.area}
                  {address.landmark && `, ${address.landmark}`}
                </p>
              </div>

              {/* Receiver Details */}
              <div className="mt-2 pt-2">
                <p className="text-[14px] text-[#000000]">
                  <span className="font-medium text-[#828999] text-[14px]">
                    Receiver Detail:
                  </span>{' '}
                  {address.receiverName}, {address.receiverMobile}
                </p>
              </div>

              {/* Use Button - Only show if not primary */}
              {address?.isPrimaryAddress === false && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => makePrimaryAddress(address._id)}
                    className="w-full cursor-pointer py-2 px-3 text-sm text-[#0E3051] border border-[#0E3051] rounded hover:bg-[#F6FBFF] transition font-medium"
                  >
                    Use This Address
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )

  // Render Form View (Create/Edit)
  const renderFormView = () => (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4  relative">
        <div className="flex items-center gap-3 ">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              {mode === 'edit' ? 'Edit Address' : 'Add New Address'}
            </h2>
            <p className="text-sm text-gray-400">
              Let us know your address to deliver your order
            </p>
          </div>
          {addresses.length > 0 && (
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => {
                  if (isDirectClose) {
                    onClose()
                  } else {
                    setMode('list')
                    setSelectedAddress(null)
                    resetForm()
                  }
                }}
                className="p-1 rounded-sm hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
        {addresses.length === 0 && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Address Type */}
        <div className="flex gap-4">
          {(['Home', 'Office'] as const).map((type) => (
            <div
              key={type}
              className="flex flex-col justify-center items-center text-sm gap-2 text-[#0E3051]"
            >
              <button
                type="button"
                onClick={() => handleChange('addressType', type)}
                className={`flex items-center justify-center gap-2 w-16 h-16 rounded-lg border-2 transition ${
                  form.addressType === type
                    ? 'border-[#0E3051] bg-[#F6FBFF] text-[#0E3051]'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type === 'Home' ? (
                  <img
                    src="/design-icons/home-address.svg"
                    alt=""
                    className=""
                  />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
              </button>
              <span className="font-medium">{type}</span>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-medium text-[#0E3051] mb-3">
          Address details
        </h3>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Area */}
          <div>
            <input
              type="text"
              value={form.area}
              onChange={(e) => handleChange('area', e.target.value)}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm ${
                errors.area ? 'border-red-500' : ''
              }`}
              placeholder="Area / Sector / Locality"
            />
            {errors.area && (
              <p className="text-red-500 text-xs mt-1">{errors.area}</p>
            )}
          </div>

          {/* Flat / House */}
          <div>
            <input
              type="text"
              value={form.flatorHouseno}
              onChange={(e) => handleChange('flatorHouseno', e.target.value)}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm ${
                errors.flatorHouseno ? 'border-red-500' : ''
              }`}
              placeholder="Flat / House No / Floor / Building"
            />
            {errors.flatorHouseno && (
              <p className="text-red-500 text-xs mt-1">
                {errors.flatorHouseno}
              </p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => handleChange('landmark', e.target.value)}
              className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
              placeholder="Near By Landmark (Optional)"
            />
          </div>

          <div>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
              placeholder="Pincode"
            />
          </div>

          {/* Receiver Details */}
          <div className="pt-4">
            <h3 className="text-sm font-medium text-[#0E3051] mb-3">
              Receiver details
            </h3>

            {/* Name */}
            <div>
              <input
                type="text"
                value={form.receiverName}
                onChange={(e) => handleChange('receiverName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm ${
                  errors.receiverName ? 'border-red-500' : ''
                }`}
                placeholder="Name"
              />
              {errors.receiverName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.receiverName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="mt-4">
              <input
                type="tel"
                value={form.receiverMobile}
                onChange={(e) => handleChange('receiverMobile', e.target.value)}
                className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm ${
                  errors.receiverMobile || errors.receiverMobileFormat
                    ? 'border-red-500'
                    : ''
                }`}
                placeholder="Phone Number"
              />
              {errors.receiverMobile && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.receiverMobile}
                </p>
              )}
              {errors.receiverMobileFormat && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.receiverMobileFormat}
                </p>
              )}
            </div>
          </div>

          {/* Primary Address */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="primary"
              checked={form.isPrimaryAddress}
              onChange={(e) =>
                handleChange('isPrimaryAddress', e.target.checked)
              }
              className="w-4 h-4 text-[#0E3051] rounded-sm"
            />
            <label htmlFor="primary" className="text-sm text-gray-700">
              Make this my default address
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-md font-medium text-white transition ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#0E3051] hover:bg-[#0a2642]'
          }`}
        >
          {isSubmitting
            ? 'SAVING...'
            : mode === 'edit'
              ? 'UPDATE ADDRESS'
              : 'SAVE ADDRESS'}
        </button>
      </div>
    </form>
  )

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => {
          if (mode === 'list' || addresses.length === 0) {
            onClose()
          }
        }}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl overflow-hidden">
        {mode === 'list' ? renderListView() : renderFormView()}
      </div>
    </>
  )
}
