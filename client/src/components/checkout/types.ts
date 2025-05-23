export type CheckoutStep = "cart" | "details" | "payment" | "confirmation";

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentDetails {
  method: "card" | "paypal";
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  sameBillingAddress: boolean;
}

export interface OrderSummary {
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
}
