/**
 * app/src/components/Icons.tsx
 *
 * SVG icon components — replaces emoji icons throughout the SPA.
 * Style: 24×24 viewBox, 2px stroke width, feather-inspired (like Lucide).
 * All icons accept className, size (default 24), and color (default currentColor).
 * Wraps lucide-react icons for consistency.
 */
import {
    // Navigation
    House,
    LayoutDashboard,
    GraduationCap,
    CalendarDays,
    Wallet,
    Users,
    ShoppingBag,
    LogOut,
    // Status / Feedback
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    // Actions
    Plus,
    Pencil,
    Trash2,
    Eye,
    Download,
    X,
    ArrowLeft,
    ArrowRight,
    // KPIs
    TrendingUp,
    TrendingDown,
    DollarSign,
    UserCheck,
    // Misc
    Search,
    Loader2,
    Music,
    BookOpen,
    Settings,
    Package,
    type LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

// Re-exportamos os componentes com tamanho padrão consistente
type IconProps = Partial<LucideProps> & { className?: string };

function wrapIcon(Icon: FC<LucideProps>): FC<IconProps> {
    return ({ size, className, ...props }: IconProps) => (
        <Icon size={size ?? 16} className={className} {...props} />
    );
}

export const IconHouse = wrapIcon(House);
export const IconDashboard = wrapIcon(LayoutDashboard);
export const IconAcademic = wrapIcon(GraduationCap);
export const IconCalendar = wrapIcon(CalendarDays);
export const IconWallet = wrapIcon(Wallet);
export const IconUsers = wrapIcon(Users);
export const IconStore = wrapIcon(ShoppingBag);
export const IconLogout = wrapIcon(LogOut);
export const IconCheckCircle = wrapIcon(CheckCircle);
export const IconXCircle = wrapIcon(XCircle);
export const IconAlertTriangle = wrapIcon(AlertTriangle);
export const IconClock = wrapIcon(Clock);
export const IconPlus = wrapIcon(Plus);
export const IconEdit = wrapIcon(Pencil);
export const IconTrash = wrapIcon(Trash2);
export const IconEye = wrapIcon(Eye);
export const IconDownload = wrapIcon(Download);
export const IconClose = wrapIcon(X);
export const IconArrowLeft = wrapIcon(ArrowLeft);
export const IconArrowRight = wrapIcon(ArrowRight);
export const IconTrendingUp = wrapIcon(TrendingUp);
export const IconTrendingDown = wrapIcon(TrendingDown);
export const IconDollarSign = wrapIcon(DollarSign);
export const IconUserCheck = wrapIcon(UserCheck);
export const IconSearch = wrapIcon(Search);
export const IconLoader = wrapIcon(Loader2);
export const IconMusic = wrapIcon(Music);
export const IconBookOpen = wrapIcon(BookOpen);
export const IconSettings = wrapIcon(Settings);
export const IconPackage = wrapIcon(Package);
