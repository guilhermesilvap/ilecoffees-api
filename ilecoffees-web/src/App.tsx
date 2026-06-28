import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PrivateRoute, GuestRoute } from "@/components/PrivateRoute";
import { PageTransition, RouteLoadingBar } from "@/components/PageTransition";
import Index from "./pages/Index";
import Home from "./pages/Home";
import SupplierHome from "./pages/Home/SupplierHome";
import ProducerHome from "./pages/Home/ProducerHome";
import CoffeeShopHome from "./pages/Home/CoffeeShopHome";
import CustomerHome from "./pages/Home/CustomerHome";
import CafeteriaLanding from "./pages/Landing/CafeteriaLanding";
import FornecedorLanding from "./pages/Landing/FornecedorLanding";
import Login from "./pages/Login";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSupplier from "./pages/RegisterSupplier";
import SupplierDashboard from "./pages/Dashboard/Supplier";
import ProducerDashboard from "./pages/Dashboard/Producer";
import SupplierCatalog from "./pages/Dashboard/SupplierCatalog";
import CoffeeShopDashboard from "./pages/Dashboard/CoffeeShop";
import CustomerDashboard from "./pages/Dashboard/Customer";
import AdminDashboard from "./pages/Dashboard/Admin";
import EmployeeDashboard from "./pages/Dashboard/Employee";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import CourseDetails from "./pages/CourseDetails";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import Courses from "./pages/Courses";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionDetail from "./pages/SubscriptionDetail";
import TrackOrder from "./pages/TrackOrder";
import CheckoutPage from "./pages/CheckoutPage";
import MpCallback from "./pages/MpCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RootRoute() {
  const { isAuthenticated, type, user, supplierType } = useAuth();
  if (!isAuthenticated) return <Home />;
  if (type === "ADMIN") return <Navigate to="/dashboard/admin" replace />;
  if (type === "EMPLOYEE") return <Navigate to="/dashboard/employee" replace />;
  if (type === "SUPPLIER") return <Navigate to={supplierType === "PRODUCER" ? "/home/producer" : "/roaster"} replace />;
  if (user?.accountType === "COFFEESHOP") return <Navigate to="/home/coffeeshop" replace />;
  return <Navigate to="/home/customer" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <RouteLoadingBar />
            <PageTransition>
              <Routes>
                {/* Públicas */}
                <Route path="/" element={<RootRoute />} />
                <Route path="/roaster" element={<SupplierHome />} />
                <Route path="/supplier" element={<FornecedorLanding />} />
                <Route path="/coffeeshop" element={<CafeteriaLanding />} />
                <Route path="/home/producer" element={<ProducerHome />} />
                <Route path="/home/coffeeshop" element={<CoffeeShopHome />} />
                <Route path="/home/customer" element={<CustomerHome />} />
                <Route path="/explore" element={<Index />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<CourseDetails />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />
                <Route path="/track/:orderId" element={<TrackOrder />} />

                {/* Somente para visitantes (redireciona quem já está logado) */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register/customer" element={<GuestRoute><RegisterCustomer /></GuestRoute>} />
                <Route path="/register/supplier" element={<GuestRoute><RegisterSupplier /></GuestRoute>} />

                {/* Torrefador */}
                <Route path="/dashboard/supplier" element={
                  <PrivateRoute allow="SUPPLIER" supplierType="ROASTER"><SupplierDashboard /></PrivateRoute>
                } />
                <Route path="/dashboard/supplier/catalog" element={
                  <PrivateRoute allow="SUPPLIER" supplierType="ROASTER"><SupplierCatalog /></PrivateRoute>
                } />

                {/* Produtor */}
                <Route path="/dashboard/producer" element={
                  <PrivateRoute allow="SUPPLIER" supplierType="PRODUCER"><ProducerDashboard /></PrivateRoute>
                } />

                {/* Cafeteria */}
                <Route path="/dashboard/coffeeshop" element={
                  <PrivateRoute allow="USER" accountType="COFFEESHOP"><CoffeeShopDashboard /></PrivateRoute>
                } />

                {/* Cliente */}
                <Route path="/dashboard/customer" element={
                  <PrivateRoute allow="USER" accountType="CUSTOMER"><CustomerDashboard /></PrivateRoute>
                } />

                {/* Admin */}
                <Route path="/dashboard/admin" element={
                  <PrivateRoute allow="ADMIN"><AdminDashboard /></PrivateRoute>
                } />

                {/* Funcionário */}
                <Route path="/dashboard/employee" element={
                  <PrivateRoute allow="EMPLOYEE"><EmployeeDashboard /></PrivateRoute>
                } />

                {/* Autenticadas (qualquer role) */}
                <Route path="/profile" element={
                  <PrivateRoute allow={["USER", "SUPPLIER", "ADMIN"]}><Profile /></PrivateRoute>
                } />
                <Route path="/purchase-success" element={
                  <PrivateRoute allow={["USER", "SUPPLIER", "ADMIN"]}><PurchaseSuccess /></PrivateRoute>
                } />
                <Route path="/checkout" element={
                  <PrivateRoute allow={["USER", "SUPPLIER", "ADMIN"]}><CheckoutPage /></PrivateRoute>
                } />

                {/* Mercado Pago OAuth callback */}
                <Route path="/supplier/mp/callback" element={<MpCallback />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
