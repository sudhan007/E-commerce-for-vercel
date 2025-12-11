interface BillingInfo {
  itemTotal: number
  deliveryCharge: number
  totalAmount: number
  paymentMode: string
  transactionId: string
}

export default function BillSummary({ billing }: { billing: BillingInfo }) {
  return (
    <div>
      <h3 className="mb-4 font-semibold">Bill Summary</h3>

      {/* Mobile View */}
      <div className="block md:hidden space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment Mode:</span>
          <span className="font-medium">{billing.paymentMode}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Transaction ID:</span>
          <span className="font-medium">{billing.transactionId}</span>
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Item Total</span>
            <span>₹{billing.itemTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Charge</span>
            <span>₹{billing.deliveryCharge}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total Amount</span>
            <span>₹{billing.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Payment Mode</p>
            <p className="font-medium">{billing.paymentMode}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
            <p className="font-medium">{billing.transactionId}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item Total</span>
            <span>₹{billing.itemTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Charge</span>
            <span>₹{billing.deliveryCharge}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total Amount</span>
            <span>₹{billing.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
