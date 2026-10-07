import { ArrowDown, ArrowRight, Check, CheckCheck, ChevronDown, Clock3, Flower2, Heart, HeartHandshake, Layers3, LockKeyhole, Mail, Menu, MessageCircle, Phone, Plus, ShieldCheck, Sparkles, Sun, UsersRound, Wallet, X } from "lucide-react";
const icons = { arrow: ArrowRight, down: ArrowDown, check: Check, checks: CheckCheck, chevron: ChevronDown, clock: Clock3, flower: Flower2, heart: Heart, handshake: HeartHandshake, layers: Layers3, lock: LockKeyhole, mail: Mail, menu: Menu, message: MessageCircle, phone: Phone, plus: Plus, shield: ShieldCheck, sparkles: Sparkles, sun: Sun, family: UsersRound, wallet: Wallet, close: X };
export type IconName = keyof typeof icons;
export function Icon({ name, size = 22, className = "" }: { name: string; size?: number; className?: string }) {
  const Component = icons[name as IconName] || ShieldCheck;
  return <Component size={size} strokeWidth={1.65} className={className} aria-hidden="true" />;
}
