import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { CheckoutProvider } from "@/lib/checkout-provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <CheckoutProvider>
        <Toaster />
        <Router />
      </CheckoutProvider>
    </TooltipProvider>
  );
}

export default App;
