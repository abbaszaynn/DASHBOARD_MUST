import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    noPadding?: boolean;
}

export function DashboardCard({
    title,
    description,
    icon: Icon,
    children,
    className,
    noPadding = false,
    ...props
}: DashboardCardProps) {
    return (
        <Card
            className={cn(
                "border-border/50 bg-card/50 backdrop-blur-sm shadow-sm animate-in fade-in-50 slide-in-from-bottom-5 duration-500",
                className
            )}
            {...props}
        >
            {(title || description) && (
                <CardHeader className="pb-2 space-y-1">
                    {title && (
                        <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4 text-primary" />}
                            {title}
                        </CardTitle>
                    )}
                    {description && (
                        <CardDescription className="text-xs font-mono text-muted-foreground/70">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
            )}
            <CardContent className={cn(noPadding ? "p-0" : "p-6 pt-0")}>
                {children}
            </CardContent>
        </Card>
    );
}
