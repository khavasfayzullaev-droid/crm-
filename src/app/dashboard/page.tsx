"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Users, GraduationCap, CreditCard, DollarSign, Briefcase, TrendingDown, TrendingUp, Plus } from "lucide-react";
import Store, { Student, Group, Payment, Teacher, Expense } from "@/lib/store";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        studentsCount: 0,
        teachersCount: 0,
        activeGroupsCount: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        totalDebt: 0,
    });

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseData, setExpenseData] = useState({
        title: "",
        amount: "",
        category: "other",
        date: new Date().toISOString().split('T')[0],
    });

    const loadStats = () => {
        const students = Store.getStudents();
        const teachers = Store.getTeachers();
        const groups = Store.getGroups();
        const payments = Store.getPayments();
        const expenses = Store.getExpenses();

        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        const monthlyRevenue = payments
            .filter(p => p.status === "paid" && p.date.startsWith(currentMonth))
            .reduce((sum, p) => sum + p.amount, 0);

        const monthlyExpenses = expenses
            .filter(e => e.date.startsWith(currentMonth))
            .reduce((sum, e) => sum + e.amount, 0);

        const totalDebt = payments
            .filter(p => p.status === "unpaid")
            .reduce((sum, p) => sum + p.amount, 0);

        const activeGroupsCount = groups.filter(g => g.status === "active").length;

        setStats({
            studentsCount: students.length,
            teachersCount: teachers.length,
            activeGroupsCount,
            monthlyRevenue,
            monthlyExpenses,
            totalDebt,
        });
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const newExpense: Expense = {
            id: Date.now(),
            title: expenseData.title,
            amount: parseInt(expenseData.amount) || 0,
            category: expenseData.category as any,
            date: expenseData.date,
        };

        const currentExpenses = Store.getExpenses();
        const updatedExpenses = [...currentExpenses, newExpense];
        Store.saveExpenses(updatedExpenses);

        setIsExpenseModalOpen(false);
        setExpenseData({ title: "", amount: "", category: "other", date: new Date().toISOString().split('T')[0] });
        loadStats(); // Reload stats to show new expense
    };

    const statCards = [
        {
            title: "Jami O'quvchilar",
            value: stats.studentsCount.toString(),
            icon: Users,
            color: "text-blue-600",
            description: "Markaz o'quvchilari",
        },
        {
            title: "O'qituvchilar",
            value: stats.teachersCount.toString(),
            icon: Briefcase,
            color: "text-indigo-600",
            description: "Jami xodimlar",
        },
        {
            title: "Faol Guruhlar",
            value: stats.activeGroupsCount.toString(),
            icon: GraduationCap,
            color: "text-green-600",
            description: "O'qitilayotgan guruhlar",
        },
        {
            title: "Joriy Oy Kirim",
            value: stats.monthlyRevenue.toLocaleString() + " UZS",
            icon: TrendingUp,
            color: "text-green-600",
            description: "Shu oy tushumlari",
        },
        {
            title: "Joriy Oy Chiqim",
            value: stats.monthlyExpenses.toLocaleString() + " UZS",
            icon: TrendingDown,
            color: "text-red-600",
            description: "Shu oy xarajatlari",
        },
        {
            title: "O'quvchilar Qarzi",
            value: stats.totalDebt.toLocaleString() + " UZS",
            icon: CreditCard,
            color: "text-orange-600",
            description: "To'lanmagan to'lovlar",
        },
    ];

    return (
        <MainLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        O'quv markazi faoliyati bo'yicha umumiy ma'lumotlar.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="rounded-xl border bg-card text-card-foreground shadow p-6"
                    >
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </h3>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div className="pt-4">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Expense Modal */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold mb-4">Xarajat qo'shish</h3>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Nom</label>
                                <input
                                    required
                                    placeholder="Masalan: Ijara, Svet..."
                                    value={expenseData.title}
                                    onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Summa (UZS)</label>
                                <input
                                    required
                                    type="number"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Turkum</label>
                                <select
                                    value={expenseData.category}
                                    onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="other">Boshqa</option>
                                    <option value="salary">Oylik maosh</option>
                                    <option value="rent">Ijara</option>
                                    <option value="utility">Kommunal</option>
                                    <option value="office">Ofis xarajatlari</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Sana</label>
                                <input
                                    required
                                    type="date"
                                    value={expenseData.date}
                                    onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsExpenseModalOpen(false)}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2"
                                >
                                    Qo'shish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
