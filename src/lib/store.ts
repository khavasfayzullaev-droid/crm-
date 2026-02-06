"use client";

// Types
export interface Group {
    id: number;
    name: string;
    course: string;
    days: string;
    time: string;
    studentCount: number;
    status: "active" | "archived";
}

export interface Student {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    age: number;
    source: string;
    gender: string;
    joinDate: string;
    parentName: string;
    parentPhone: string;
    group: string;
    paymentAmount: number;
    comment?: string;
}

export interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    age: number;
    startDate: string;
}

export interface Payment {
    id: number;
    studentName: string;
    course: string;
    group: string;
    amount: number;
    date: string;       // To'lov qilingan sana yoki to'lov muddati
    nextPaymentDate?: string; // Keyingi to'lov muddati
    status: "paid" | "unpaid";
    comment?: string;
}

export interface Expense {
    id: number;
    title: string;
    amount: number;
    date: string;
    category: "rent" | "salary" | "utility" | "office" | "other";
    comment?: string;
}

// Initial Mock Data
// Can be empty for production logic, but keeping types safe
const initialGroups: Group[] = [];
const initialStudents: Student[] = [];
const initialTeachers: Teacher[] = [];
const initialPayments: Payment[] = [];
const initialExpenses: Expense[] = [];

// Helper to simulate a simple database using LocalStorage
class Store {
    private static GROUPS_KEY = "crm_groups";
    private static STUDENTS_KEY = "crm_students";
    private static TEACHERS_KEY = "crm_teachers";
    private static PAYMENTS_KEY = "crm_payments";
    private static EXPENSES_KEY = "crm_expenses";

    // Groups
    static getGroups(): Group[] {
        if (typeof window === "undefined") return initialGroups;
        const stored = localStorage.getItem(this.GROUPS_KEY);
        if (!stored) {
            localStorage.setItem(this.GROUPS_KEY, JSON.stringify(initialGroups));
            return initialGroups;
        }
        return JSON.parse(stored);
    }

    static saveGroups(groups: Group[]) {
        if (typeof window === "undefined") return;
        localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
    }

    // Students
    static getStudents(): Student[] {
        if (typeof window === "undefined") return initialStudents;
        const stored = localStorage.getItem(this.STUDENTS_KEY);
        if (!stored) {
            localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(initialStudents));
            return initialStudents;
        }
        return JSON.parse(stored);
    }

    static saveStudents(students: Student[]) {
        if (typeof window === "undefined") return;
        localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));
    }

    // Teachers
    static getTeachers(): Teacher[] {
        if (typeof window === "undefined") return initialTeachers;
        const stored = localStorage.getItem(this.TEACHERS_KEY);
        if (!stored) {
            localStorage.setItem(this.TEACHERS_KEY, JSON.stringify(initialTeachers));
            return initialTeachers;
        }
        return JSON.parse(stored);
    }

    static saveTeachers(teachers: Teacher[]) {
        if (typeof window === "undefined") return;
        localStorage.setItem(this.TEACHERS_KEY, JSON.stringify(teachers));
    }

    // Payments
    static getPayments(): Payment[] {
        if (typeof window === "undefined") return initialPayments;
        const stored = localStorage.getItem(this.PAYMENTS_KEY);

        let payments: Payment[] = [];
        if (!stored) {
            localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(initialPayments));
            payments = initialPayments;
        } else {
            payments = JSON.parse(stored);
        }

        // Auto-cleanup: Remove payments linked to deleted students
        const students = this.getStudents();
        const studentNames = new Set(students.map(s => `${s.firstName} ${s.lastName}`));

        const validPayments = payments.filter(p => studentNames.has(p.studentName));

        if (validPayments.length !== payments.length) {
            this.savePayments(validPayments);
            return validPayments;
        }

        return payments;
    }

    static savePayments(payments: Payment[]) {
        if (typeof window === "undefined") return;
        localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(payments));
    }

    // Expenses
    static getExpenses(): Expense[] {
        if (typeof window === "undefined") return initialExpenses;
        const stored = localStorage.getItem(this.EXPENSES_KEY);
        if (!stored) {
            localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(initialExpenses));
            return initialExpenses;
        }
        return JSON.parse(stored);
    }

    static saveExpenses(expenses: Expense[]) {
        if (typeof window === "undefined") return;
        localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
    }
}

export default Store;
