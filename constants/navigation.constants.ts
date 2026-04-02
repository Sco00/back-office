import {
  LayoutDashboard,
  Package,
  Plane,
  Users,
  User,
  DollarSign,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Colis", href: "/packages" },
  { icon: Plane, label: "Départs GP", href: "/departures" },
  { icon: Users, label: "Clients", href: "/persons" },
  { icon: User, label: "Relais", href: "/relays" },
  { icon: DollarSign, label: "Paiements", href: "/payments" },
  { icon: MapPin, label: "Adresses", href: "/addresses" },
];
