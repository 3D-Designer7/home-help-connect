import { Droplets, Zap, Wind, PipetteIcon, Flame, TreePine, Wrench, Radio } from "lucide-react";

export const categories = [
  { name: "Plumber", slug: "plumber", icon: Droplets, color: "--cat-plumber" },
  { name: "Electrician", slug: "electrician", icon: Zap, color: "--cat-electrician" },
  { name: "AC Technician", slug: "ac-technician", icon: Wind, color: "--cat-ac" },
  { name: "Drainage", slug: "drainage", icon: PipetteIcon, color: "--cat-drainage" },
  { name: "Stove Repair", slug: "stove-repair", icon: Flame, color: "--cat-stove" },
  { name: "Wood Worker", slug: "wood-worker", icon: TreePine, color: "--cat-wood" },
  { name: "Metal Worker", slug: "metal-worker", icon: Wrench, color: "--cat-metal" },
  { name: "Telecom", slug: "telecom", icon: Radio, color: "--cat-telecom" },
];

export const mockProviders = [
  { id: "1", name: "Ahmad Khan", category: "Plumber", distance: "1.2 km", description: "Expert plumber with 8 years experience. Specializing in pipe repair, installation, and water heater maintenance.", available: true },
  { id: "2", name: "Bilal Ahmed", category: "Plumber", distance: "2.5 km", description: "Reliable plumbing services for residential and commercial properties. Quick response time.", available: true },
  { id: "3", name: "Hassan Ali", category: "Electrician", distance: "0.8 km", description: "Certified electrician handling wiring, circuit breaker repair, and electrical installations.", available: false },
  { id: "4", name: "Omar Farooq", category: "AC Technician", distance: "3.1 km", description: "AC installation, repair, and maintenance. All major brands serviced.", available: true },
  { id: "5", name: "Tariq Mehmood", category: "Stove Repair", distance: "1.8 km", description: "Gas and electric stove repair specialist. Fast and affordable service.", available: true },
  { id: "6", name: "Usman Raza", category: "Wood Worker", distance: "4.2 km", description: "Custom furniture, door repair, and woodworking. Quality craftsmanship guaranteed.", available: true },
];
