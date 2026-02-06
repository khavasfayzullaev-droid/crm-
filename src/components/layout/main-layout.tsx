"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    CreditCard,
    Wallet,
    Settings,
} from "lucide-react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "To'lovlar",
        href: "/payments",
        icon: CreditCard,
    },
    {
        title: "Guruhlar",
        href: "/groups",
        icon: Users,
    },
    {
        title: "O'quvchilar",
        href: "/students",
        icon: GraduationCap,
    },
    {
        title: "Ustozlar",
        href: "/teachers",
        icon: Users,
    },
    {
        title: "Moliya",
        href: "/finance",
        icon: Wallet,
    },
    {
        title: "Sozlamalar",
        href: "/settings",
        icon: Settings,
    },
];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white dark:bg-zinc-950 dark:border-zinc-800">
                <div className="flex h-16 items-center border-b px-6 dark:border-zinc-800">
                    <h1 className="text-xl font-bold">CRM Tizim</h1>
                </div>
                <nav className="space-y-1 p-4">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-50",
                                pathname === item.href
                                    ? "bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-gray-50"
                                    : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="pl-64 w-full">
                <div className="container mx-auto p-8">{children}</div>
            </main>
        </div>
    );
}
