import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Barcode } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProductItem } from "@/components/product-item";
import { SuccessModal } from "@/components/success-modal";

export default function CustomerOrder() {
  const [orderItems, setOrderItems] = useState<Map<string, number>>(new Map());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data using React Query
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["/api/customer/current"],
  });

  const { data: storeStatus, isLoading: storeStatusLoading } = useQuery({
    queryKey: ["/api/store/status"],
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      setOrderItems(new Map());
      setShowSuccessModal(true);
      toast({
        title: "Order placed successfully!",
        description: "Your order has been received and is being processed.",
      });
    }
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderItems(prev => {
      const newMap = new Map(prev);
      if (quantity === 0) {
        newMap.delete(productId);
      } else {
        newMap.set(productId, quantity);
      }
      return newMap;
    });
  };

  const calculateTotals = () => {
    let totalItems = 0;
    let grandTotal = 0;

    for (const category of categories) {
      if (category.products) {
        for (const product of category.products) {
          const quantity = orderItems.get(product.id) || 0;
          totalItems += quantity;
          grandTotal += product.price * quantity;
        }
      }
    }

    return { totalItems, grandTotal };
  };

  const handlePlaceOrder = () => {
    if (totalItems === 0 || !customer) return;

    const orderItemsList: any[] = [];
    
    for (const category of categories) {
      if (category.products) {
        for (const product of category.products) {
          const quantity = orderItems.get(product.id) || 0;
          if (quantity > 0) {
            orderItemsList.push({
              productId: product.id,
              productName: product.name,
              price: product.price,
              quantity,
              total: product.price * quantity
            });
          }
        }
      }
    }

    placeOrderMutation.mutate({
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phoneNumber,
      items: orderItemsList,
      totalItems,
      grandTotal,
      status: 'received',
      isPaid: false
    });
  };

  const { totalItems, grandTotal } = calculateTotals();
  const todayDate = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const isStoreOpen = storeStatus?.isOpen || false;

  if (categoriesLoading || customerLoading || storeStatusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isStoreOpen && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 text-center">
          <Barcode className="inline mr-2 h-4 w-4" />
          Store is currently closed. Please check back later.
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Today's Rates</h2>
                <p className="text-gray-600">Rates for {todayDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">{customer?.fullName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Categories */}
        <div className="space-y-6">
          {categories.map((category: any) => (
            <Card key={category.id}>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.products && category.products.map((product: any) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      quantity={orderItems.get(product.id) || 0}
                      onQuantityChange={handleQuantityChange}
                      disabled={!isStoreOpen}
                    />
                  ))}
                  {(!category.products || category.products.length === 0) && (
                    <p className="text-gray-500 text-center py-4 col-span-full">No products available in this category</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-xl font-semibold">
              <span className="text-gray-900">Grand Total:</span>
              <span className="text-blue-600">₹{grandTotal}</span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePlaceOrder}
                disabled={!isStoreOpen || totalItems === 0 || placeOrderMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {placeOrderMutation.isPending ? "Placing Order..." : "Place Order"}
              </Button>
              <Button
                asChild
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <a href="tel:+919876543210">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Us
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}