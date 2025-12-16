import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/payment-verification/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      merchantTxnNo: search.merchantTxnNo as string | undefined,
      respCode: search.respCode as string | undefined,
    }
  },
  component: PaymentVerification,
})

function PaymentVerification() {
  const { merchantTxnNo, respCode } = Route.useSearch()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>(
    'checking',
  )
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    if (!merchantTxnNo) {
      setStatus('failed')
      return
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `https://api.koffo.shop/api/user/userauth/payment-status/${merchantTxnNo}`,
        )

        if (!response.ok) throw new Error('Failed to fetch status')

        const data = await response.json()
        setOrderData(data)

        if (data.paymentStatus === 'PAID') {
          setStatus('success')
          // Redirect after 3 seconds
          setTimeout(() => {
            navigate({ to: `/order/${data.orderId}` }).catch(() => {
              // Fallback if route doesn't exist yet
              window.location.href = '/orders'
            })
          }, 3000)
        } else if (data.paymentStatus === 'FAILED') {
          setStatus('failed')
        } else {
          // Still pending → poll again
          setTimeout(checkPaymentStatus, 2000)
        }
      } catch (error) {
        console.error('Payment status check failed:', error)
        setStatus('failed')
      }
    }

    checkPaymentStatus()
  }, [merchantTxnNo, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {status === 'checking' && <CheckingState />}
        {status === 'success' && <SuccessState orderData={orderData} />}
        {status === 'failed' && <CheckingState />}
      </div>
    </div>
  )
}

function CheckingState() {
  return (
    <Card className="p-8 md:p-12 text-center border-2 shadow-xl bg-card/95 backdrop-blur-sm">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative bg-primary/10 rounded-full p-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
        Verifying Payment
      </h1>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
        Please wait while we confirm your transaction. This usually takes just a
        few seconds.
      </p>

      <div className="flex justify-center gap-2 mb-4">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <CreditCard className="h-4 w-4" />
        <span>Secure payment processing</span>
      </div>
    </Card>
  )
}

function SuccessState({ orderData }: { orderData: any }) {
  return (
    <Card className="p-8 md:p-12 text-center border-2 border-emerald-500/20 shadow-xl bg-card/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="relative bg-emerald-500/10 rounded-full p-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-600 animate-in zoom-in-50 duration-300" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
        Payment Successful!
      </h1>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
        Your payment has been processed successfully. Thank you for your
        purchase!
      </p>

      {orderData && (
        <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono font-medium text-foreground">
              {orderData.transactionId || 'N/A'}
            </span>
          </div>
          {orderData.amount && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-foreground">
                ${orderData.amount}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Paid
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1"
          size="lg"
          onClick={() => (window.location.href = '/orders')}
        >
          View Orders
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-transparent"
          size="lg"
          onClick={() => (window.location.href = '/')}
        >
          Back to Home
        </Button>
      </div>
    </Card>
  )
}

function FailedState() {
  return (
    <Card className="p-8 md:p-12 text-center border-2 border-destructive/20 shadow-xl bg-card/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
          <div className="relative bg-destructive/10 rounded-full p-6">
            <XCircle className="h-16 w-16 text-destructive animate-in zoom-in-50 duration-300" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
        Payment Failed
      </h1>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
        We couldn't process your payment. Please check your payment details and
        try again.
      </p>

      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-semibold text-sm text-foreground mb-2">
          Common issues:
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-destructive mt-0.5">•</span>
            <span>Insufficient funds in your account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-destructive mt-0.5">•</span>
            <span>Incorrect card details entered</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-destructive mt-0.5">•</span>
            <span>Card declined by your bank</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-destructive mt-0.5">•</span>
            <span>Network or connection issues</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1"
          size="lg"
          onClick={() => window.history.back()}
        >
          Try Again
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-transparent"
          size="lg"
          onClick={() => (window.location.href = '/support')}
        >
          Contact Support
        </Button>
      </div>
    </Card>
  )
}
