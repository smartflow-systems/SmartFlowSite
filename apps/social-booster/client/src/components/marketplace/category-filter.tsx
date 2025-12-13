import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Sparkles, Shirt, Smartphone, Zap } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "All Categories", icon: Store, count: "15+ templates" },
  { id: "E-commerce", name: "E-commerce", icon: Store, count: "8 templates" },
  { id: "Beauty", name: "Beauty", icon: Sparkles, count: "3 templates" },
  { id: "Fashion", name: "Fashion", icon: Shirt, count: "2 templates" },
  { id: "Technology", name: "Technology", icon: Smartphone, count: "2 templates" },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="bg-card-bg border border-secondary-brown rounded-xl p-6 mb-8">
      <h3 className="text-lg font-bold mb-4">Browse by Category</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all ${
                isSelected 
                  ? 'bg-accent-gold text-primary-black border-accent-gold' 
                  : 'hover:bg-secondary-brown hover:border-accent-gold'
              }`}
            >
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold text-sm">{category.name}</div>
                <div className="text-xs opacity-70">{category.count}</div>
              </div>
              {isSelected && (
                <Badge className="bg-primary-black text-accent-gold text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}