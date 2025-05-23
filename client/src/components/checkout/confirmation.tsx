import { useCheckout } from "@/lib/checkout-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export function Confirmation() {
  const { orderSummary, customerInfo, confirmationData, setCurrentStep } = useCheckout();
  
  return (
    <Card>
      <CardContent className="p-6 mb-6 text-center">
        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Thank You for Your Order!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your order has been successfully placed.
        </p>
        
        <div className="bg-secondary dark:bg-gray-800 rounded-md p-4 mb-6 text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">
              Order #{confirmationData?.orderNumber || "AB123456"}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {confirmationData?.orderDate 
                ? format(new Date(confirmationData.orderDate), "MMMM d, yyyy")
                : format(new Date(), "MMMM d, yyyy")}
            </span>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Shipping address:</span>
              <span className="text-right text-sm text-gray-600 dark:text-gray-400">
                {customerInfo.address}
                {customerInfo.addressLine2 && `, ${customerInfo.addressLine2}`}
                <br />
                {customerInfo.city}, {customerInfo.state} {customerInfo.zip}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {customerInfo.email}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">${orderSummary.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-mono">${orderSummary.shipping}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span className="font-mono">${orderSummary.tax}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span className="font-mono text-primary dark:text-accent">
                ${orderSummary.total}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            A confirmation email has been sent to your email address.
          </p>
          <Button 
            onClick={() => setCurrentStep("cart")}
            className="inline-block bg-primary hover:bg-primary/90 text-white"
          >
            Continue Shopping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
