"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Check, X, Search, Calendar, CreditCard, Pencil, DollarSign, AlertCircle, Trash2, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import Store, { Payment } from "@/lib/store";

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [view, setView] = useState<"overdue" | "upcoming" | "paid" | "all">("overdue");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Load payments from store
    useEffect(() => {
        setPayments(Store.getPayments());
    }, []);

    // Form state
    const [formData, setFormData] = useState({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        comment: "",
        group: "",
        course: "",
    });

    const today = new Date().toISOString().split('T')[0];

    const getDaysDiff = (targetDate: string) => {
        const d1 = new Date(today);
        const d2 = new Date(targetDate);
        const diffTime = d2.getTime() - d1.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Date formatting helpers
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${mm}.${dd}.${yyyy}`;
    };

    const getPaymentPeriod = (dateStr: string) => {
        const startDate = new Date(dateStr);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        return `${formatDate(dateStr)}-${formatDate(endDate.toISOString().split('T')[0])}`;
    };

    const filteredPayments = payments.filter((p) => {
        if (view === "all") return true;
        if (view === "paid") return p.status === "paid";

        const daysDiff = getDaysDiff(p.date);

        if (view === "overdue") {
            return p.status === "unpaid" && daysDiff < 0;
        }
        if (view === "upcoming") {
            return p.status === "unpaid" && daysDiff >= 0 && daysDiff <= 7;
        }
        return false;
    });

    // Handle Pay Click
    const handlePayClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setFormData({
            amount: payment.amount.toString(),
            date: new Date().toISOString().split('T')[0],
            comment: "",
            group: payment.group,
            course: payment.course,
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setFormData({
            amount: payment.amount.toString(),
            date: payment.date,
            comment: payment.comment || "",
            group: payment.group,
            course: payment.course,
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Bu to'lovni o'chirib yubormoqchimisiz?")) {
            const updatedPayments = payments.filter((p) => p.id !== id);
            setPayments(updatedPayments);
            Store.savePayments(updatedPayments);
        }
    };

    // Statistics 
    const overduePayments = payments.filter(p => p.status === "unpaid" && getDaysDiff(p.date) < 0);
    const upcomingPayments = payments.filter(p => p.status === "unpaid" && getDaysDiff(p.date) >= 0 && getDaysDiff(p.date) <= 7);
    const paidPaymentsList = payments.filter(p => p.status === "paid");

    const overdueStats = {
        count: overduePayments.length,
        amount: overduePayments.reduce((sum, p) => sum + p.amount, 0),
    };

    const upcomingStats = {
        count: upcomingPayments.length,
        amount: upcomingPayments.reduce((sum, p) => sum + p.amount, 0),
    };

    const paidStats = {
        count: paidPaymentsList.length,
        amount: paidPaymentsList.reduce((sum, p) => sum + p.amount, 0),
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayment) return;

        if (isEditing) {
            // Edit existing payment
            const updatedPayments = payments.map(p => p.id === selectedPayment.id ? {
                ...p,
                amount: parseInt(formData.amount),
                date: formData.date,
                comment: formData.comment,
                group: formData.group,
                course: formData.course
            } : p);
            setPayments(updatedPayments);
            Store.savePayments(updatedPayments);
        } else {
            // Process payment -> Change to paid
            const updatedPayment: Payment = {
                ...selectedPayment,
                status: "paid",
                amount: parseInt(formData.amount),
                date: formData.date,
                comment: formData.comment,
            };

            const updatedPayments = payments.map(p => p.id === selectedPayment.id ? updatedPayment : p);
            setPayments(updatedPayments);
            Store.savePayments(updatedPayments);
        }

        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    return (
        <MainLayout>
            <div className="mb-8 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">To'lovlar</h2>
                        <p className="text-muted-foreground">O'quvchilar to'lovlarini nazorat qilish.</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Qarzdorlar (O'tgan)</h3>
                            <X className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="text-2xl font-bold">{overdueStats.count}</div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Qarzdorlik</h3>
                            <DollarSign className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                            -{overdueStats.amount.toLocaleString()} UZS
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Yaqinlashmoqda</h3>
                            <Calendar className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                            {upcomingStats.count}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Tushum</h3>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">{paidStats.amount.toLocaleString()} UZS</div>
                    </div>
                </div>

                {/* Toggle Buttons */}
                <div className="flex flex-wrap gap-2 space-x-2 bg-muted p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setView("all")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            view === "all"
                                ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <ListFilter className="h-4 w-4" />
                            Barchasi
                        </div>
                    </button>
                    <button
                        onClick={() => setView("overdue")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            view === "overdue"
                                ? "bg-white text-red-600 shadow-sm dark:bg-zinc-800"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Qarzdorlar
                        </div>
                    </button>
                    <button
                        onClick={() => setView("upcoming")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            view === "upcoming"
                                ? "bg-white text-orange-600 shadow-sm dark:bg-zinc-800"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Yaqinlashmoqda
                        </div>
                    </button>
                    <button
                        onClick={() => setView("paid")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            view === "paid"
                                ? "bg-white text-green-600 shadow-sm dark:bg-zinc-800"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            To'lov qilganlar
                        </div>
                    </button>
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">O'quvchi</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kurs / Guruh</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Summa</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    {view === "paid" ? "To'lov davri" : "To'lov muddati"}
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Izoh</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        {view === "overdue" && "Muddati o'tgan qarzdorlik yo'q 🎉"}
                                        {view === "upcoming" && "Yaqin orada kutilayotgan to'lovlar yo'q"}
                                        {view === "paid" && "To'lovlar topilmadi"}
                                        {view === "all" && "Hech qanday to'lov mavjud emas"}
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{payment.studentName}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span>{payment.course}</span>
                                                <span className="text-xs text-muted-foreground">{payment.group}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle font-semibold text-slate-700 dark:text-slate-300">
                                            {payment.status === "paid" ? (
                                                <span className="text-green-600">0 UZS</span>
                                            ) : (
                                                <span className="text-red-600">-{payment.amount.toLocaleString()} UZS</span>
                                            )}
                                        </td>
                                        <td className={cn(
                                            "p-4 align-middle font-medium",
                                            payment.status === "paid" ? "text-green-600" : (getDaysDiff(payment.date) < 0 ? "text-red-600" : "text-orange-600")
                                        )}>
                                            {payment.status === "paid" ? (
                                                <span className="text-sm font-semibold">
                                                    {getPaymentPeriod(payment.date)}
                                                </span>
                                            ) : (
                                                <>
                                                    {payment.date}
                                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                        ({getDaysDiff(payment.date) === 0 ? "Bugun" : (getDaysDiff(payment.date) < 0 ? `${Math.abs(getDaysDiff(payment.date))} kun o'tdi` : `${getDaysDiff(payment.date)} kun qoldi`)})
                                                    </span>
                                                </>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground italic text-xs">
                                            {payment.comment || "-"}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                {payment.status === "unpaid" ? (
                                                    <button
                                                        onClick={() => handlePayClick(payment)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                                                    >
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        To'lov qilish
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEditClick(payment)}
                                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(payment.id)}
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-red-100 hover:text-red-600 h-8 w-8"
                                                >
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

            {/* Payment Modal */}
            {isModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold mb-1">
                            {isEditing ? "To'lovni tahrirlash" : "To'lovni qabul qilish"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {selectedPayment.studentName} - {selectedPayment.course}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isEditing && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Kurs</label>
                                        <input
                                            required
                                            value={formData.course}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Guruh</label>
                                        <input
                                            required
                                            value={formData.group}
                                            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Summa (UZS)</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-2.5 text-xs font-bold text-muted-foreground">UZS</span>
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="pl-9 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Sana</label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="pl-9 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Izoh (ixtiyoriy)</label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    placeholder="Masalan: To'liq to'landi"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white shadow hover:bg-green-600/90 h-9 px-4 py-2"
                                >
                                    {isEditing ? "Saqlash" : "To'lov yaratish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
