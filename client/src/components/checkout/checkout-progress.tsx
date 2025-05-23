import { useCheckout } from "@/lib/checkout-provider";
import { Check, ShoppingCart, User, CreditCard } from "lucide-react";

export function CheckoutProgress() {
  const { currentStep } = useCheckout();
  
  const steps = [
    { id: "cart", icon: ShoppingCart, label: "Cart" },
    { id: "details", icon: User, label: "Details" },
    { id: "payment", icon: CreditCard, label: "Payment" },
    { id: "confirmation", icon: Check, label: "Confirmation" },
  ] as const;
  
  return (
    <div className="mb-10">
      <div className="relative flex justify-between items-center max-w-3xl mx-auto">
        <div 
          className="h-[2px] bg-gray-200 dark:bg-gray-700 absolute w-full top-4 z-0"
          aria-hidden="true"
        />
        
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isPassed = (
            (currentStep === "details" && step.id === "cart") ||
            (currentStep === "payment" && (step.id === "cart" || step.id === "details")) ||
            (currentStep === "confirmation")
          );
          
          return (
            <div 
              key={step.id}
              className="relative z-10 flex flex-col items-center"
              aria-current={isActive ? "step" : undefined}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-white"
                    : isPassed
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {isPassed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <div 
                className={`text-xs mt-2 font-medium ${
                  isActive
                    ? "text-primary dark:text-accent"
                    : isPassed
                    ? "text-green-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
