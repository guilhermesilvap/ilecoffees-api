import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AllowedType = "USER" | "SUPPLIER" | "ADMIN" | "EMPLOYEE";

interface PrivateRouteProps {
  children: React.ReactNode;
  allow: AllowedType | AllowedType[];
  accountType?: "CUSTOMER" | "COFFEESHOP";
  supplierType?: "PRODUCER" | "ROASTER";
}

function ownDashboard(
  type: string | null,
  accountType?: string,
  supplierType?: string | null,
): string {
  if (type === "ADMIN") return "/dashboard/admin";
  if (type === "EMPLOYEE") return "/dashboard/employee";
  if (type === "SUPPLIER") return supplierType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier";
  if (accountType === "COFFEESHOP") return "/dashboard/coffeeshop";
  return "/dashboard/customer";
}

export function PrivateRoute({ children, allow, accountType, supplierType }: PrivateRouteProps) {
  const { isAuthenticated, type, user, supplierType: userSupplierType } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!type || !allowed.includes(type as AllowedType)) {
    return <Navigate to={ownDashboard(type, user?.accountType, userSupplierType)} replace />;
  }

  if (accountType && user?.accountType !== accountType) {
    return <Navigate to={ownDashboard(type, user?.accountType, userSupplierType)} replace />;
  }

  if (supplierType && userSupplierType !== supplierType) {
    return <Navigate to={ownDashboard(type, user?.accountType, userSupplierType)} replace />;
  }

  return <>{children}</>;
}

/** Redireciona usuário já autenticado para seu dashboard */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, type, user, supplierType } = useAuth();

  if (!isAuthenticated) return <>{children}</>;

  if (type === "ADMIN") return <Navigate to="/dashboard/admin" replace />;
  if (type === "SUPPLIER") {
    return <Navigate to={supplierType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier"} replace />;
  }
  if (user?.accountType === "COFFEESHOP") return <Navigate to="/dashboard/coffeeshop" replace />;
  if (type === "USER") return <Navigate to="/dashboard/customer" replace />;
  if (type === "EMPLOYEE") return <Navigate to="/dashboard/employee" replace />;
  return <Navigate to="/explore" replace />;
}
