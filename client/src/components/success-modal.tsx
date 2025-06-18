import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <DialogTitle className="text-center text-lg font-medium text-gray-900">
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-6">
            Your order has been received. We'll contact you shortly for confirmation.
          </p>
          <Button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
