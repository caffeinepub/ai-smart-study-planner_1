import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DayProgress {
    totalTasks: bigint;
    completedTasks: bigint;
    percentage: bigint;
}
export interface WeeklyProgressEntry {
    totalTasks: bigint;
    completedTasks: bigint;
    dayLabel: string;
}
export interface ProgressData {
    totalCompleted: bigint;
    studyStreak: bigint;
    totalPending: bigint;
    weeklyEntries: Array<WeeklyProgressEntry>;
}
export interface ExamSetup {
    dailyHours: bigint;
    subjects: Array<Subject>;
    examDate: bigint;
    examName: string;
}
export interface Exam {
    id: bigint;
    tasks: Array<DailyTask>;
    createdAt: bigint;
    setup: ExamSetup;
}
export interface DailyTask {
    id: bigint;
    isCompleted: boolean;
    subjectName: string;
    scheduledDate: bigint;
    isRevision: boolean;
    examId: bigint;
    topicName: string;
}
export interface Subject {
    name: string;
    topics: Array<string>;
}
export interface UserProfile {
    userTier: UserTier;
    name: string;
    guestMode: boolean;
    deviceId?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserTier {
    premium = "premium",
    free = "free"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserRole(user: Principal, role: UserRole): Promise<void>;
    createGuestProfile(deviceId: string, name: string): Promise<void>;
    getAllExams(): Promise<Array<Exam>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDayProgress(examId: bigint): Promise<DayProgress>;
    getGuestProfile(deviceId: string): Promise<UserProfile | null>;
    getStudyStreak(examId: bigint): Promise<bigint>;
    getTodayTasks(examId: bigint): Promise<Array<DailyTask>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyProgress(examId: bigint): Promise<ProgressData>;
    isCallerAdmin(): Promise<boolean>;
    markTaskComplete(examId: bigint, taskId: bigint): Promise<void>;
    markTaskIncomplete(examId: bigint, taskId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitExamSetup(setup: ExamSetup): Promise<bigint>;
    upgradeToPremium(): Promise<void>;
}
