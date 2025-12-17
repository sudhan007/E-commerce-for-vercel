// interface Step {
//   title: string
//   date: string
//   status: 'completed' | 'current' | 'pending'
// }

// const OrderTracker = () => {
//   const steps: Step[] = [
//     {
//       title: 'Order Confirmed',
//       date: 'Wed, 18th Feb',
//       status: 'completed',
//     },
//     {
//       title: 'In-Progress',
//       date: 'Thu, 19th Feb',
//       status: 'current',
//     },
//     {
//       title: 'Out for delivery',
//       date: 'Fri, 19th Feb',
//       status: 'pending',
//     },
//     {
//       title: 'Delivered',
//       date: 'Expected by Sat, 19th Feb',
//       status: 'pending',
//     },
//   ]

//   const completedSteps = steps.filter(
//     (step) => step.status === 'completed',
//   ).length
//   const progressPercentage = ((completedSteps - 1) / (steps.length - 1)) * 100

//   return (
//     <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 md:p-8">
//       {/* Mobile View - Vertical */}
//       <div className="block md:hidden">
//         <div className="space-y-6">
//           {steps.map((step, index) => (
//             <div key={index} className="relative flex gap-4">
//               {/* Icon and Line Container */}
//               <div className="flex flex-col items-center">
//                 {/* Icon */}
//                 <div
//                   className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
//                     step.status === 'completed'
//                       ? 'bg-green-600'
//                       : 'border-2 border-gray-300 bg-white'
//                   }`}
//                 >
//                   {step.status === 'completed' ? (
//                     <svg
//                       className="h-5 w-5 text-white"
//                       fill="none"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path d="M5 13l4 4L19 7" />
//                     </svg>
//                   ) : (
//                     <div className="h-3 w-3 rounded-full bg-gray-300" />
//                   )}
//                 </div>

//                 {/* Vertical Line */}
//                 {index < steps.length - 1 && (
//                   <div
//                     className={`h-12 w-0.5 ${step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`}
//                   />
//                 )}
//               </div>

//               {/* Content */}
//               <div className="flex-1 pb-2">
//                 <p className="text-sm font-medium text-gray-900">
//                   {step.title}
//                 </p>
//                 <p className="mt-1 text-xs text-gray-500">{step.date}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Desktop View - Horizontal */}
//       <div className="hidden md:block">
//         <div className="relative">
//           {/* Background Line */}
//           <div className="absolute left-6 right-6 top-5 h-0.5 bg-gray-200" />

//           {/* Progress Line */}
//           <div
//             className="absolute left-6 top-5 h-0.5 bg-green-600 transition-all duration-500"
//             style={{
//               width: `calc(${progressPercentage}% * (100% - 3rem) / 100)`,
//             }}
//           />

//           {/* Steps */}
//           <div className="relative flex justify-between">
//             {steps.map((step, index) => (
//               <div key={index} className="flex flex-col items-center">
//                 {/* Icon */}
//                 <div
//                   className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${
//                     step.status === 'completed'
//                       ? 'bg-green-600'
//                       : 'border-2 border-gray-300 bg-white'
//                   }`}
//                 >
//                   {step.status === 'completed' ? (
//                     <svg
//                       className="h-6 w-6 text-white"
//                       fill="none"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path d="M5 13l4 4L19 7" />
//                     </svg>
//                   ) : (
//                     <div className="h-4 w-4 rounded-full bg-gray-300" />
//                   )}
//                 </div>

//                 {/* Content */}
//                 <div className="mt-4 text-center">
//                   <p className="text-sm font-medium text-gray-900">
//                     {step.title}
//                   </p>
//                   <p className="mt-1 text-xs text-gray-500">{step.date}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default OrderTracker

import { format, parseISO } from 'date-fns'

interface TimelineEntry {
  status: string
  updatedAt: string
}

interface OrderTrackerProps {
  statusTimeline: TimelineEntry[]
  currentStatus?: string // optional fallback if not in timeline
}

const statusConfig: Record<string, { title: string; order: number }> = {
  PENDING: { title: 'Order Placed', order: 1 },
  CONFIRMED: { title: 'Order Confirmed', order: 2 },
  // PROCESSING: { title: 'In Progress', order: 3 },
  // SHIPPED: { title: 'Shipped', order: 4 },
  OUT_FOR_DELIVERY: { title: 'Out for Delivery', order: 5 },
  DELIVERED: { title: 'Delivered', order: 6 },
  // CANCELLED: { title: 'Cancelled', order: 7 },
  // RETURNED: { title: 'Returned', order: 8 },
}

const allPossibleSteps = Object.entries(statusConfig)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([key, value]) => ({ status: key, ...value }))

const OrderTracker: React.FC<OrderTrackerProps> = ({
  statusTimeline,
  currentStatus,
}) => {
  // Determine the latest status
  const latestStatus =
    statusTimeline.length > 0
      ? statusTimeline[statusTimeline.length - 1].status
      : currentStatus || 'PENDING'

  // Build dynamic steps
  const steps = allPossibleSteps.map((step) => {
    const timelineEntry = statusTimeline.find((t) => t.status === step.status)
    const isCompleted = statusConfig[latestStatus]?.order >= step.order
    const isCurrent = latestStatus === step.status

    let date = ''
    if (timelineEntry) {
      date = format(parseISO(timelineEntry.updatedAt), 'EEE, d MMM yyyy')
    } else if (isCurrent) {
      date = 'In Progress'
    } else if (step.status === 'DELIVERED' && isCompleted) {
      date = 'Delivered'
    } else if (
      !timelineEntry &&
      step.order > statusConfig[latestStatus].order
    ) {
      date = 'Pending'
    }

    return {
      title: step.title,
      date,
      status: isCompleted ? 'completed' : isCurrent ? 'current' : 'pending',
    }
  })

  // Calculate progress for desktop horizontal bar
  const completedCount = steps.filter((s) => s.status === 'completed').length
  const progressPercentage = ((completedCount - 1) / (steps.length - 1)) * 100

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 md:p-8">
      {/* Mobile View - Vertical */}
      <div className="block md:hidden">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Icon and Line Container */}
              <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                    step.status === 'completed'
                      ? 'bg-green-600'
                      : step.status === 'current'
                        ? 'bg-blue-600'
                        : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div
                      className={`h-3 w-3 rounded-full ${
                        step.status === 'current'
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>

                {/* Vertical Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-12 w-0.5 ${
                      step.status === 'completed'
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <p className="text-sm font-medium text-gray-900">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View - Horizontal */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Background Line */}
          <div className="absolute left-6 right-6 top-6 h-0.5 bg-gray-200" />

          {/* Progress Line */}
          <div
            className="absolute left-6 top-6 h-0.5 bg-green-600 transition-all duration-500 ease-out"
            style={{
              width: `calc(${progressPercentage}% * (100% - 3rem) / 100 + 1.5rem)`, // +1.5rem to reach center of current step
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    step.status === 'completed'
                      ? 'bg-green-600'
                      : step.status === 'current'
                        ? 'bg-blue-600 ring-4 ring-blue-100'
                        : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div
                      className={`h-4 w-4 rounded-full ${
                        step.status === 'current' ? 'bg-white' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="mt-4 text-center w-32">
                  <p className="text-sm font-medium text-gray-900">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracker
