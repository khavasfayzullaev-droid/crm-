"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Plus, Users, Clock, Calendar, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Store, { Group } from "@/lib/store";

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [filter, setFilter] = useState<"all" | "active" | "archived">("all");

    // Load groups from local storage
    useEffect(() => {
        setGroups(Store.getGroups());
    }, []);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        course: "",
        days: "Toq kunlari",
        time: "",
    });

    const filteredGroups = groups.filter((group) => {
        if (filter === "all") return true;
        return group.status === filter;
    });

    const resetForm = () => {
        setFormData({ name: "", course: "", days: "Toq kunlari", time: "" });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleEdit = (group: Group) => {
        setFormData({
            name: group.name,
            course: group.course,
            days: group.days,
            time: group.time,
        });
        setCurrentId(group.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Bu guruhni arxivlamoqchimisiz? U arxiv bo'limiga o'tkaziladi.")) {
            // Soft delete: Change status to 'archived' instead of removing
            const updatedGroups = groups.map((g) => g.id === id ? { ...g, status: "archived" as const } : g);
            setGroups(updatedGroups);
            Store.saveGroups(updatedGroups);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && currentId !== null) {
            // Edit existing group
            const updatedGroups = groups.map((g) => (g.id === currentId ? {
                ...g,
                name: formData.name,
                course: formData.course,
                days: formData.days as "Toq kunlari" | "Juft kunlari" | "Har kuni",
                time: formData.time,
            } : g));
            setGroups(updatedGroups);
            Store.saveGroups(updatedGroups);
        } else {
            // Create new group
            const newGroup: Group = {
                id: Date.now(),
                name: formData.name,
                course: formData.course,
                days: formData.days as "Toq kunlari" | "Juft kunlari" | "Har kuni",
                time: formData.time,
                studentCount: 0,
                status: "active",
            };
            const updatedGroups = [...groups, newGroup];
            setGroups(updatedGroups);
            Store.saveGroups(updatedGroups);
        }

        setIsModalOpen(false);
        resetForm();
    };

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Guruhlar</h2>
                    <p className="text-muted-foreground">
                        O'quv markazidagi barcha guruhlar ro'yxati.
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                    <Plus className="mr-2 h-4 w-4" /> Guruh qo'shish
                </button>
            </div>

            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => setFilter("all")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                        filter === "all"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                    )}
                >
                    Barchasi
                </button>
                <button
                    onClick={() => setFilter("active")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                        filter === "active"
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                            : "bg-background hover:bg-muted"
                    )}
                >
                    Faol
                </button>
                <button
                    onClick={() => setFilter("archived")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                        filter === "archived"
                            ? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                            : "bg-background hover:bg-muted"
                    )}
                >
                    Arxivlangan
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredGroups.map((group) => (
                    <div
                        key={group.id}
                        className="rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md relative group"
                    >
                        {/* Edit/Delete Actions (Absolute positioned) */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(group);
                                }}
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(group.id);
                                }}
                                className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border",
                                        group.status === "active"
                                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                            : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                                    )}
                                >
                                    {group.status === "active" ? "Faol" : "Arxivlangan"}
                                </span>
                            </div>
                            <span className="text-sm text-muted-foreground font-medium block mb-1">
                                {group.course}
                            </span>
                            <h3 className="text-xl font-bold mb-4">{group.name}</h3>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{group.days}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{group.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{group.studentCount} o'quvchi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold mb-4">
                            {isEditing ? "Guruhni tahrirlash" : "Yangi guruh ochish"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Guruh nomi</label>
                                <input
                                    required
                                    placeholder="Masalan: Elementary A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Kurs nomi</label>
                                <input
                                    required
                                    placeholder="Masalan: Ingliz tili"
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Dars kunlari</label>
                                <select
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="Toq kunlari">Toq kunlari (Dushanba, Chorshanba, Juma)</option>
                                    <option value="Juft kunlari">Juft kunlari (Seshanba, Payshanba, Shanba)</option>
                                    <option value="Har kuni">Har kuni</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Dars vaqti</label>
                                <input
                                    required
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                >
                                    {isEditing ? "Saqlash" : "Yaratish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
