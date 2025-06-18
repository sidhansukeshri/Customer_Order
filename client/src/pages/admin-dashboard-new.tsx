import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, ShoppingCart, Package, Tags, Download, Plus, Edit, Trash2, Save, LogOut } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [editingProduct, setEditingProduct] = useState<{categoryId: string, productId: string} | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📦");
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newProductData, setNewProductData] = useState<{categoryId: string, name: string, price: string}>({
    categoryId: "",
    name: "",
    price: ""
  });
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data using React Query
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: storeStatus, isLoading: storeStatusLoading } = useQuery({
    queryKey: ["/api/store/status"],
  });

  // Mutations
  const storeToggleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/store/toggle", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/status"] });
      toast({
        title: "Store status updated",
        description: "Store status has been changed successfully.",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout", {});
      return response.json();
    },
    onSuccess: () => {
      setLocation("/admin/login");
    }
  });

  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, icon }: { name: string, icon: string }) => {
      const response = await apiRequest("POST", "/api/categories", { name, icon });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCategoryName("");
      setNewCategoryIcon("📦");
      setShowAddCategoryDialog(false);
      toast({
        title: "Category added",
        description: "Category has been added successfully.",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await apiRequest("DELETE", `/api/categories/${categoryId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully.",
      });
    }
  });

  const addProductMutation = useMutation({
    mutationFn: async ({ categoryId, name, price }: { categoryId: string, name: string, price: number }) => {
      const response = await apiRequest("POST", "/api/products", { categoryId, name, price });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewProductData({ categoryId: "", name: "", price: "" });
      setShowAddProductDialog(false);
      toast({
        title: "Product added",
        description: "Product has been added successfully.",
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async ({ categoryId, productId }: { categoryId: string, productId: string }) => {
      const response = await apiRequest("DELETE", `/api/products/${categoryId}/${productId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order status updated",
        description: "Order status has been updated successfully.",
      });
    }
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ orderId, isPaid }: { orderId: string, isPaid: boolean }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/payment`, { isPaid });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Payment status updated",
        description: "Payment status has been updated successfully.",
      });
    }
  });

  // Event handlers
  const handleStoreToggle = () => {
    storeToggleMutation.mutate();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteProduct = (categoryId: string, productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate({ categoryId, productId });
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategoryMutation.mutate({ name: newCategoryName.trim(), icon: newCategoryIcon });
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category and all its products?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleAddProduct = () => {
    if (newProductData.name.trim() && newProductData.price && newProductData.categoryId) {
      addProductMutation.mutate({
        categoryId: newProductData.categoryId,
        name: newProductData.name.trim(),
        price: parseInt(newProductData.price)
      });
    }
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handlePaymentToggle = (orderId: string, isPaid: boolean) => {
    updatePaymentMutation.mutate({ orderId, isPaid });
  };

  const exportData = (type: 'customers' | 'orders') => {
    if (type === 'customers') {
      const csvData = generateCustomersCSV(customers);
      downloadCSV(csvData, 'customers.csv');
    } else {
      const csvData = generateOrdersCSV(orders);
      downloadCSV(csvData, 'orders.csv');
    }
  };

  const generateCustomersCSV = (customers: any[]) => {
    const headers = ['ID', 'Full Name', 'Phone Number', 'Shop Name', 'Delivery Location', 'Registered At'];
    const rows = customers.map(customer => [
      customer.id,
      customer.fullName,
      customer.phoneNumber,
      customer.shopName || '',
      customer.deliveryLocation,
      new Date(customer.registeredAt).toLocaleDateString()
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateOrdersCSV = (orders: any[]) => {
    const headers = ['ID', 'Customer Name', 'Phone', 'Total Items', 'Grand Total', 'Status', 'Date'];
    const rows = orders.map(order => [
      order.id,
      order.customerName,
      order.customerPhone,
      order.totalItems,
      order.grandTotal,
      order.status,
      new Date(order.createdAt).toLocaleDateString()
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.grandTotal, 0);
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const totalProducts = categories.reduce((sum: number, category: any) => sum + (category.products?.length || 0), 0);

  if (categoriesLoading || customersLoading || ordersLoading || storeStatusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your business operations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="store-toggle" className="text-sm font-medium">
                Store Status:
              </Label>
              <Switch
                id="store-toggle"
                checked={storeStatus?.isOpen || false}
                onCheckedChange={handleStoreToggle}
                disabled={storeToggleMutation.isPending}
              />
              <span className={`text-sm font-medium ${storeStatus?.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {storeStatus?.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Tags className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories">Categories & Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="exports">Data Export</TabsTrigger>
          </TabsList>

          {/* Categories & Products Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Manage Categories & Products</h2>
              <div className="flex gap-2">
                <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input
                          id="category-name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-icon">Icon (emoji)</Label>
                        <Input
                          id="category-icon"
                          value={newCategoryIcon}
                          onChange={(e) => setNewCategoryIcon(e.target.value)}
                          placeholder="📦"
                        />
                      </div>
                      <Button 
                        onClick={handleAddCategory} 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={addCategoryMutation.isPending}
                      >
                        {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product-category">Category</Label>
                        <select
                          id="product-category"
                          value={newProductData.categoryId}
                          onChange={(e) => setNewProductData({...newProductData, categoryId: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category: any) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input
                          id="product-name"
                          value={newProductData.name}
                          onChange={(e) => setNewProductData({...newProductData, name: e.target.value})}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-price">Price (₹)</Label>
                        <Input
                          id="product-price"
                          type="number"
                          value={newProductData.price}
                          onChange={(e) => setNewProductData({...newProductData, price: e.target.value})}
                          placeholder="Enter price"
                        />
                      </div>
                      <Button 
                        onClick={handleAddProduct} 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={addProductMutation.isPending}
                      >
                        {addProductMutation.isPending ? "Adding..." : "Add Product"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-6">
              {categories.map((category: any) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        {category.name}
                      </CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.products && category.products.length > 0 ? (
                        category.products.map((product: any) => (
                          <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">₹{product.price}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(category.id, product.id)}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No products in this category</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(orders as any[]).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.customerPhone}</TableCell>
                        <TableCell>{order.totalItems}</TableCell>
                        <TableCell>₹{order.grandTotal}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={order.isPaid ? "default" : "outline"}
                            onClick={() => handlePaymentToggle(order.id, !order.isPaid)}
                            className={order.isPaid ? "bg-green-600 hover:bg-green-700" : "text-orange-600 border-orange-600 hover:bg-orange-50"}
                          >
                            {order.isPaid ? "Paid" : "Unpaid"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <select
                            value={order.status}
                            onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                            className="p-1 border border-gray-300 rounded text-sm"
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <option value="received">Received</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Shop Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.fullName}</TableCell>
                        <TableCell>{customer.phoneNumber}</TableCell>
                        <TableCell>{customer.shopName || '-'}</TableCell>
                        <TableCell>{customer.deliveryLocation}</TableCell>
                        <TableCell>{new Date(customer.registeredAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Export Tab */}
          <TabsContent value="exports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Customer Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Download a CSV file containing all customer information including names, phone numbers, and delivery locations.
                  </p>
                  <Button onClick={() => exportData('customers')} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Customers CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Order Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Download a CSV file containing all order information including customer details, items, and totals.
                  </p>
                  <Button onClick={() => exportData('orders')} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Orders CSV
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}