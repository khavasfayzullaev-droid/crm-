"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import Store, { Group } from "@/lib/store";

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    const refreshData = async () => {
        setGroups(await Store.getGroups());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        course: "",
        days: "Mon-Wed-Fri",
        time: "",
    });

    const handleOpenModal = (group?: Group) => {
        if (group) {
            setEditingGroup(group);
            setFormData({
                name: group.name,
                course: group.course,
                days: group.days,
                time: group.time,
            });
        } else {
            setEditingGroup(null);
            setFormData({
                name: "",
                course: "",
                days: "Mon-Wed-Fri",
                time: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGroup(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingGroup) {
            await Store.updateGroup({
                ...editingGroup,
                name: formData.name,
                course: formData.course,
                days: formData.days,
                time: formData.time
            });
        } else {
            await Store.addGroup({
                name: formData.name,
                course: formData.course,
                days: formData.days,
                time: formData.time,
                studentCount: 0,
                status: "active"
            });
        }

        setIsModalOpen(false);
        refreshData();
    };

    const handleDelete = async (id: number) => {
        if (confirm("Guruhni o'chirmoqchimisiz?")) {
            await Store.deleteGroup(id);
            refreshData();
        }
    };

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Guruhlar</h2>
                    <p className="text-muted-foreground">
                        Mavjud guruhlar ro'yxati.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                    <Plus className="mr-2 h-4 w-4" /> Guruh qo'shish
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                    <div key={group.id} className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-lg font-semibold">{group.name}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(group)} className="text-gray-500 hover:text-gray-900"><Pencil className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(group.id)} className="text-red-500 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                        <div className="p-6 pt-0 mt-2 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">{group.course}</div>
                            <div className="flex justify-between items-center text-sm">
                                <span>{group.days}</span>
                                <span>{group.time}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t mt-4">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{group.studentCount} o'quvchi</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal code similar to others */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold mb-4">{editingGroup ? "Guruhni tahrirlash" : "Yangi guruh"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nomi</label>
                                <input required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Masalan: Frontend G1" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kurs yo'nalishi</label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })}>
                                    <option value="">Tanlang...</option>
                                    <option value="Frontend">Frontend (React/Next)</option>
                                    <option value="Backend">Backend (Node/Python)</option>
                                    <option value="English">English</option>
                                    <option value="Kids">Kids Programming</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kunlar</label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.days} onChange={e => setFormData({ ...formData, days: e.target.value })}>
                                    <option value="Mon-Wed-Fri">Dushanba / Chorshanba / Juma</option>
                                    <option value="Tue-Thu-Sat">Seshanba / Payshanba / Shanba</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vaqt</label>
                                <input type="time" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded text-sm hover:bg-muted">Bekor qilish</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">Saqlash</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
