'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { _axios } from '@/lib/axios'

interface ServiceabilityResult {
  isServiceable: boolean
  isCODAvailable: boolean
  isODA: boolean
  message: string
  city: string | null
  estimatedDays: number
}

interface PincodeCheckerProps {
  onServiceabilityChange?: (result: ServiceabilityResult | null) => void
  className?: string
}

export default function PincodeChecker({
  onServiceabilityChange,
  className,
}: PincodeCheckerProps) {
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)
  const [serviceInfo, setServiceInfo] = useState<ServiceabilityResult | null>(
    null,
  )

  const lastCheckedPincode = useRef<string>('')

  const callbackRef = useRef(onServiceabilityChange)
  useEffect(() => {
    callbackRef.current = onServiceabilityChange
  }, [onServiceabilityChange])

  const getDeliveryDate = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
  }

  useEffect(() => {
    const checkServiceability = async () => {
      if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        if (serviceInfo) {
          setServiceInfo(null)
          callbackRef.current?.(null)
        }
        return
      }

      if (lastCheckedPincode.current === pincode) {
        return
      }

      lastCheckedPincode.current = pincode
      setLoading(true)

      try {
        const res: any = await _axios.get(
          `/user/courier/service-availability?pincode=${pincode}`,
        )

        if (res.status != 200) {
          throw new Error('Network response was not ok')
        }

        const data = res.data?.data

        console.log(data, 'data')
        if (!data?.delivery_codes?.[0]?.postal_code) {
          throw new Error('Invalid response')
        }

        const pinData = data.delivery_codes[0].postal_code

        const isServiceable = pinData.pre_paid === 'Y' || pinData.cod === 'Y'
        const isCODAvailable = pinData.cod === 'Y'
        const isODA = pinData.is_oda === 'Y' || pinData.is_oda === 'ODA'
        const estimatedDays = isODA ? 6 : pinData.sun_tat ? 4 : 5

        const result: ServiceabilityResult = {
          isServiceable,
          isCODAvailable,
          isODA,
          city: pinData.city,
          estimatedDays,
          message: isServiceable
            ? isODA
              ? `Delivery in ${estimatedDays} days • Remote area • Prepaid only`
              : isCODAvailable
                ? `Delivery in ${estimatedDays} days • COD Available`
                : `Delivery in ${estimatedDays} days • Prepaid only`
            : "Sorry, we don't deliver to this pincode yet.",
        }

        setServiceInfo(result)
        callbackRef.current?.(result)

        if (isServiceable) {
          console.log(`✓ Delivery by ${getDeliveryDate(estimatedDays)}`)
        } else {
          console.log(`✗ ${result.message}`)
        }
      } catch (err) {
        const errorResult: ServiceabilityResult = {
          isServiceable: false,
          isCODAvailable: false,
          isODA: false,
          city: null,
          estimatedDays: 0,
          message: 'Invalid pincode or service unavailable',
        }
        setServiceInfo(errorResult)
        callbackRef.current?.(errorResult)
        console.log('✗ Invalid pincode')
      } finally {
        setLoading(false)
      }
    }

    checkServiceability()
  }, [pincode])

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPincode = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPincode(newPincode)

    if (newPincode !== lastCheckedPincode.current) {
      lastCheckedPincode.current = ''
    }
  }

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="relative mt-2">
        <input
          type="text"
          value={pincode}
          onChange={handlePincodeChange}
          placeholder="Enter pincode to check availability"
          className="w-full px-4 py-3 pr-12 text-sm md:text-base border border-gray-300 rounded-md  placeholder:text-gray-400"
          maxLength={6}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : serviceInfo ? (
            serviceInfo.isServiceable ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X
                onClick={() => {
                  setPincode('')
                }}
                className="w-5 h-5 text-red-600"
              />
            )
          ) : null}
        </div>
      </div>

      {/* Delivery Message */}
      {serviceInfo && (
        <div className="flex items-start gap-3">
          <img
            src="/design-icons/delivery-truck.svg"
            alt="delivery"
            className="w-5 h-5 mt-0.5 shrink-0"
          />
          <div className="flex-1">
            <p
              className={`text-sm md:text-base font-medium ${
                serviceInfo.isServiceable ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {serviceInfo.isServiceable ? (
                <>
                  <span className="text-xs md:text-base">
                    Estimated Delivery:{' '}
                    {getDeliveryDate(serviceInfo.estimatedDays)}
                  </span>
                  <span className="text-gray-700"> • {serviceInfo.city}</span>
                  <br />
                  <span className="text-sm text-gray-600">
                    {serviceInfo.message}
                  </span>
                </>
              ) : (
                serviceInfo.message
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
