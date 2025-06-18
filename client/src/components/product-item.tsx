import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductItemProps {
  product: Product;
  quantity: number;
  onQuantityChange: (productId: string, quantity: number) => void;
  disabled?: boolean;
}

export function ProductItem({ product, quantity, onQuantityChange, disabled }: ProductItemProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const total = product.price * localQuantity;

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(0, newQuantity);
    setLocalQuantity(validQuantity);
    onQuantityChange(product.id, validQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    handleQuantityChange(value);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-600">per 50kg bag</p>
        </div>
        <span className="text-lg font-semibold text-brand-600">₹{product.price}</span>
      </div>
      
      <div className="flex items-center justify-center space-x-3 mb-3">
        <Button
          size="sm"
          variant="outline"
          className="w-10 h-10 rounded-full p-0 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
          onClick={() => handleQuantityChange(localQuantity - 1)}
          disabled={disabled || localQuantity <= 0}
        >
          <Minus className="h-4 w-4 text-red-600" />
        </Button>
        
        <Input
          type="number"
          min="0"
          value={localQuantity}
          onChange={handleInputChange}
          className="w-20 text-center font-semibold border-2 focus:border-brand-500"
          disabled={disabled}
        />
        
        <Button
          size="sm"
          className="w-10 h-10 rounded-full p-0 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600 disabled:opacity-50"
          onClick={() => handleQuantityChange(localQuantity + 1)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-center p-2 bg-gray-50 rounded">
        <span className="text-sm text-gray-600">Total: </span>
        <span className="font-bold text-lg text-gray-900">₹{total}</span>
      </div>
    </div>
  );
}
