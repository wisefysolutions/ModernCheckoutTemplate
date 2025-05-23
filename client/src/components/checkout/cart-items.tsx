import { useCheckout } from "@/lib/checkout-provider";
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CartItems() {
  const { 
    cartItems, 
    isLoading, 
    updateCartItem, 
    removeCartItem, 
    setCurrentStep 
  } = useCheckout();
  
  const handleIncreaseQuantity = (itemId: number, currentQuantity: number) => {
    updateCartItem(itemId, currentQuantity + 1);
  };
  
  const handleDecreaseQuantity = (itemId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItem(itemId, currentQuantity - 1);
    }
  };
  
  const handleContinue = () => {
    setCurrentStep("details");
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Shopping Cart</h2>
          
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-24 w-24 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Shopping Cart</h2>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty</p>
            <Button variant="default">Shop Now</Button>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {cartItems.map((item) => (
                <li key={item.id} className="py-4 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-4 sm:mb-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-md" 
                    />
                  </div>
                  <div className="flex-1 ml-0 sm:ml-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="font-mono text-primary dark:text-accent">
                        ${parseFloat(item.product.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.product.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-2 py-1 font-mono">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent"
                        onClick={() => removeCartItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 flex justify-between items-center">
              <Button variant="link" className="text-primary dark:text-accent hover:underline flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Continue Shopping
              </Button>
              <Button 
                onClick={handleContinue}
                className="bg-primary hover:bg-primary/90 text-white flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
