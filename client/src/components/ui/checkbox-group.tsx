import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type CheckboxGroupContextValue = {
  value?: string[];
  onValueChange?: (value: string[]) => void;
};

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue>({});

export function CheckboxGroup({
  value,
  onValueChange,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & CheckboxGroupContextValue) {
  const contextValue = React.useMemo(
    () => ({ value, onValueChange }),
    [value, onValueChange]
  );

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <div className={cn("flex gap-4", className)} {...props}>
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

type CheckboxGroupItemProps = {
  value: string;
  id?: string;
} & Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange">;

export function CheckboxGroupItem({ value, id, ...props }: CheckboxGroupItemProps) {
  const { value: groupValue, onValueChange } = React.useContext(CheckboxGroupContext);
  
  const isChecked = groupValue?.includes(value) || false;
  
  const handleCheckedChange = (checked: boolean) => {
    if (!onValueChange) return;
    
    if (checked) {
      onValueChange([...(groupValue || []), value]);
    } else {
      onValueChange((groupValue || []).filter((v) => v !== value));
    }
  };
  
  return (
    <Checkbox
      id={id}
      checked={isChecked}
      onCheckedChange={handleCheckedChange}
      value={value}
      {...props}
    />
  );
}