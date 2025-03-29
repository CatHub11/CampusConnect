import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Category } from "@shared/schema";

interface CategoryTagProps {
  category: Category;
  onClick?: () => void;
  onRemove?: () => void;
  selected?: boolean;
  className?: string;
}

const CategoryTag = ({ 
  category, 
  onClick, 
  onRemove, 
  selected = false, 
  className = "" 
}: CategoryTagProps) => {
  const textColor = selected ? "text-white" : "text-foreground";
  const badgeStyle = {
    backgroundColor: selected ? category.color : 'transparent',
    borderColor: category.color,
    color: selected ? 'white' : 'inherit',
    cursor: onClick ? 'pointer' : 'default'
  };

  return (
    <Badge 
      style={badgeStyle}
      className={`flex items-center gap-1 border ${textColor} ${className}`}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <span 
        className="w-2 h-2 rounded-full" 
        style={{ backgroundColor: category.color }}
      />
      {category.name}
      {onRemove && (
        <X 
          className="h-3 w-3 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </Badge>
  );
};

export default CategoryTag;