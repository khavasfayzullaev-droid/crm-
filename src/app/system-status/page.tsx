"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { supabase } from "@/lib/supabase";

export default function SystemStatusPage() {
    const [status, setStatus] = useState<"loading" | "connected" | "error">("loading");
    const [projectUrl, setProjectUrl] = useState<string>("");
    const [counts, setCounts] = useState<any>({});
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        checkSystem();
    }, []);

    const checkSystem = async () => {
        try {
            // 1. Check URL & Project ID
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET";
            const projectId = url.split('.')[0].replace('https://', '');
            setProjectUrl(projectId); // Faqat ID qismini ko'rsatamiz: lvslktne...

            // 2. Check Connection & Counts & Latest Data
            const { count: studentsCount, error: err1 } = await supabase.from('students').select('*', { count: 'exact', head: true });
            const { count: groupsCount, error: err2 } = await supabase.from('groups').select('*', { count: 'exact', head: true });

            // Eng oxirgi o'quvchini olish (Data Sync tekshirish uchun)
            const { data: latestStudent } = await supabase.from('students').select('first_name, created_at').order('created_at', { ascending: false }).limit(1).single();

            if (err1 || err2) {
                setStatus("error");
                setErrorMsg(err1?.message || err2?.message || "Unknown error");
            } else {
                setStatus("connected");
                setCounts({
                    students: studentsCount,
                    groups: groupsCount,
                    latest: latestStudent ? `${latestStudent.first_name} (${new Date(latestStudent.created_at).toLocaleTimeString()})` : "Yo'q"
                });
            }
        } catch (e: any) {
            setStatus("error");
            setErrorMsg(e.message);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl bg-card shadow-sm">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    🛠 Tizim Holati (System Diagnostics)
                </h1>

                <div className="space-y-6">
                    {/* Status Indicator */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <span className="font-medium">Baza Aloqasi:</span>
                        {status === "loading" && <span className="text-yellow-600 font-bold">Tekshirilmoqda...</span>}
                        {status === "connected" && <span className="text-green-600 font-bold flex items-center">✅ ULANDI (Online)</span>}
                        {status === "error" && <span className="text-red-600 font-bold flex items-center">❌ XATO (Offline)</span>}
                    </div>

                    {/* Project ID */}
                    <div className="p-4 border rounded-lg bg-slate-100 dark:bg-slate-800">
                        <h3 className="text-sm font-semibold mb-1">Baza ID (Project):</h3>
                        <code className="text-lg font-mono text-blue-600 font-bold">
                            {projectUrl}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                            ⚠️ Ikkala qurilmada ham shu kod 100% BIR XIL bo'lishi SHART!
                        </p>
                    </div>

                    {/* Data Counts & Sync Check */}
                    {status === "connected" && (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-600">{counts.students}</div>
                                    <div className="text-xs text-muted-foreground">O'quvchilar Soni</div>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-purple-600">{counts.groups}</div>
                                    <div className="text-xs text-muted-foreground">Guruhlar Soni</div>
                                </div>
                            </div>

                            <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Oxirgi O'zgarish (Sync Test):</h3>
                                <p className="text-xl font-bold text-green-600">{counts.latest}</p>
                                <p className="text-xs text-muted-foreground">
                                    Agar bu nom ikki qurilmada har xil bo'lsa -> "Refresh" qiling.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Detail */}
                    {status === "error" && (
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg text-sm font-mono break-all">
                            Xatolik: {errorMsg}
                        </div>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Qayta Tekshirish
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
