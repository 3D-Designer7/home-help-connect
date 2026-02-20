import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  color: string;
  slug: string;
}

const CategoryCard = ({ name, icon: Icon, color, slug }: CategoryCardProps) => {
  return (
    <Link
      to={`/search?category=${slug}`}
      className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `hsl(var(${color}) / 0.12)`, color: `hsl(var(${color}))` }}
      >
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <span className="text-sm font-semibold text-foreground text-center">{name}</span>
    </Link>
  );
};

export default CategoryCard;
