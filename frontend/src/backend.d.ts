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
export interface TrialState {
    trialActive: boolean;
    trialUsed: boolean;
    trialStartTimestamp: bigint;
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
export interface BackupData {
    backedUpAt: bigint;
    exams: Array<Exam>;
    trialState?: TrialState;
    userProfile?: UserProfile;
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
export enum PremiumFeature {
    advanced_statistics = "advanced_statistics",
    advanced_focus_mode = "advanced_focus_mode",
    smart_study_insights = "smart_study_insights",
    cloud_backup = "cloud_backup",
    customizable_themes = "customizable_themes",
    ad_free_experience = "ad_free_experience",
    unlimited_study_plans = "unlimited_study_plans"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserTier {
    trial = "trial",
    premium = "premium",
    free = "free"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserRole(user: Principal, role: UserRole): Promise<void>;
    backupUserData(): Promise<void>;
    checkFeatureAccess(feature: PremiumFeature): Promise<{
        accessGranted: boolean;
    }>;
    checkGuestFeatureAccess(deviceId: string, feature: PremiumFeature): Promise<boolean>;
    createGuestProfile(deviceId: string, name: string): Promise<void>;
    getAllExams(): Promise<Array<Exam>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDayProgress(examId: bigint): Promise<DayProgress>;
    getGuestExams(deviceId: string): Promise<Array<Exam>>;
    getGuestProfile(deviceId: string): Promise<UserProfile | null>;
    getGuestStudyStreak(deviceId: string, examId: bigint): Promise<bigint>;
    getGuestTrialStatus(deviceId: string): Promise<boolean>;
    getGuestWeeklyProgress(deviceId: string, examId: bigint): Promise<ProgressData>;
    getGuestWeeklyStats(deviceId: string): Promise<{
        streak: bigint;
        totalTasks: bigint;
        completedTasks: bigint;
    }>;
    getLatestBackup(): Promise<BackupData | null>;
    /**
     * / Returns the premium status for the caller.
     */
    getPremiumStatus(): Promise<boolean>;
    getStudyStreak(examId: bigint): Promise<bigint>;
    getTodayGuestTasks(deviceId: string, examId: bigint): Promise<Array<DailyTask>>;
    getTodayTasks(examId: bigint): Promise<Array<DailyTask>>;
    getTrialStatus(): Promise<boolean>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyProgress(examId: bigint): Promise<ProgressData>;
    getWeeklyStats(): Promise<{
        streak: bigint;
        totalTasks: bigint;
        completedTasks: bigint;
    }>;
    hasFeatureAccess(feature: PremiumFeature): Promise<boolean>;
    hasTierAccess(requiredTier: UserTier): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markGuestTaskComplete(deviceId: string, examId: bigint, taskId: bigint): Promise<void>;
    markGuestTaskIncomplete(deviceId: string, examId: bigint, taskId: bigint): Promise<void>;
    markTaskComplete(examId: bigint, taskId: bigint): Promise<void>;
    markTaskIncomplete(examId: bigint, taskId: bigint): Promise<void>;
    restoreUserData(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startGuestTrial(deviceId: string): Promise<void>;
    startTrial(): Promise<void>;
    /**
     * / Stores the given premium status for the caller.
     */
    storePremiumStatus(isPremium: boolean): Promise<void>;
    submitExamSetup(setup: ExamSetup): Promise<bigint>;
    submitGuestExamSetup(deviceId: string, setup: ExamSetup): Promise<bigint>;
    upgradeGuestToPremium(deviceId: string): Promise<void>;
    upgradeToPremium(user: Principal): Promise<void>;
}
