import {
  Award,
  CalendarClock,
  ClipboardList,
  HardHat,
  KeyRound,
  Headset,
  Layers,
  ShieldCheck,
  Target,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceIconName } from '@/content/services'
import type { DifferentialIcon } from '@/content/differentials'

export const serviceIcons: Record<ServiceIconName, LucideIcon> = {
  execution: HardHat,
  administration: ClipboardList,
  sales: KeyRound,
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

