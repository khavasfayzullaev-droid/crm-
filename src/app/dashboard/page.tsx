"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Users, GraduationCap, CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import Store, { Student, Group, Teacher, Payment, Expense } from "@/lib/store";

export default function Dashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setStudents(await Store.getStudents());
            setGroups(await Store.getGroups());
            setTeachers(await Store.getTeachers());
            setPayments(await Store.getPayments());
            setExpenses(await Store.getExpenses());
        };
        fetchData();
    }, []);

    // Statistics
    const totalStudents = students.length;
    const totalGroups = groups.length;
    const totalTeachers = teachers.length;

    // Finance Stats
    const totalIncome = payments
        .filter(p => p.status === "paid")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // Recent Payments (Last 5)
    const recentPayments = [...payments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <MainLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">CRM Dashboard <span className="text-blue-500 text-lg align-top font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md ml-2 border border-blue-200 dark:border-blue-800">✅ Cloud Active</span></h2>
                    <p className="text-muted-foreground">
                        Hamma ma'lumotlar xavfsiz Bulutli Bazada saqlanmoqda.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {/* Students Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Jami O'quvchilar</h3>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            Faol o'quvchilar soni <span className="text-[10px] text-blue-500 ml-1">(v2.0 Cloud)</span>
                        </p>
                    </div>
                </div>

                {/* Groups Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Guruhlar</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{totalGroups}</div>
                        <p className="text-xs text-muted-foreground">
                            Mavjud guruhlar
                        </p>
                    </div>
                </div>

                {/* Teachers Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">O'qituvchilar</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{totalTeachers}</div>
                        <p className="text-xs text-muted-foreground">
                            Faol ustozlar
                        </p>
                    </div>
                </div>
            </div>

            {/* Finance Overview */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-8">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Kirim (Jami)</h3>
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="pt-4">
                        <div className="text-2xl font-bold text-green-600">+{totalIncome.toLocaleString()} UZS</div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Chiqim (Jami)</h3>
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="pt-4">
                        <div className="text-2xl font-bold text-red-600">-{totalExpense.toLocaleString()} UZS</div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Sof Foyda</h3>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">{netProfit > 0 ? "+" : ""}{netProfit.toLocaleString()} UZS</div>
                    </div>
                </div>
            </div>

            {/* Recent Payments */}
            <div className="mt-8 grid grid-cols-1">
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between">
                        <h3 className="font-semibold text-lg">So'nggi To'lovlar</h3>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-4">
                            {recentPayments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Hozircha to'lovlar yo'q.</p>
                            ) : (
                                recentPayments.map(payment => (
                                    <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{payment.studentName}</p>
                                            <p className="text-xs text-muted-foreground">{payment.course} • {payment.date}</p>
                                        </div>
                                        <div className="text-sm font-medium text-green-600">
                                            +{payment.amount.toLocaleString()} UZS
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
