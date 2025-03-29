import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { Category } from "@shared/schema";

interface CategoryFilterProps {
  categories: Category[];
  isLoading: boolean;
  selectedCategories: number[];
  onChange: (categoryIds: number[]) => void;
}

const categoryFormSchema = insertCategorySchema.extend({
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Please enter a valid hex color code (e.g. #FF5500)",
  }),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const CategoryFilter = ({ 
  categories, 
  isLoading, 
  selectedCategories, 
  onChange 
}: CategoryFilterProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      color: "#4338ca",
      isDefault: false,
      createdBy: 1, // Placeholder for current user ID
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const response = await apiRequest("POST", "/api/categories", values);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Category created",
        description: "Your custom category has been created successfully.",
      });
      form.reset();
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create category",
        description: error.message || "An error occurred while creating the category.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: CategoryFormValues) => {
    createCategoryMutation.mutate(values);
  };

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const clearFilters = () => {
    onChange([]);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Categories</h3>
        {selectedCategories.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`flex items-center rounded-md px-2 py-1.5 transition-colors cursor-pointer hover:bg-gray-100 ${
                selectedCategories.includes(category.id) ? "bg-primary-100" : ""
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm flex-1">{category.name}</span>
              {selectedCategories.includes(category.id) && (
                <X className="h-4 w-4 text-gray-500" />
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Create Custom Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Category</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Study Groups" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Color</FormLabel>
                      <div className="flex gap-2 items-center">
                        <div 
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input placeholder="#4338ca" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createCategoryMutation.isPending}
                  >
                    {createCategoryMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Category
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm text-gray-500 mb-2">Selected Categories:</h4>
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map(id => {
              const category = categories.find(c => c.id === id);
              if (!category) return null;
              
              return (
                <Badge 
                  key={id} 
                  style={{ backgroundColor: category.color }}
                  className="text-white flex items-center gap-1"
                >
                  {category.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(id);
                    }}
                  />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
