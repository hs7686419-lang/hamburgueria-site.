import {
  Award,
  Building2,
  CalendarClock,
  ClipboardList,
  Compass,
  Hammer,
  House,
  Headset,
  Layers,
  LineChart,
  PlugZap,
  ShieldCheck,
  Target,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceIconName } from '@/content/services'
import type { DifferentialIcon } from '@/content/differentials'

export const serviceIcons: Record<ServiceIconName, LucideIcon> = {
  home: House,
  blueprint: Compass,
  structure: Building2,
  management: LineChart,
  consulting: ClipboardList,
  installations: PlugZap,
  renovation: Hammer,
}

export const differentialIcons: Record<DifferentialIcon, LucideIcon> = {
  experience: Award,
  quality: Target,
  planning: Layers,
  service: Headset,
  organization: ClipboardList,
  deadline: CalendarClock,
  safety: ShieldCheck,
}

