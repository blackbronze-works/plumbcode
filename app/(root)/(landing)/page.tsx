import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Problem from "@/components/home/Problem";
import HowItWorks from "@/components/home/HowItWorks";
import Product from "@/components/home/Product";
import Security from "@/components/home/Security";
import Pricing from "@/components/home/Pricing";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";

const Page = () => {
  return (
    <>
      <Header />
      <Hero />
      <Stats />
      <Problem />
      <HowItWorks />
      <Product />
      <Security />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
};

export default Page;
