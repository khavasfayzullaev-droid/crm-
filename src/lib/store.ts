import { supabase } from './supabase';

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
    date: string;
    nextPaymentDate?: string;
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

class Store {
    // --- GROUPS ---
    static async getGroups(): Promise<Group[]> {
        const { data, error } = await supabase.from('groups').select('*').order('id', { ascending: false });
        if (error) { console.error('Error fetching groups:', error); return []; }
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            course: item.course,
            days: item.days,
            time: item.time,
            studentCount: item.student_count,
            status: item.status
        }));
    }

    static async addGroup(group: Omit<Group, 'id'>): Promise<Group | null> {
        const { data, error } = await supabase.from('groups').insert([{
            name: group.name,
            course: group.course,
            days: group.days,
            time: group.time,
            student_count: group.studentCount,
            status: group.status
        }]).select().single();
        if (error) { console.error('Error adding group:', error); return null; }
        return { ...group, id: data.id };
    }

    static async updateGroup(group: Group): Promise<boolean> {
        const { error } = await supabase.from('groups').update({
            name: group.name,
            course: group.course,
            days: group.days,
            time: group.time,
            student_count: group.studentCount,
            status: group.status
        }).eq('id', group.id);
        if (error) { console.error('Error updating group:', error); return false; }
        return true;
    }

    static async deleteGroup(id: number): Promise<boolean> {
        const { error } = await supabase.from('groups').delete().eq('id', id);
        if (error) { console.error('Error deleting group:', error); return false; }
        return true;
    }

    // --- STUDENTS ---
    static async getStudents(): Promise<Student[]> {
        const { data, error } = await supabase.from('students').select('*').order('id', { ascending: false });
        if (error) { console.error('Error fetching students:', error); return []; }
        return data.map((item: any) => ({
            id: item.id,
            firstName: item.first_name,
            lastName: item.last_name,
            phone: item.phone,
            age: item.age,
            source: item.source,
            gender: item.gender,
            joinDate: item.join_date,
            parentName: item.parent_name,
            parentPhone: item.parent_phone,
            group: item.group_name,
            paymentAmount: item.payment_amount,
            comment: item.comment || ""
        }));
    }

    static async addStudent(student: Omit<Student, 'id'>): Promise<Student | null> {
        const { data, error } = await supabase.from('students').insert([{
            first_name: student.firstName,
            last_name: student.lastName,
            phone: student.phone,
            age: student.age,
            source: student.source,
            gender: student.gender,
            join_date: student.joinDate,
            parent_name: student.parentName,
            parent_phone: student.parentPhone,
            group_name: student.group,
            payment_amount: student.paymentAmount,
            comment: student.comment
        }]).select().single();
        if (error) { console.error('Error adding student:', error); return null; }
        return { ...student, id: data.id };
    }

    static async updateStudent(student: Student): Promise<boolean> {
        const { error } = await supabase.from('students').update({
            first_name: student.firstName,
            last_name: student.lastName,
            phone: student.phone,
            age: student.age,
            source: student.source,
            gender: student.gender,
            join_date: student.joinDate,
            parent_name: student.parentName,
            parent_phone: student.parentPhone,
            group_name: student.group,
            payment_amount: student.paymentAmount,
            comment: student.comment
        }).eq('id', student.id);
        if (error) { console.error('Error updating student:', error); return false; }
        return true;
    }

    static async deleteStudent(id: number): Promise<boolean> {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) { console.error('Error deleting student:', error); return false; }
        return true;
    }

    // --- TEACHERS ---
    static async getTeachers(): Promise<Teacher[]> {
        const { data, error } = await supabase.from('teachers').select('*').order('id', { ascending: false });
        if (error) { console.error('Error fetching teachers:', error); return []; }
        return data.map((item: any) => ({
            id: item.id,
            firstName: item.first_name,
            lastName: item.last_name,
            phone: item.phone,
            age: item.age,
            startDate: item.start_date
        }));
    }

    static async addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher | null> {
        const { data, error } = await supabase.from('teachers').insert([{
            first_name: teacher.firstName,
            last_name: teacher.lastName,
            phone: teacher.phone,
            age: teacher.age,
            start_date: teacher.startDate
        }]).select().single();
        if (error) { console.error('Error adding teacher:', error); return null; }
        return { ...teacher, id: data.id };
    }

    static async deleteTeacher(id: number): Promise<boolean> {
        const { error } = await supabase.from('teachers').delete().eq('id', id);
        if (error) { console.error('Error deleting teacher:', error); return false; }
        return true;
    }

    // --- PAYMENTS ---
    static async getPayments(): Promise<Payment[]> {
        const { data, error } = await supabase.from('payments').select('*').order('date', { ascending: false });
        if (error) { console.error('Error fetching payments:', error); return []; }
        return data.map((item: any) => ({
            id: item.id,
            studentName: item.student_name,
            course: item.course,
            group: item.group_name,
            amount: item.amount,
            date: item.date,
            nextPaymentDate: item.next_payment_date,
            status: item.status,
            comment: item.comment
        }));
    }

    static async addPayment(payment: Omit<Payment, 'id'>): Promise<Payment | null> {
        const { data, error } = await supabase.from('payments').insert([{
            student_name: payment.studentName,
            course: payment.course,
            group_name: payment.group,
            amount: payment.amount,
            date: payment.date,
            next_payment_date: payment.nextPaymentDate,
            status: payment.status,
            comment: payment.comment
        }]).select().single();
        if (error) { console.error('Error adding payment:', error); return null; }
        return { ...payment, id: data.id };
    }

    static async updatePayment(payment: Payment): Promise<boolean> {
        const { error } = await supabase.from('payments').update({
            student_name: payment.studentName,
            course: payment.course,
            group_name: payment.group,
            amount: payment.amount,
            date: payment.date,
            next_payment_date: payment.nextPaymentDate,
            status: payment.status,
            comment: payment.comment
        }).eq('id', payment.id);
        if (error) { console.error('Error updating payment:', error); return false; }
        return true;
    }

    static async deletePayment(id: number): Promise<boolean> {
        const { error } = await supabase.from('payments').delete().eq('id', id);
        if (error) { console.error('Error deleting payment:', error); return false; }
        return true;
    }

    // --- EXPENSES ---
    static async getExpenses(): Promise<Expense[]> {
        const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
        if (error) { console.error('Error fetching expenses:', error); return []; }
        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            amount: item.amount,
            date: item.date,
            category: item.category,
            comment: item.comment
        }));
    }

    static async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense | null> {
        const { data, error } = await supabase.from('expenses').insert([{
            title: expense.title,
            amount: expense.amount,
            date: expense.date,
            category: expense.category,
            comment: expense.comment
        }]).select().single();
        if (error) { console.error('Error adding expense:', error); return null; }
        return { ...expense, id: data.id };
    }

    static async deleteExpense(id: number): Promise<boolean> {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) { console.error('Error deleting expense:', error); return false; }
        return true;
    }
}

export default Store;
