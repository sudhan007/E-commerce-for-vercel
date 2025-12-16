interface Step {
  title: string
  date: string
  status: 'completed' | 'current' | 'pending'
}

const OrderTracker = () => {
  const steps: Step[] = [
    {
      title: 'Order Confirmed',
      date: 'Wed, 18th Feb',
      status: 'completed',
    },
    {
      title: 'In-Progress',
      date: 'Thu, 19th Feb',
      status: 'current',
    },
    {
      title: 'Out for delivery',
      date: 'Fri, 19th Feb',
      status: 'pending',
    },
    {
      title: 'Delivered',
      date: 'Expected by Sat, 19th Feb',
      status: 'pending',
    },
  ]

  const completedSteps = steps.filter(
    (step) => step.status === 'completed',
  ).length
  const progressPercentage = ((completedSteps - 1) / (steps.length - 1)) * 100

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
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                  )}
                </div>

                {/* Vertical Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-12 w-0.5 ${step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`}
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
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-gray-200" />

          {/* Progress Line */}
          <div
            className="absolute left-6 top-5 h-0.5 bg-green-600 transition-all duration-500"
            style={{
              width: `calc(${progressPercentage}% * (100% - 3rem) / 100)`,
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${
                    step.status === 'completed'
                      ? 'bg-green-600'
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
                    <div className="h-4 w-4 rounded-full bg-gray-300" />
                  )}
                </div>

                {/* Content */}
                <div className="mt-4 text-center">
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
