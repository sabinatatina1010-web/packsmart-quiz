import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  Boxes,
  CircleDot,
  Clock,
  Cloud,
  Container,
  GlassWater,
  Layers,
  Leaf,
  Package,
  ScrollText,
  Shirt,
  UtensilsCrossed,
  Warehouse,
  Zap,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Package,
  GlassWater,
  UtensilsCrossed,
  Shirt,
  Warehouse,
  Layers,
  Boxes,
  Container,
  CircleDot,
  ScrollText,
  Cloud,
  Clock,
  Zap,
  Leaf,
  BadgeCheck,
}

export function getOptionIcon(name: string): LucideIcon {
  return ICONS[name] ?? Package
}
