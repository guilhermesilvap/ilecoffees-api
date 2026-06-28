import { Button } from "@/components/ui/button";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CartButton } from "@/components/Cart/CartButton";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  userType: string;
  userName?: string;
}

const TYPE_LABELS: Record<string, string> = {
  supplier: "Fornecedor",
  coffeeshop: "Cafeteria",
  customer: "Cliente",
  admin: "Administrador",
};

export function DashboardHeader({ userType, userName }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = userName ?? user?.name ?? "Usuário";
  const initials = displayName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="ile-container h-16 flex items-center justify-between">
        {/* Logo + label */}
        <div className="flex items-center gap-3">
          <Logo className="h-12 cursor-pointer" onClick={() => navigate("/explore")} />
          <span className="hidden sm:block text-xs font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
            {TYPE_LABELS[userType] ?? "Usuário"}
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {(userType === "customer" || userType === "coffeeshop") && (
            <CartButton />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={(user as any)?.photoUrl ?? undefined} alt={displayName} />
                  <AvatarFallback className="text-xs font-semibold" style={{ background: '#0f2315', color: '#d8ead0' }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/dashboard/${userType}`)}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Painel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
