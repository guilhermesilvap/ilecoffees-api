import { useNavigate } from "react-router-dom";
import { Checkout } from "@/components/Checkout/Checkout";

export default function CheckoutPage() {
  const navigate = useNavigate();
  return (
    <Checkout
      onClose={() => navigate("/")}
      onBack={() => navigate(-1)}
    />
  );
}
