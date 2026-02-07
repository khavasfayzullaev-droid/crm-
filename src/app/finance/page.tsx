"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Store, { Payment, Expense, Student } from "@/lib/store";

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    // Loading indicators
    const [loading, setLoading] = useState(true);

    // Load Data
    const refreshData = async () => {
        setLoading(true);
        const p = await Store.getPayments();
        const e = await Store.getExpenses();
        const s = await Store.getStudents();
        setPayments(p);
        setExpenses(e);
        setStudents(s);
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, []);

    // Modals
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

    // Expense Form
    const [expenseData, setExpenseData] = useState({
        title: "",
        amount: "",
        category: "other",
        date: new Date().toISOString().split('T')[0],
    });

    // Income Form
    const [incomeData, setIncomeData] = useState({
        studentId: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        comment: "",
        course: "",
        group: "",
    });

    // Handlers
    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        await Store.addExpense({
            title: expenseData.title,
            amount: parseInt(expenseData.amount) || 0,
            category: expenseData.category as any,
            date: expenseData.date,
        });

        setIsExpenseModalOpen(false);
        setExpenseData({ title: "", amount: "", category: "other", date: new Date().toISOString().split('T')[0] });
        refreshData();
    };

    const handleAddIncome = async (e: React.FormEvent) => {
        e.preventDefault();
        // Finding student to get name
        const student = students.find(s => s.id.toString() === incomeData.studentId);

        await Store.addPayment({
            studentName: student ? `${student.firstName} ${student.lastName}` : "Noma'lum",
            course: incomeData.course || student?.group || "Umumiy",
            group: incomeData.group || student?.group || "",
            amount: parseInt(incomeData.amount) || 0,
            date: incomeData.date,
            status: "paid", // Direct income is considered paid
            comment: incomeData.comment || "To'g'ridan-to'g'ri kirim",
        });

        setIsIncomeModalOpen(false);
        setIncomeData({ studentId: "", amount: "", date: new Date().toISOString().split('T')[0], comment: "", course: "", group: "" });
        refreshData();
    };

    const handleDeleteExpense = async (id: number) => {
        if (confirm("Xarajatni o'chirmoqchimisiz?")) {
            await Store.deleteExpense(id);
            refreshData();
        }
    };

    const handleDeletePayment = async (id: number) => {
        if (confirm("To'lovni o'chirmoqchimisiz?")) {
            await Store.deletePayment(id);
            refreshData();
        }
    };

    const paidPayments = payments.filter(p => p.status === "paid");
    const totalIncome = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Moliya</h2>
                    <p className="text-muted-foreground">
                        Kirim va chiqimlar nazorati (Cloud DB).
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsIncomeModalOpen(true)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white shadow hover:bg-green-700 h-9 px-4 py-2"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Kirim qo'shish
                    </button>
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Xarajat qo'shish
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Jami Kirim</h3>
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                            {loading ? "..." : `+${totalIncome.toLocaleString()} UZS`}
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Jami Chiqim</h3>
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="pt-4">
                        <div className="text-2xl font-bold text-red-600">
                            {loading ? "..." : `-${totalExpense.toLocaleString()} UZS`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex space-x-1 rounded-lg bg-muted p-1 w-fit">
                <button
                    onClick={() => setActiveTab("income")}
                    className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                        activeTab === "income" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted-foreground/10"
                    )}
                >
                    Kirimlar (To'lovlar)
                </button>
                <button
                    onClick={() => setActiveTab("expense")}
                    className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                        activeTab === "expense" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted-foreground/10"
                    )}
                >
                    Xarajatlar
                </button>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sana</th>
                                {activeTab === "income" ? (
                                    <>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">O'quvchi</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Guruh</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nom</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kategoriya</th>
                                    </>
                                )}
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Summa</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                            ) : (
                                activeTab === "income" ? (
                                    paidPayments.length === 0 ? (
                                        <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Kirimlar topilmadi</td></tr>
                                    ) : (
                                        paidPayments.map((p) => (
                                            <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">{p.date}</td>
                                                <td className="p-4 align-middle font-medium">{p.studentName}</td>
                                                <td className="p-4 align-middle text-muted-foreground">{p.group}</td>
                                                <td className="p-4 align-middle text-right text-green-600 font-medium">+{p.amount.toLocaleString()} UZS</td>
                                                <td className="p-4 align-middle text-right">
                                                    <button onClick={() => handleDeletePayment(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="h-4 w-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                ) : (
                                    expenses.length === 0 ? (
                                        <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Xarajatlar topilmadi</td></tr>
                                    ) : (
                                        expenses.map((e) => (
                                            <tr key={e.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">{e.date}</td>
                                                <td className="p-4 align-middle font-medium">{e.title}</td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                        {e.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right text-red-600 font-medium">-{e.amount.toLocaleString()} UZS</td>
                                                <td className="p-4 align-middle text-right">
                                                    <button onClick={() => handleDeleteExpense(e.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="h-4 w-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Income Modal */}
            {isIncomeModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold mb-4">Kirim qo'shish</h3>
                        <form onSubmit={handleAddIncome} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">O'quvchi (Ixtiyoriy)</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={incomeData.studentId}
                                    onChange={(e) => setIncomeData({ ...incomeData, studentId: e.target.value })}
                                >
                                    <option value="">Tanlang...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Summa (UZS)</label>
                                <input
                                    required
                                    type="number"
                                    value={incomeData.amount}
                                    onChange={(e) => setIncomeData({ ...incomeData, amount: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Sana</label>
                                <input
                                    required
                                    type="date"
                                    value={incomeData.date}
                                    onChange={(e) => setIncomeData({ ...incomeData, date: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Izoh</label>
                                <input
                                    value={incomeData.comment}
                                    onChange={(e) => setIncomeData({ ...incomeData, comment: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsIncomeModalOpen(false)} className="px-4 py-2 border rounded text-sm">Bekor qilish</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">Qo'shish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 border rounded text-sm">Bekor qilish</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Qo'shish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
