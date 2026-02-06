"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Plus, Pencil, Trash2, Search, DollarSign } from "lucide-react";
import Store, { Student, Group } from "@/lib/store";

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<Group[]>([]); // New: Groups state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Load data from store
    useEffect(() => {
        setStudents(Store.getStudents());
        setGroups(Store.getGroups());
    }, []);

    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        age: "",
        source: "Instagram",
        gender: "Erkak",
        joinDate: new Date().toISOString().split('T')[0],
        parentName: "",
        parentPhone: "",
        group: "",
        paymentAmount: "",
        comment: "",
    });

    // Filter students based on search term
    const filteredStudents = students.filter((student) =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            phone: "",
            age: "",
            source: "Instagram",
            gender: "Erkak",
            joinDate: new Date().toISOString().split('T')[0],
            parentName: "",
            parentPhone: "",
            group: "",
            paymentAmount: "",
            comment: "",
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleEdit = (student: Student) => {
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
            comment: student.comment || "",
        });
        setCurrentId(student.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Haqiqatan ham bu o'quvchini o'chirmoqchimisiz?")) {
            const studentToDelete = students.find((s) => s.id === id);

            // Delete student
            const updatedStudents = students.filter((s) => s.id !== id);
            setStudents(updatedStudents);
            Store.saveStudents(updatedStudents);

            // Also delete UNPAID payments for this student
            if (studentToDelete) {
                const currentPayments = Store.getPayments();
                const studentName = `${studentToDelete.firstName} ${studentToDelete.lastName}`;
                const updatedPayments = currentPayments.filter(
                    (p) => !(p.studentName === studentName && p.status === "unpaid")
                );
                Store.savePayments(updatedPayments);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && currentId !== null) {
            // Update existing student
            const updatedStudents = students.map((s) => (s.id === currentId ? {
                ...s,
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
                comment: formData.comment,
            } : s));
            setStudents(updatedStudents);
            Store.saveStudents(updatedStudents);
        } else {
            // Add new student
            const newStudent: Student = {
                id: Date.now(), // Use timestamp for unique ID
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
                comment: formData.comment,
            };
            const updatedStudents = [...students, newStudent];
            setStudents(updatedStudents);
            Store.saveStudents(updatedStudents);

            // Create initial DEBT (Payment record) for the new student
            const selectedGroup = groups.find(g => g.name === formData.group);
            const courseName = selectedGroup ? selectedGroup.course : "Noma'lum";

            // Important: We need a unique ID for payment. Since we just used Date.now() for student, 
            // we should add a small delay or use a random increment to avoid collision, 
            // or just rely on the fact that JS execution takes non-zero time. 
            // Safer: Date.now() + 1
            const newPaymentId = Date.now() + 1;

            const newPayment = {
                id: newPaymentId,
                studentName: `${newStudent.firstName} ${newStudent.lastName}`,
                course: courseName,
                group: newStudent.group,
                amount: newStudent.paymentAmount,
                date: newStudent.joinDate, // Debt starts from join date
                status: "unpaid" as const, // Explicitly cast to literal type
            };

            const currentPayments = Store.getPayments();
            const updatedPayments = [...currentPayments, newPayment];
            Store.savePayments(updatedPayments);
        }

        setIsModalOpen(false);
        resetForm();
    };

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        O'quvchilar
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {students.length}
                        </span>
                    </h2>
                    <p className="text-muted-foreground">
                        Barcha o'quvchilar ro'yxati va ularni boshqarish.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Qidiruv..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:w-[200px] lg:w-[300px]"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    >
                        <Plus className="mr-2 h-4 w-4" /> O'quvchi qo'shish
                    </button>
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">F.I.Sh</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Telefon</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Guruh</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">To'lov Summasi</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sana (Qo'shilgan)</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        O'quvchi topilmadi
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">
                                            {student.firstName} {student.lastName}
                                        </td>
                                        <td className="p-4 align-middle font-mono">{student.phone}</td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                {student.group}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle font-semibold text-slate-700 dark:text-slate-300">
                                            {student.paymentAmount?.toLocaleString()} UZS
                                        </td>
                                        <td className="p-4 align-middle">{student.joinDate}</td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-lg w-full max-w-lg p-6 my-8">
                        <h3 className="text-lg font-semibold mb-4">{isEditing ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* O'quvchi Ma'lumotlari */}
                            <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg space-y-4 border border-slate-100 dark:border-zinc-800">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">O'quvchi ma'lumotlari</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-red-600/80">Ism *</label>
                                        <input
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-red-600/80">Familiya *</label>
                                        <input
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-red-600/80">Telefon *</label>
                                        <input
                                            required
                                            placeholder="+998"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-red-600/80">Guruh *</label>
                                        <select
                                            required
                                            value={formData.group}
                                            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">Tanlang</option>
                                            {groups.map((g) => (
                                                <option key={g.id} value={g.name}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-red-600/80">To'lov Summasi *</label>
                                        <div className="relative">
                                            <span className="absolute left-2.5 top-2.5 text-xs font-bold text-muted-foreground">UZS</span>
                                            <input
                                                required
                                                type="number"
                                                placeholder="0"
                                                value={formData.paymentAmount}
                                                onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                                                className="pl-9 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-red-600/80">Qo'shilgan sana *</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.joinDate}
                                            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ota-ona Ma'lumotlari (Ixtiyoriy) */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">Ota-ona ma'lumotlari (Ixtiyoriy)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Yosh</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Jinsi</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="Erkak">Erkak</option>
                                            <option value="Ayol">Ayol</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Ota-ona F.I.Sh</label>
                                        <input
                                            value={formData.parentName}
                                            onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Ota-ona Telefoni</label>
                                        <input
                                            placeholder="+998"
                                            value={formData.parentPhone}
                                            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Izoh</label>
                                    <textarea
                                        value={formData.comment}
                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
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
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
