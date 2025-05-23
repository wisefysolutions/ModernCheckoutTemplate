import { useCheckout } from "@/lib/checkout-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Lock, Wallet } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const paymentSchema = z.object({
  method: z.enum(["card", "paypal"]),
  cardName: z.string().optional().refine(val => {
    if (val === "" && val === undefined) return true;
    return val && val.trim().length > 0;
  }, "Name on card is required"),
  cardNumber: z.string().optional().refine(val => {
    if (val === "" || val === undefined) return true;
    return /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(val.replace(/\s/g, ''));
  }, "Valid card number is required"),
  cardExpiry: z.string().optional().refine(val => {
    if (val === "" || val === undefined) return true;
    return /^(0[1-9]|1[0-2])\s?\/\s?([0-9]{2})$/.test(val);
  }, "Valid expiry date is required"),
  cardCvc: z.string().optional().refine(val => {
    if (val === "" || val === undefined) return true;
    return /^\d{3,4}$/.test(val);
  }, "Valid CVC is required"),
  sameBillingAddress: z.boolean().default(true),
});

export function PaymentMethod() {
  const { paymentDetails, setPaymentDetails, setCurrentStep, placeOrder, isProcessingOrder } = useCheckout();
  
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: paymentDetails,
  });
  
  const watchPaymentMethod = form.watch("method");
  
  const onSubmit = async (data: z.infer<typeof paymentSchema>) => {
    setPaymentDetails(data);
    
    // Validation for card payment fields
    if (data.method === "card") {
      if (!data.cardName || !data.cardNumber || !data.cardExpiry || !data.cardCvc) {
        if (!data.cardName) {
          form.setError("cardName", { message: "Name on card is required" });
        }
        if (!data.cardNumber) {
          form.setError("cardNumber", { message: "Card number is required" });
        }
        if (!data.cardExpiry) {
          form.setError("cardExpiry", { message: "Expiry date is required" });
        }
        if (!data.cardCvc) {
          form.setError("cardCvc", { message: "CVC is required" });
        }
        return;
      }
    }
    
    // Place order
    try {
      await placeOrder();
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
    }
    
    return value;
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="card" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                          Credit / Debit Card
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="paypal" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <Wallet className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                          PayPal
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchPaymentMethod === "card" && (
              <div className="pl-6 mt-2 space-y-4">
                <FormField
                  control={form.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Card</FormLabel>
                      <FormControl>
                        <Input placeholder="Name on Card" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="XXXX XXXX XXXX XXXX" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(formatCardNumber(e.target.value));
                            }} 
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cardExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MM / YY" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(formatExpiry(e.target.value));
                            }} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardCvc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVC / CVV</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="123" 
                              maxLength={4} 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {watchPaymentMethod === "paypal" && (
              <div className="pl-6 mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You will be redirected to PayPal to complete your payment.
                </p>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="sameBillingAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Same as shipping address</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="mt-6 flex justify-between items-center">
              <Button 
                type="button"
                variant="link" 
                className="text-primary dark:text-accent hover:underline flex items-center"
                onClick={() => setCurrentStep("details")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Details
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white flex items-center"
                disabled={isProcessingOrder}
              >
                {isProcessingOrder ? "Processing..." : "Place Order"}
                <Lock className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
