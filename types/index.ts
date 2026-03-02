export type Role = "admin" | "employee";
export type ProjectStatus = "pending" | "ongoing" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface User {
    id: string;
    email: string;
    fullName: string;
    username: string;
    role: Role;
    createdAt: Date;
}

export interface Client {
    id: string;
    name: string;
    contactInfo: string | null;
    createdAt: Date;
}

export interface Project {
    id: string;
    title: string;
    description: string | null;
    status: ProjectStatus;
    budget: number | null;
    deadline: Date | null;
    clientId: string | null;
    createdById: string;
    createdAt: Date;
    client?: Client;
    createdBy?: User;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date | null;
    projectId: string;
    assignedToId: string | null;
    createdById: string;
    createdAt: Date;
    project?: Project;
    assignedTo?: User;
    createdBy?: User;
}

export interface DashboardStats {
    totalClients: number;
    activeProjects: number;
    monthlyRevenue: number;
    myProjects?: number;
    myTasks?: number;
}
