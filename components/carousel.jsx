"use client";
import Autoplay from "embla-carousel-autoplay"
import Carousel from "@/components/ui/carousel";
import { Meteors } from "@/components/ui/meteors";
export function CarouselDemo() {
  const slideData = [
    {
      title: "Smart Ticket Management",
      button: "View Dashboard",
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Real-time Collaboration",
      button: "Start Collaborating",
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Advanced Analytics",
      button: "View Insights",
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Customer Success Stories",
      button: "Read Case Studies",
      src: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  return (
    <div className="relative overflow-hidden w-full h-full py-20 bg-black">
      <Carousel
      plugins={[
        Autoplay({
          delay: 4000,
        }),
      ]} slides={slideData} />
      <Meteors number={50} />
    </div>
  );
}
