"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Plus, Search, Pencil, Trash2, GraduationCap, X } from "lucide-react";
import Store, { Student, Group } from "@/lib/store";

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    // Initial load
    const refreshData = async () => {
        setStudents(await Store.getStudents());
        setGroups(await Store.getGroups());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        age: "",
        source: "instagram",
        gender: "male",
        joinDate: new Date().toISOString().split('T')[0],
        parentName: "",
        parentPhone: "",
        group: "",
        paymentAmount: "0",
        comment: ""
    });

    const handleOpenModal = (student?: Student) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                firstName: student.firstName,
                lastName: student.lastName,
                phone: student.phone,
                age: student.age.toString(),
                source: student.source,
                gender: student.gender,
                joinDate: student.joinDate,
                parentName: student.parentName,
                parentPhone: student.parentPhone,
                group: student.group,
                paymentAmount: student.paymentAmount.toString(),
                comment: student.comment || ""
            });
        } else {
            setEditingStudent(null);
            setFormData({
                firstName: "",
                lastName: "",
                phone: "+998",
                age: "",
                source: "instagram",
                gender: "male",
                joinDate: new Date().toISOString().split('T')[0],
                parentName: "",
                parentPhone: "+998",
                group: "",
                paymentAmount: "500000",
                comment: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const studentData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            age: parseInt(formData.age) || 0,
            source: formData.source,
            gender: formData.gender,
            joinDate: formData.joinDate,
            parentName: formData.parentName,
            parentPhone: formData.parentPhone,
            group: formData.group,
            paymentAmount: parseInt(formData.paymentAmount) || 0,
            comment: formData.comment
        };

        if (editingStudent) {
            // Update
            await Store.updateStudent({
                ...studentData,
                id: editingStudent.id
            });
        } else {
            // Create
            const newStudent = await Store.addStudent(studentData);

            // Auto-create initial debt for new student
            if (newStudent && newStudent.paymentAmount > 0) {
                await Store.addPayment({
                    studentName: `${newStudent.firstName} ${newStudent.lastName}`,
                    course: "Umumiy",
                    group: newStudent.group,
                    amount: newStudent.paymentAmount,
                    date: newStudent.joinDate, // Use join date as due date
                    status: "unpaid",
                    comment: "Boshlang'ich qarzdorlik"
                });
            }
        }

        handleCloseModal();
        refreshData();
    };

    const handleDelete = async (id: number) => {
        if (confirm("Haqiqatan ham bu o'quvchini o'chirmoqchimisiz?")) {
            await Store.deleteStudent(id);

            // Supabase doesn't cascade automatically unless defined in SQL with ON DELETE CASCADE
            // So we manually cleanup payments for this student to be safe
            const studentToDelete = students.find(s => s.id === id);
            if (studentToDelete) {
                const payments = await Store.getPayments();
                const studentName = `${studentToDelete.firstName} ${studentToDelete.lastName}`;
                // Find orphaned payments
                const paymentsToDelete = payments.filter(p => p.studentName === studentName && p.status === 'unpaid');
                // Delete them one by one
                for (const p of paymentsToDelete) {
                    await Store.deletePayment(p.id);
                }
            }

            refreshData();
        }
    };

    const filteredStudents = students.filter((student) =>
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone.includes(searchQuery)
    );

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">O'quvchilar</h2>
                    <p className="text-muted-foreground">
                        Jami o'quvchilar soni: {students.length} ta
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                    <Plus className="mr-2 h-4 w-4" /> O'quvchi qo'shish
                </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Ism, familiya yoki telefon orqali qidirish..."
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">O'quvchi</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aloqa</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Guruh</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">To'lov</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Qo'shilgan sana</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        O'quvchilar topilmadi
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">
                                            <div>{student.firstName} {student.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{student.age} yosh • {student.gender === 'male' ? "O'g'il" : "Qiz"}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div>{student.phone}</div>
                                            <div className="text-xs text-muted-foreground">Ota-onasi: {student.parentName} ({student.parentPhone})</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {student.group ? (
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {student.group}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">Guruhsiz</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle font-mono">
                                            {student.paymentAmount?.toLocaleString() || 0} UZS
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {student.joinDate}
                                            <div className="text-xs">{student.source}</div>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenModal(student)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(student.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded text-red-600">
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

            {/* Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">{editingStudent ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}</h3>
                            <button onClick={handleCloseModal}><X className="h-6 w-6 text-muted-foreground" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Jinsi</label>
                                    <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                        <option value="male">O'g'il</option>
                                        <option value="female">Qiz</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Qo'shilgan sana</label>
                                    <input type="date" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.joinDate} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-4 text-muted-foreground">Ota-ona ma'lumotlari</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Ota-ona Ismi</label>
                                        <input required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Ota-ona Telefoni</label>
                                        <input required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-4 text-muted-foreground">O'quv kursi va To'lov</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Guruhga biriktirish</label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={formData.group}
                                            onChange={e => setFormData({ ...formData, group: e.target.value })}
                                        >
                                            <option value="">Guruh tanlanmagan</option>
                                            {groups.filter(g => g.status === 'active').map(g => (
                                                <option key={g.id} value={g.name}>{g.name} ({g.course})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Kelish manbasi</label>
                                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                                            <option value="instagram">Instagram</option>
                                            <option value="telegram">Telegram</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="friends">Tanish/Do'st</option>
                                            <option value="other">Boshqa</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Oylik To'lov Summasi (UZS)</label>
                                        <input type="number" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.paymentAmount} onChange={e => setFormData({ ...formData, paymentAmount: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded text-sm hover:bg-muted">Bekor qilish</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">
                                    {editingStudent ? "Saqlash" : "Qo'shish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
