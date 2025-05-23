import { useCheckout } from "@/lib/checkout-provider";
import { CartItems } from "./cart-items";
import { CustomerDetails } from "./customer-details";
import { PaymentMethod } from "./payment-method";
import { Confirmation } from "./confirmation";
import { OrderSummary } from "./order-summary";
import { CheckoutProgress } from "./checkout-progress";

export function Checkout() {
  const { currentStep } = useCheckout();
  
  return (
    <main className="container mx-auto px-4 py-6 md:py-12">
      <CheckoutProgress />
      
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        <div className="w-full lg:w-2/3 mb-8 lg:mb-0">
          {currentStep === "cart" && <CartItems />}
          {currentStep === "details" && <CustomerDetails />}
          {currentStep === "payment" && <PaymentMethod />}
          {currentStep === "confirmation" && <Confirmation />}
        </div>
        
        <div className="w-full lg:w-1/3">
          <OrderSummary />
        </div>
      </div>
    </main>
  );
}
