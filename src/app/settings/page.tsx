"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [centerName, setCenterName] = useState("EduCenter CRM");
    const [phone, setPhone] = useState("+998 90 123 45 67");

    // System Diagnostics
    const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
    const [projectRef, setProjectRef] = useState("");

    useEffect(() => {
        // 1. Theme Check (Mock)
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme("dark");
        }

        // 2. DB Check
        checkDb();
    }, []);

    const checkDb = async () => {
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
            setProjectRef(url.split('.')[0].replace('https://', ''));

            const { error } = await supabase.from('groups').select('count').single();
            if (error) throw error;
            setDbStatus("connected");
        } catch (e) {
            setDbStatus("error");
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sozlamalar</h2>
                    <p className="text-muted-foreground">
                        Tizim va Markaz ma'lumotlarini boshqarish.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Markaz Profili */}
                    <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🏢 Markaz Ma'lumotlari
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Markaz Nomi</label>
                                <input
                                    type="text"
                                    value={centerName}
                                    onChange={(e) => setCenterName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telefon Raqam</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                />
                            </div>
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                Saqlash (Demo)
                            </button>
                        </div>
                    </div>

                    {/* 2. Tizim Ko'rinishi */}
                    <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🎨 Tizim Ko'rinishi
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-md">
                                <span className="font-medium">Tungi Rejim (Dark Mode)</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={`px-3 py-1 rounded-md text-sm ${theme === 'light' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-muted-foreground'}`}
                                    >
                                        Kunduzgi
                                    </button>
                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={`px-3 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-slate-800 text-white font-bold' : 'text-muted-foreground'}`}
                                    >
                                        Tungi
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                * Hozircha bu faqat demo. To'liq tema o'zgarishi keyingi versiyada qo'shiladi.
                            </p>
                        </div>
                    </div>

                    {/* 3. Diagnostika */}
                    <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🔍 Tizim Diagnostikasi
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm font-medium text-muted-foreground">Version</div>
                                <div className="text-xl font-bold">v2.0 (Cloud)</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm font-medium text-muted-foreground">Database Status</div>
                                <div className={`text-xl font-bold ${dbStatus === 'connected' ? 'text-green-600' : 'text-red-500'}`}>
                                    {dbStatus === 'checking' ? '...' : (dbStatus === 'connected' ? 'Online ✅' : 'Error ❌')}
                                </div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm font-medium text-muted-foreground">Project ID</div>
                                <code className="text-sm font-mono bg-black text-white px-2 py-1 rounded">
                                    {projectRef || "Not Found"}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
