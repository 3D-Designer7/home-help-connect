import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import ProviderCard from "@/components/ProviderCard";
import CategoryCard from "@/components/CategoryCard";
import { categories, mockProviders } from "@/data/mockData";

const SearchProviders = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const filtered = selectedCategory
    ? mockProviders.filter((p) => p.category.toLowerCase().replace(/\s+/g, "-") === selectedCategory)
    : mockProviders;

  const activeCat = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="font-display font-bold text-2xl text-foreground">
          {activeCat ? `${activeCat.name} Services` : "All Service Providers"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {filtered.length} provider{filtered.length !== 1 ? "s" : ""} found near you
        </p>

        {/* Category pills */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8 space-y-4">
          {filtered.length > 0 ? (
            filtered.map((provider) => (
              <ProviderCard key={provider.id} {...provider} />
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No providers found</p>
              <p className="text-sm mt-1">Try selecting a different category</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchProviders;
