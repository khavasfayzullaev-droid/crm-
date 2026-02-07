"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Store, { Teacher } from "@/lib/store";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refreshData = async () => {
        setTeachers(await Store.getTeachers());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "+998",
        age: "",
        startDate: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await Store.addTeacher({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            age: parseInt(formData.age) || 0,
            startDate: formData.startDate
        });
        setIsModalOpen(false);
        setFormData({ firstName: "", lastName: "", phone: "+998", age: "", startDate: new Date().toISOString().split('T')[0] });
        refreshData();
    };

    const handleDelete = async (id: number) => {
        if (confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
            await Store.deleteTeacher(id);
            refreshData();
        }
    };

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">O'qituvchilar</h2>
                    <p className="text-muted-foreground">
                        Jami ustozlar soni: {teachers.length} ta
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                    <Plus className="mr-2 h-4 w-4" /> Ustoz qo'shish
                </button>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">F.I.SH</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Telefon</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Yosh</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ish boshlash sanasi</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {teachers.length === 0 ? (
                                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Ustozlar yo'q</td></tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{teacher.firstName} {teacher.lastName}</td>
                                        <td className="p-4 align-middle">{teacher.phone}</td>
                                        <td className="p-4 align-middle">{teacher.age}</td>
                                        <td className="p-4 align-middle">{teacher.startDate}</td>
                                        <td className="p-4 align-middle text-right">
                                            <button onClick={() => handleDelete(teacher.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold mb-4">Yangi ustoz qo'shish</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ism</label>
                                <input required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Familiya</label>
                                <input required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telefon</label>
                                <input required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Yosh</label>
                                <input type="number" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-sm hover:bg-muted">Bekor qilish</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">Qo'shish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
