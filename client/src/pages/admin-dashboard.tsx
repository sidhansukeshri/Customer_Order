import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, ShoppingCart, Package, Tags, Download, Plus, Edit, Trash2, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [editingProduct, setEditingProduct] = useState<{categoryId: string, productId: string} | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("fas fa-tag");
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

  const handleStoreToggle = (checked: boolean) => {
    storage.toggleStore();
    setIsStoreOpen(checked);
  };

  const handleLogout = () => {
    storage.setAdminLoggedIn(false);
    setLocation("/admin/login");
  };

  const handleProductUpdate = (categoryId: string, productId: string, field: string, value: string | number) => {
    const updates: Partial<Product> = { [field]: value };
    storage.updateProduct(categoryId, productId, updates);
    loadData();
  };

  const handleDeleteProduct = (categoryId: string, productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      storage.deleteProduct(categoryId, productId);
      loadData();
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      storage.addCategory(newCategoryName.trim(), newCategoryIcon);
      setNewCategoryName("");
      setNewCategoryIcon("fas fa-tag");
      setShowAddCategoryDialog(false);
      loadData();
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category and all its products?")) {
      storage.deleteCategory(categoryId);
      loadData();
    }
  };

  const handleAddProduct = () => {
    if (newProductData.name.trim() && newProductData.price && newProductData.categoryId) {
      storage.addProduct(newProductData.categoryId, {
        name: newProductData.name.trim(),
        price: parseInt(newProductData.price)
      });
      setNewProductData({ categoryId: "", name: "", price: "" });
      setShowAddProductDialog(false);
      loadData();
    }
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: string) => {
    // For now, update in localStorage - will be replaced with API call
    const orders = storage.getOrders();
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus as any } : order
    );
    localStorage.setItem('localBusinessOrders', JSON.stringify({
      ...JSON.parse(localStorage.getItem('localBusinessOrders') || '{}'),
      orders: updatedOrders
    }));
    loadData();
  };

  const exportCustomersCSV = () => {
    const csv = storage.exportCustomersCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportOrdersCSV = () => {
    const csv = storage.exportOrdersCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Store Status:</span>
                  <Switch
                    checked={isStoreOpen}
                    onCheckedChange={handleStoreToggle}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {isStoreOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Tabs */}
        <Card>
          <Tabs defaultValue="customers" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                <TabsTrigger value="customers" className="flex items-center justify-start p-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 data-[state=active]:text-brand-600">
                  <Users className="mr-2 h-4 w-4" />
                  Customers
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center justify-start p-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 data-[state=active]:text-brand-600">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center justify-start p-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 data-[state=active]:text-brand-600">
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center justify-start p-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 data-[state=active]:text-brand-600">
                  <Tags className="mr-2 h-4 w-4" />
                  Categories
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Customers Tab */}
            <TabsContent value="customers" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Registered Customers</h3>
                <Button
                  onClick={exportCustomersCSV}
                  variant="outline"
                  className="text-brand-600 border-brand-600 hover:bg-brand-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
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
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.fullName}</TableCell>
                        <TableCell>{customer.phoneNumber}</TableCell>
                        <TableCell>{customer.shopName || "-"}</TableCell>
                        <TableCell>{customer.deliveryLocation}</TableCell>
                        <TableCell>{new Date(customer.registeredAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {customers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No customers registered yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Customer Orders</h3>
                <Button
                  onClick={exportOrdersCSV}
                  variant="outline"
                  className="text-brand-600 border-brand-600 hover:bg-brand-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-white border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">Order #{order.id}</h4>
                          <p className="text-sm text-gray-600">{order.customerName} - {order.customerPhone}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-emerald-600">₹{order.grandTotal}</span>
                          <p className="text-sm text-gray-600">{order.totalItems} items</p>
                        </div>
                      </div>
                      
                      {/* Order Status and Payment */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as any)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="received">Received</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 mr-2">Payment:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.isPaid 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'delivered' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'in_transit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-gray-900 mb-2">Order Items:</h5>
                        {order.items.map((item, index) => (
                          <p key={index}>• {item.productName} x{item.quantity} bags (₹{item.total})</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {orders.length === 0 && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-8 text-center text-gray-500">
                      No orders placed yet
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
                  <p className="text-sm text-gray-600">Add new products to existing categories and update prices</p>
                </div>
                <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <select
                          value={newProductData.categoryId}
                          onChange={(e) => setNewProductData(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 mt-1"
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Product Name</Label>
                        <Input
                          value={newProductData.name}
                          onChange={(e) => setNewProductData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Premium Basmati Rice"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Price per 50kg bag (₹)</Label>
                        <Input
                          type="number"
                          value={newProductData.price}
                          onChange={(e) => setNewProductData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="1500"
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={handleAddProduct} className="w-full bg-brand-600 hover:bg-brand-700">
                        Add Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-6">
                {categories.map((category) => (
                  <Card key={category.id} className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <i className={`${category.icon} text-brand-600 mr-2`}></i>
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.items.map((product) => (
                          <Card key={product.id} className="bg-white">
                            <CardContent className="p-3">
                              <div className="grid grid-cols-3 gap-4 items-center">
                                <Input
                                  value={product.name}
                                  onChange={(e) => handleProductUpdate(category.id, product.id, 'name', e.target.value)}
                                  className="focus:ring-2 focus:ring-brand-500"
                                />
                                <div className="flex items-center">
                                  <span className="text-gray-600 mr-2">₹</span>
                                  <Input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) => handleProductUpdate(category.id, product.id, 'price', parseInt(e.target.value))}
                                    className="flex-1 focus:ring-2 focus:ring-brand-500"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDeleteProduct(category.id, product.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {category.items.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No products in this category</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="p-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Category Management</h3>
                <p className="text-gray-600 mb-6">Add new commodity categories like Lentils, Sugar, Spices, etc.</p>
                <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl px-8 py-3 text-lg font-semibold">
                      <Plus className="mr-3 h-5 w-5" />
                      Add New Commodity Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Commodity Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Category Name</Label>
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="e.g., Lentils, Sugar, Spices"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Icon Class (FontAwesome)</Label>
                        <Input
                          value={newCategoryIcon}
                          onChange={(e) => setNewCategoryIcon(e.target.value)}
                          placeholder="fas fa-tag"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Examples: fas fa-seedling, fas fa-leaf, fas fa-apple-alt
                        </p>
                      </div>
                      <Button onClick={handleAddCategory} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Create Category
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Card key={category.id} className="bg-white border-2 border-gray-200 hover:border-brand-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mr-3">
                            <i className={`${category.icon} text-brand-600`}></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                            <p className="text-sm text-gray-500">{category.items.length} products</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {category.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-medium">₹{item.price}</span>
                          </div>
                        ))}
                        {category.items.length > 3 && (
                          <p className="text-xs text-gray-500">+{category.items.length - 3} more products</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add Category Card */}
                <Card className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-brand-400 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
                      <DialogTrigger asChild>
                        <div className="cursor-pointer">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="h-5 w-5 text-gray-600" />
                          </div>
                          <h4 className="font-medium text-gray-700 mb-1">Add Category</h4>
                          <p className="text-sm text-gray-500">Create a new commodity category</p>
                        </div>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
