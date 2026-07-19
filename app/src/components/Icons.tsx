/**
 * app/src/components/Icons.tsx
 *
 * SVG icon components — replaces emoji icons throughout the SPA.
 * Style: 24×24 viewBox, 2px stroke width, feather-inspired (like Lucide).
 * All icons accept className and size (default 16).
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
    HelpCircle,
    Ban,
    RefreshCw,
    // Actions
    Plus,
    Pencil,
    Trash2,
    Eye,
    Download,
    X,
    ArrowLeft,
    ArrowRight,
    Filter,
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
    ClipboardList,
    Calendar,
    TrendingUp as ChartUp,       // alias for clarity
    TrendingDown as ChartDown,
    FileText,
    Lightbulb,
    Target,
    PauseCircle,
    Printer,
    type LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

type IconProps = Partial<LucideProps> & { className?: string };

function wrapIcon(Icon: FC<LucideProps>): FC<IconProps> {
    return ({ size, className, ...props }: IconProps) => (
        <Icon size={size ?? 16} className={className} {...props} />
    );
}

// Navigation
export const IconHouse = wrapIcon(House);
export const IconDashboard = wrapIcon(LayoutDashboard);
export const IconAcademic = wrapIcon(GraduationCap);
export const IconCalendar = wrapIcon(CalendarDays);
export const IconWallet = wrapIcon(Wallet);
export const IconUsers = wrapIcon(Users);
export const IconStore = wrapIcon(ShoppingBag);
export const IconLogout = wrapIcon(LogOut);

// Status / Feedback
export const IconCheckCircle = wrapIcon(CheckCircle);
export const IconXCircle = wrapIcon(XCircle);
export const IconAlertTriangle = wrapIcon(AlertTriangle);
export const IconClock = wrapIcon(Clock);
export const IconHelpCircle = wrapIcon(HelpCircle);
export const IconBan = wrapIcon(Ban);
export const IconRefresh = wrapIcon(RefreshCw);

// Actions
export const IconPlus = wrapIcon(Plus);
export const IconEdit = wrapIcon(Pencil);
export const IconTrash = wrapIcon(Trash2);
export const IconEye = wrapIcon(Eye);
export const IconDownload = wrapIcon(Download);
export const IconClose = wrapIcon(X);
export const IconArrowLeft = wrapIcon(ArrowLeft);
export const IconArrowRight = wrapIcon(ArrowRight);
export const IconFilter = wrapIcon(Filter);

// KPIs
export const IconTrendingUp = wrapIcon(TrendingUp);
export const IconTrendingDown = wrapIcon(TrendingDown);
export const IconDollarSign = wrapIcon(DollarSign);
export const IconUserCheck = wrapIcon(UserCheck);

// Misc
export const IconSearch = wrapIcon(Search);
export const IconLoader = wrapIcon(Loader2);
export const IconMusic = wrapIcon(Music);
export const IconBookOpen = wrapIcon(BookOpen);
export const IconSettings = wrapIcon(Settings);
export const IconPackage = wrapIcon(Package);
export const IconClipboardList = wrapIcon(ClipboardList);
export const IconCalendarDay = wrapIcon(Calendar);
export const IconChartUp = wrapIcon(ChartUp);
export const IconChartDown = wrapIcon(ChartDown);
export const IconFileText = wrapIcon(FileText);
export const IconLightbulb = wrapIcon(Lightbulb);
export const IconTarget = wrapIcon(Target);
export const IconPauseCircle = wrapIcon(PauseCircle);
export const IconPrinter = wrapIcon(Printer);
