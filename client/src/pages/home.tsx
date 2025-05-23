import { Checkout } from "@/components/checkout";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Checkout - ShopStream</title>
        <meta name="description" content="Complete your purchase securely at ShopStream with our streamlined checkout process." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Checkout />
        <Footer />
      </div>
    </>
  );
}
