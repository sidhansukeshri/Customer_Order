import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Store, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import CustomerRegistration from "@/pages/customer-registration";
import CustomerOrder from "@/pages/customer-order-new";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard-new";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location, setLocation] = useLocation();
  
  const isCustomerView = location === "/" || location === "/order";
  const isAdminView = location.startsWith("/admin");

  const handleCustomerView = () => {
    if (storage.isCustomerRegistered()) {
      setLocation("/order");
    } else {
      setLocation("/");
    }
  };

  const handleAdminView = () => {
    if (storage.isAdminLoggedIn()) {
      setLocation("/admin");
    } else {
      setLocation("/admin/login");
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Store className="text-brand-600 text-xl mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Local Business Orders</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleCustomerView}
              variant={isCustomerView ? "default" : "ghost"}
              className={isCustomerView ? "bg-brand-50 text-brand-600 hover:bg-brand-100" : "text-gray-600 hover:text-brand-600"}
            >
              Customer View
            </Button>
            <Button
              onClick={handleAdminView}
              variant={isAdminView ? "default" : "ghost"}
              className={isAdminView ? "bg-brand-50 text-brand-600 hover:bg-brand-100" : "text-gray-600 hover:text-brand-600"}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Button>
            {(isCustomerView && storage.isCustomerRegistered()) && (
              <Button
                onClick={() => {
                  localStorage.removeItem('localBusinessOrders');
                  window.location.reload();
                }}
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
            {isAdminView && storage.isAdminLoggedIn() && (
              <Button
                onClick={() => {
                  storage.setAdminLoggedIn(false);
                  setLocation("/admin/login");
                }}
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Admin Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Auto-redirect based on registration and admin login status
    if (location === "/") {
      if (storage.isCustomerRegistered()) {
        setLocation("/order");
      }
    } else if (location === "/admin") {
      if (!storage.isAdminLoggedIn()) {
        setLocation("/admin/login");
      }
    } else if (location === "/admin/login") {
      if (storage.isAdminLoggedIn()) {
        setLocation("/admin");
      }
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={CustomerRegistration} />
      <Route path="/order" component={CustomerOrder} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
