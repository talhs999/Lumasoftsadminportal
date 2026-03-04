// lib/mock-data.ts
// Mock data used when session.user.isTestUser === true
// All data is fake and read-only — no DB operations occur for test users.

export const MOCK_ADMIN_ID = "test-admin-id-000";
export const MOCK_EMPLOYEE_ID = "test-employee-id-001";

export const mockClients = [
    { id: "mock-client-1", name: "Acme Corporation", contactInfo: "contact@acme.com", createdAt: new Date("2025-01-10").toISOString(), projects: [] },
    { id: "mock-client-2", name: "TechBridge Inc.", contactInfo: "hello@techbridge.io", createdAt: new Date("2025-02-20").toISOString(), projects: [] },
    { id: "mock-client-3", name: "Pixel Studio", contactInfo: "studio@pixel.com", createdAt: new Date("2025-03-05").toISOString(), projects: [] },
    { id: "mock-client-4", name: "CloudVault Ltd.", contactInfo: "admin@cloudvault.net", createdAt: new Date("2025-04-18").toISOString(), projects: [] },
];

export const mockEmployees = [
    { id: "mock-emp-1", fullName: "Ali Hassan", email: "ali@lumasofts.com", username: "ali.hassan", role: "employee", isTestUser: false, createdAt: new Date("2024-11-01").toISOString() },
    { id: "mock-emp-2", fullName: "Sara Khan", email: "sara@lumasofts.com", username: "sara.khan", role: "employee", isTestUser: false, createdAt: new Date("2024-12-15").toISOString() },
    { id: "mock-emp-3", fullName: "Usman Tariq", email: "usman@lumasofts.com", username: "usman.tariq", role: "employee", isTestUser: false, createdAt: new Date("2025-01-22").toISOString() },
];

export const mockProjects = [
    {
        id: "mock-proj-1",
        title: "E-Commerce Redesign",
        description: "Complete redesign of the client's e-commerce platform with a modern UI and improved checkout flow.",
        status: "ongoing",
        budget: 250000,
        deadline: new Date("2025-06-30").toISOString(),
        createdAt: new Date("2025-01-15").toISOString(),
        updatedAt: new Date("2025-02-01").toISOString(),
        clientId: "mock-client-1",
        createdById: MOCK_ADMIN_ID,
        client: { id: "mock-client-1", name: "Acme Corporation" },
        createdBy: { id: MOCK_ADMIN_ID, fullName: "Test Admin" },
        tasks: [],
    },
    {
        id: "mock-proj-2",
        title: "Mobile App Development",
        description: "iOS and Android app for a logistics startup. Includes real-time tracking and push notifications.",
        status: "pending",
        budget: 450000,
        deadline: new Date("2025-09-15").toISOString(),
        createdAt: new Date("2025-02-10").toISOString(),
        updatedAt: new Date("2025-02-10").toISOString(),
        clientId: "mock-client-2",
        createdById: MOCK_ADMIN_ID,
        client: { id: "mock-client-2", name: "TechBridge Inc." },
        createdBy: { id: MOCK_ADMIN_ID, fullName: "Test Admin" },
        tasks: [],
    },
    {
        id: "mock-proj-3",
        title: "Brand Identity Package",
        description: "Full brand identity including logo, style guide, and marketing collateral for a new startup.",
        status: "completed",
        budget: 80000,
        deadline: new Date("2025-03-01").toISOString(),
        createdAt: new Date("2024-12-10").toISOString(),
        updatedAt: new Date("2025-03-01").toISOString(),
        clientId: "mock-client-3",
        createdById: MOCK_ADMIN_ID,
        client: { id: "mock-client-3", name: "Pixel Studio" },
        createdBy: { id: MOCK_ADMIN_ID, fullName: "Test Admin" },
        tasks: [],
    },
];

export const mockTasks = [
    {
        id: "mock-task-1",
        title: "Design Homepage Wireframes",
        description: "Create high-fidelity wireframes for the new homepage. Include mobile and desktop versions.",
        priority: "high",
        status: "in_progress",
        dueDate: new Date("2025-04-15").toISOString(),
        createdAt: new Date("2025-03-01").toISOString(),
        updatedAt: new Date("2025-03-10").toISOString(),
        projectId: "mock-proj-1",
        assignedToId: MOCK_EMPLOYEE_ID,
        createdById: MOCK_ADMIN_ID,
        isDeletedByAdmin: false,
        isDeletedByEmployee: false,
        project: { id: "mock-proj-1", title: "E-Commerce Redesign" },
        assignedTo: { id: MOCK_EMPLOYEE_ID, fullName: "Test Employee" },
        createdBy: { id: MOCK_ADMIN_ID, fullName: "Test Admin" },
    },
    {
        id: "mock-task-2",
        title: "Set Up CI/CD Pipeline",
        description: "Configure GitHub Actions to automate testing and deployment to staging environment.",
        priority: "medium",
        status: "pending",
        dueDate: new Date("2025-05-01").toISOString(),
        createdAt: new Date("2025-03-05").toISOString(),
        updatedAt: new Date("2025-03-05").toISOString(),
        projectId: "mock-proj-2",
        assignedToId: MOCK_EMPLOYEE_ID,
        createdById: MOCK_ADMIN_ID,
        isDeletedByAdmin: false,
        isDeletedByEmployee: false,
        project: { id: "mock-proj-2", title: "Mobile App Development" },
        assignedTo: { id: MOCK_EMPLOYEE_ID, fullName: "Test Employee" },
        createdBy: { id: MOCK_ADMIN_ID, fullName: "Test Admin" },
    },
    {
        id: "mock-task-3",
        title: "Client Presentation Deck",
        description: "Prepare slides for project kickoff presentation for TechBridge stakeholders.",
        priority: "low",
        status: "completed",
        dueDate: new Date("2025-02-28").toISOString(),
        createdAt: new Date("2025-02-20").toISOString(),
        updatedAt: new Date("2025-02-28").toISOString(),
        projectId: "mock-proj-2",
        assignedToId: MOCK_EMPLOYEE_ID,
        createdById: MOCK_ADMIN_ID,
        isDeletedByAdmin: false,
        isDeletedByEmployee: false,
        project: { id: "mock-proj-2", title: "Mobile App Development" },
        assignedTo: { id: MOCK_EMPLOYEE_ID, fullName: "Test Employee" },
        createdBy: { id: MOCK_ADMIN_ID, fullName: "Test Admin" },
    },
];

export const mockNotifications = [
    {
        id: "mock-notif-1",
        userId: MOCK_EMPLOYEE_ID,
        title: "New Task Assigned",
        message: 'You have been assigned a new task: "Design Homepage Wireframes"',
        read: false,
        createdAt: new Date("2025-03-01").toISOString(),
    },
    {
        id: "mock-notif-2",
        userId: MOCK_EMPLOYEE_ID,
        title: "New Task Assigned",
        message: 'You have been assigned a new task: "Set Up CI/CD Pipeline"',
        read: true,
        createdAt: new Date("2025-03-05").toISOString(),
    },
];
