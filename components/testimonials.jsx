import { Card, CardContent } from "@/components/ui/card";

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "QuickDesk transformed our customer support from chaotic to streamlined. We've reduced response times by 75% and our customer satisfaction scores have never been higher.",
      name: "Sarah Chen",
      designation: "Head of Customer Success at TechFlow",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "The AI-powered ticket routing and automated workflows have revolutionized our support operations. Our team can now focus on solving complex problems rather than administrative tasks.",
      name: "Michael Rodriguez",
      designation: "VP of Support at InnovateSphere",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Since implementing QuickDesk, our first-call resolution rate increased by 60%. The real-time collaboration features have made our support team more efficient than ever.",
      name: "Emily Watson",
      designation: "Customer Operations Director at CloudScale",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "The comprehensive analytics and reporting give us unprecedented visibility into our support performance. We can now make data-driven decisions to improve customer experience.",
      name: "James Kim",
      designation: "Support Engineering Lead at DataPro",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "QuickDesk scales beautifully with our growing business. From 100 to 10,000 tickets per month, the platform handles everything seamlessly while maintaining exceptional performance.",
      name: "Lisa Thompson",
      designation: "VP of Customer Experience at FutureNet",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <img
                src={testimonial.src}
                alt={testimonial.name}
                className="h-12 w-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.designation}</p>
              </div>
            </div>
            <blockquote className="text-gray-700 italic leading-relaxed">
              "{testimonial.quote}"
            </blockquote>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
