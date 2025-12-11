import { _axios } from '@/lib/axios'

export interface ServiceabilityResult {
    isServiceable: boolean
    isCODAvailable: boolean
    isODA: boolean
    message: string
    city: string | null
    estimatedDays: number
}

export async function checkPincodeServiceability(
    pincode: string,
): Promise<ServiceabilityResult> {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        return {
            isServiceable: false,
            isCODAvailable: false,
            isODA: false,
            city: null,
            estimatedDays: 0,
            message: 'Invalid pincode',
        }
    }

    try {
        const res = await _axios.get(
            `/user/courier/service-availability?pincode=${pincode}`,
        )

        if (res.status !== 200) {
            throw new Error('Network error')
        }

        const data = res.data?.data
        if (!data?.delivery_codes?.[0]?.postal_code) {
            throw new Error('Invalid API response')
        }

        const pinData = data.delivery_codes[0].postal_code

        const isServiceable = pinData.pre_paid === 'Y' || pinData.cod === 'Y'
        const isCODAvailable = pinData.cod === 'Y'
        const isODA = pinData.is_oda === 'Y' || pinData.is_oda === 'ODA'
        const estimatedDays = isODA ? 6 : pinData.sun_tat ? 4 : 5

        return {
            isServiceable,
            isCODAvailable,
            isODA,
            city: pinData.city || null,
            estimatedDays,
            message: isServiceable
                ? isODA
                    ? `Delivery in ${estimatedDays} days • Remote area • Prepaid only`
                    : isCODAvailable
                        ? `Delivery in ${estimatedDays} days • COD Available`
                        : `Delivery in ${estimatedDays} days • Prepaid only`
                : "Sorry, we don't deliver to this pincode yet.",
        }
    } catch (err) {
        console.error('Pincode check failed:', err)
        return {
            isServiceable: false,
            isCODAvailable: false,
            isODA: false,
            city: null,
            estimatedDays: 0,
            message: 'Invalid pincode or service unavailable',
        }
    }
}