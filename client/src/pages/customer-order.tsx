import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Store, Barcode } from "lucide-react";
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
      for (const product of category.items) {
        const quantity = orderItems.get(product.id) || 0;
        totalItems += quantity;
        grandTotal += product.price * quantity;
      }
    }

    return { totalItems, grandTotal };
  };

  const handlePlaceOrder = () => {
    if (!customer) return;

    const orderItemsList: OrderItem[] = [];
    
    for (const category of categories) {
      for (const product of category.items) {
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

    if (orderItemsList.length === 0) {
      alert("Please add items to your order");
      return;
    }

    const { totalItems, grandTotal } = calculateTotals();

    storage.placeOrder({
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phoneNumber,
      items: orderItemsList,
      totalItems,
      grandTotal,
      status: 'received',
      isPaid
    });

    setOrderItems(new Map());
    setShowSuccessModal(true);
  };

  const { totalItems, grandTotal } = calculateTotals();
  const todayDate = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

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
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <i className={`${category.icon} text-brand-600 mr-3`}></i>
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      quantity={orderItems.get(product.id) || 0}
                      onQuantityChange={handleQuantityChange}
                      disabled={!isStoreOpen}
                    />
                  ))}
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
              <span className="text-brand-600">₹{grandTotal}</span>
            </div>
            

            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePlaceOrder}
                disabled={!isStoreOpen || totalItems === 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                <i className="fas fa-check mr-2"></i>
                Place Order
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
