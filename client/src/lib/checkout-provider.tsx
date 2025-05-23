import { createContext, useContext, useEffect, useState } from "react";
import { CartItemWithProduct } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import { CustomerInfo, OrderSummary, PaymentDetails, CheckoutStep } from "@/components/checkout/types";

interface CheckoutContextType {
  currentStep: CheckoutStep;
  setCurrentStep: (step: CheckoutStep) => void;
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
  paymentDetails: PaymentDetails;
  setPaymentDetails: (details: PaymentDetails) => void;
  orderSummary: OrderSummary;
  placeOrder: () => Promise<{ orderId: number; orderNumber: string }>;
  isProcessingOrder: boolean;
  confirmationData: {
    orderId: number;
    orderNumber: string;
    orderDate: string;
  } | null;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: "card",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    sameBillingAddress: true,
  });
  
  const [confirmationData, setConfirmationData] = useState<{
    orderId: number;
    orderNumber: string;
    orderDate: string;
  } | null>(null);
  
  // Fetch cart items
  const { 
    data: cartItems = [], 
    isLoading,
    refetch: refetchCart
  } = useQuery({
    queryKey: ['/api/cart'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Calculate order summary based on cart items
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: "0.00",
    shipping: "0.00",
    tax: "0.00",
    total: "0.00",
  });
  
  // Update order summary when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      // Calculate subtotal
      const subtotal = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
        0
      );
      
      // Determine shipping cost (free if over $75)
      const shipping = subtotal >= 75 ? 0 : 9.99;
      
      // Calculate tax (8.25%)
      const tax = subtotal * 0.0825;
      
      // Calculate total
      const total = subtotal + shipping + tax;
      
      setOrderSummary({
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      });
    } else {
      setOrderSummary({
        subtotal: "0.00",
        shipping: "0.00",
        tax: "0.00",
        total: "0.00",
      });
    }
  }, [cartItems]);
  
  // Add item to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await apiRequest("POST", "/api/cart", { productId, quantity });
    },
    onSuccess: () => {
      toast({
        title: "Item added to cart",
        description: "Your item has been added to the cart.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      await apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Remove cart item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const orderDetails = {
        ...customerInfo,
        ...orderSummary,
        paymentMethod: paymentDetails.method,
      };
      
      const response = await apiRequest("POST", "/api/orders", { orderDetails });
      return await response.json();
    },
    onSuccess: (data) => {
      setConfirmationData({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        orderDate: data.orderDate,
      });
      setCurrentStep("confirmation");
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "We couldn't process your order. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Helper functions for the context value
  const addToCart = async (productId: number, quantity: number) => {
    await addToCartMutation.mutateAsync({ productId, quantity });
  };
  
  const updateCartItem = async (itemId: number, quantity: number) => {
    await updateCartItemMutation.mutateAsync({ itemId, quantity });
  };
  
  const removeCartItem = async (itemId: number) => {
    await removeCartItemMutation.mutateAsync(itemId);
  };
  
  const placeOrder = async () => {
    return await placeOrderMutation.mutateAsync();
  };
  
  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        cartItems,
        isLoading,
        addToCart,
        updateCartItem,
        removeCartItem,
        customerInfo,
        setCustomerInfo,
        paymentDetails,
        setPaymentDetails,
        orderSummary,
        placeOrder,
        isProcessingOrder: placeOrderMutation.isPending,
        confirmationData,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}

// Access queryClient for invalidation
import { queryClient } from "./queryClient";
