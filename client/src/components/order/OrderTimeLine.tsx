import React from 'react'

const OrderTracker = () => {
  return (
    <div className=" p-6 bg-white rounded-2xl shadow-sm">
      <div className="relative">
        {/* Gray background line */}
        <div className="absolute top-6 left-12 right-12 h-1 bg-gray-200"></div>

        {/* Green progress line */}
        <div className="absolute top-6 left-12 w-1/4 h-1 bg-green-600"></div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {/* Step 1 - Order Confirmed */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl">
              ✓
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">
              Order Confirmed
            </p>
            <p className="mt-1 text-xs text-gray-500">Wed, 18th Feb</p>
          </div>

          {/* Step 2 - In-Progress */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-400"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">
              In-Progress
            </p>
            <p className="mt-1 text-xs text-gray-500">Thu, 19th Feb</p>
          </div>

          {/* Step 3 - Out for delivery */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-400"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">
              Out for delivery
            </p>
            <p className="mt-1 text-xs text-gray-500">Fri, 19th Feb</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-400"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">Delivered</p>
            <p className="mt-1 text-xs text-gray-500">
              Expected by Sat, 19th Feb
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracker
