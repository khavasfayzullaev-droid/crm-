"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Check, X, Search, Calendar, CreditCard, Pencil, DollarSign, AlertCircle, Trash2, ListFilter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Store, { Payment, Student } from "@/lib/store";

export default function PaymentsPage() {
    const [view, setView] = useState<"overdue" | "upcoming" | "paid" | "all">("overdue");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);

    const refreshData = async () => {
        setPayments(await Store.getPayments());
    };

    useEffect(() => {
        refreshData();
    }, []);

    // Helper for editing payment
    const [formData, setFormData] = useState({
        amount: "",
        date: "",
        comment: "",
        status: "paid"
    });

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setFormData({
            amount: payment.amount.toString(),
            date: payment.date,
            comment: payment.comment || "",
            status: payment.status
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayment) return;

        await Store.updatePayment({
            ...selectedPayment,
            amount: parseInt(formData.amount),
            date: formData.date,
            comment: formData.comment,
            status: formData.status as "paid" | "unpaid"
        });

        setIsModalOpen(false);
        refreshData();
    };

    const handleDelete = async (id: number) => {
        if (confirm("Bu to'lovni o'chirib tashlamoqchimisiz?")) {
            await Store.deletePayment(id);
            refreshData();
        }
    };

    const markAsPaid = async (payment: Payment) => {
        if (confirm(`${payment.studentName} uchun to'lovni qabul qilasizmi?`)) {
            await Store.updatePayment({
                ...payment,
                status: "paid",
                date: new Date().toISOString().split('T')[0] // Set payment date to today
            });
            refreshData();
        }
    };

    // Filters
    const filteredPayments = payments.filter((p) => {
        if (view === "all") return true;
        if (view === "paid") return p.status === "paid";

        const today = new Date();
        const paymentDate = new Date(p.date);
        const diffDays = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (view === "overdue") {
            // Unpaid AND date is in the past (diffDays < 0)
            return p.status === "unpaid" && diffDays < 0;
        }
        if (view === "upcoming") {
            // Unpaid AND date is in future but close (within 7 days) OR just future
            return p.status === "unpaid" && diffDays >= 0;
        }
        return false;
    });

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">To'lovlar</h2>
                    <p className="text-muted-foreground">
                        Qarzdorlik va tushumlar nazorati.
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button onClick={() => setView("overdue")} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", view === "overdue" ? "bg-red-100 text-red-800 ring-2 ring-red-500 ring-offset-2" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    Qarzdorlar <span className="ml-1 opacity-70">({payments.filter(p => p.status === 'unpaid' && new Date(p.date) < new Date()).length})</span>
                </button>
                <button onClick={() => setView("upcoming")} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", view === "upcoming" ? "bg-blue-100 text-blue-800 ring-2 ring-blue-500 ring-offset-2" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    Kutilayotgan
                </button>
                <button onClick={() => setView("paid")} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", view === "paid" ? "bg-green-100 text-green-800 ring-2 ring-green-500 ring-offset-2" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    To'laganlar
                </button>
                <button onClick={() => setView("all")} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", view === "all" ? "bg-gray-800 text-white ring-2 ring-gray-600 ring-offset-2" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    Barchasi
                </button>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">O'quvchi</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kurs/Guruh</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Muddat / Sana</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Summa</th>
                                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredPayments.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Ma'lumot topilmadi</td></tr>
                            ) : (
                                filteredPayments.map((p) => (
                                    <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{p.studentName}</td>
                                        <td className="p-4 align-middle text-muted-foreground">{p.course} ({p.group})</td>
                                        <td className="p-4 align-middle">{p.date}</td>
                                        <td className="p-4 align-middle text-right font-semibold">
                                            {p.status === 'paid' ?
                                                <span className="text-green-600">+{p.amount.toLocaleString()}</span> :
                                                <span className="text-red-500">-{p.amount.toLocaleString()}</span>
                                            }
                                        </td>
                                        <td className="p-4 align-middle text-center">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                                                p.status === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            )}>
                                                {p.status === "paid" ? "To'langan" : "To'lanmagan"}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                {p.status === 'unpaid' && (
                                                    <button onClick={() => markAsPaid(p)} title="To'landi deb belgilash" className="p-2 bg-green-100 hover:bg-green-200 rounded text-green-600">
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleEditPayment(p)} title="Tahrirlash" className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} title="O'chirish" className="p-2 bg-red-100 hover:bg-red-200 rounded text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold mb-4">To'lovni tahrirlash</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">O'quvchi</p>
                                <p className="font-semibold">{selectedPayment.studentName}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Summa</label>
                                <input required type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sana</label>
                                <input required type="date" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="paid">To'langan</option>
                                    <option value="unpaid">To'lanmagan</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Izoh</label>
                                <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-sm hover:bg-muted">Bekor qilish</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">Saqlash</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
