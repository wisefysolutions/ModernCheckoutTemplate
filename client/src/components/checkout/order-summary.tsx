import { useCheckout } from "@/lib/checkout-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck, Lock, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderSummary() {
  const { orderSummary, isLoading } = useCheckout();
  
  if (isLoading) {
    return (
      <Card className="sticky top-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="sticky top-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono">${orderSummary.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-mono">${orderSummary.shipping}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (8.25%)</span>
            <span className="font-mono">${orderSummary.tax}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="font-mono text-lg font-semibold text-primary dark:text-accent">
              ${orderSummary.total}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Input placeholder="Promo Code" className="pr-20" />
            <Button 
              variant="ghost" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary dark:text-accent font-medium h-8"
            >
              Apply
            </Button>
          </div>
        </div>
        
        <div className="bg-secondary dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <Truck className="h-5 w-5 text-primary dark:text-accent mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Free shipping on orders over $75</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expected delivery: 3-5 business days
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="flex items-center mb-2">
            <Lock className="h-4 w-4 text-green-500 mr-1" />
            Secure checkout
          </p>
          <p className="flex items-center">
            <RotateCcw className="h-4 w-4 text-green-500 mr-1" />
            30-day returns
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
