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
            // 1. Check URL
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET";
            setProjectUrl(url);

            // 2. Check Connection & Counts
            const { count: studentsCount, error: err1 } = await supabase.from('students').select('*', { count: 'exact', head: true });
            const { count: groupsCount, error: err2 } = await supabase.from('groups').select('*', { count: 'exact', head: true });

            if (err1 || err2) {
                setStatus("error");
                setErrorMsg(err1?.message || err2?.message || "Unknown error");
            } else {
                setStatus("connected");
                setCounts({
                    students: studentsCount,
                    groups: groupsCount
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

                    {/* Project URL */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm text-muted-foreground mb-1">Supabase Project URL</h3>
                        <code className="text-xs bg-black text-white p-1 rounded block overflow-hidden">
                            {projectUrl.substring(0, 20)}...
                        </code>
                        <p className="text-xs text-muted-foreground mt-2">
                            *Ikkala qurilmada ham shu kod BIR XIL bo'lishi kerak.
                        </p>
                    </div>

                    {/* Data Counts */}
                    {status === "connected" && (
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
