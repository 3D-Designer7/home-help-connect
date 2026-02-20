import { Search, Shield, Phone } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "Browse categories or search for the service you need in your area.",
  },
  {
    icon: Shield,
    title: "Choose",
    description: "View profiles, check availability, and pick the right professional.",
  },
  {
    icon: Phone,
    title: "Connect",
    description: "Call or message directly to discuss details and get the job done.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-20 bg-muted/50">
      <div className="container">
        <h2 className="font-display font-bold text-3xl text-center text-foreground">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mt-2 max-w-md mx-auto">
          Get help in three simple steps
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-hero-gradient flex items-center justify-center text-primary-foreground mb-4">
                <step.icon size={28} />
              </div>
              <div className="text-xs font-bold text-primary mb-2">STEP {i + 1}</div>
              <h3 className="font-display font-bold text-xl text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
