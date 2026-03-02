import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: "brand" | "orange" | "blue" | "green" | "purple";
    trend?: string;
}

const colorMap = {
    brand: {
        bg: "bg-brand-accent/10",
        icon: "bg-brand-accent",
        text: "text-brand-accent",
    },
    blue: {
        bg: "bg-blue-500/10",
        icon: "bg-blue-500",
        text: "text-blue-400",
    },
    green: {
        bg: "bg-emerald-500/10",
        icon: "bg-emerald-500",
        text: "text-emerald-400",
    },
    purple: {
        bg: "bg-purple-500/10",
        icon: "bg-purple-500",
        text: "text-purple-400",
    },
    orange: {
        bg: "bg-orange-500/10",
        icon: "bg-orange-500",
        text: "text-orange-400",
    },
};

export default function DashboardCard({
    title,
    value,
    icon: Icon,
    color = "brand",
    trend,
}: DashboardCardProps) {
    const colors = colorMap[color];

    return (
        <div className="bg-brand-secondary rounded-xl border border-brand-border p-6 shadow-sm hover:border-brand-accent/50 hover:shadow-brand-accent/5 transition-all duration-200 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-brand-muted">{title}</p>
                    <p className="text-3xl font-bold text-brand-text mt-1.5 group-hover:text-brand-accent transition-colors">
                        {typeof value === "number" && title.toLowerCase().includes("revenue")
                            ? `$${value.toLocaleString()}`
                            : value}
                    </p>
                    {trend && (
                        <p className="text-xs text-brand-accent font-medium mt-1">{trend}</p>
                    )}
                </div>
                <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon size={22} className={color === "brand" ? "text-black" : "text-white"} />
                </div>
            </div>
        </div>
    );
}
