import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function CustomerRegistration() {
  const [, setLocation] = useLocation();
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    shopName: "",
    deliveryLocation: ""
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await apiRequest("POST", "/api/customer/login", { phoneNumber });
      return response.json();
    },
    onSuccess: (customer) => {
      toast({
        title: `Welcome back, ${customer.fullName}!`,
        description: "Redirecting to order page...",
      });
      setTimeout(() => setLocation("/order"), 1500);
    },
    onError: () => {
      toast({
        title: "Customer not found",
        description: "No account found with this phone number. Please register first.",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("POST", "/api/customer/register", customerData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Welcome! Redirecting to order page...",
      });
      setLocation("/order");
    },
    onError: () => {
      toast({
        title: "Registration failed",
        description: "Please try again with valid information.",
        variant: "destructive",
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to login.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(phoneNumber.trim());
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.deliveryLocation.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      fullName: formData.fullName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      shopName: formData.shopName.trim() || undefined,
      deliveryLocation: formData.deliveryLocation.trim()
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {isLoginMode ? (
                <LogIn className="text-blue-600 h-6 w-6" />
              ) : (
                <UserPlus className="text-blue-600 h-6 w-6" />
              )}
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900 mb-2">
              {isLoginMode ? "Welcome Back!" : "Welcome!"}
            </CardTitle>
            <p className="text-gray-600">
              {isLoginMode ? "Enter your phone number to login" : "Please register to start placing orders"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {isLoginMode ? (
                <>
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setIsLoginMode(false)} 
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button 
                    onClick={() => setIsLoginMode(true)} 
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Login here
                  </button>
                </>
              )}
            </p>
          </CardHeader>
          
          <CardContent>
            {isLoginMode ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </Label>
                  <Input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your registered phone number"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </Label>
                  <Input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Name (Optional)
                  </Label>
                  <Input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => handleInputChange("shopName", e.target.value)}
                    className="w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Location *
                  </Label>
                  <Textarea
                    required
                    rows={3}
                    value={formData.deliveryLocation}
                    onChange={(e) => handleInputChange("deliveryLocation", e.target.value)}
                    className="w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  {registerMutation.isPending ? "Registering..." : "Register & Continue"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
