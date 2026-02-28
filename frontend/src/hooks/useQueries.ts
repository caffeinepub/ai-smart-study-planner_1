import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGuestMode } from './useGuestMode';
import { useInternetIdentity } from './useInternetIdentity';
import type { Exam, ExamSetup, DailyTask, ProgressData, WeeklyProgressEntry } from '../backend';
import { toast } from 'sonner';

// ── Guest Study Plan Generator ────────────────────────────────────────────────

const NANOSECONDS_PER_DAY = 86_400_000_000_000n;

function startOfDayNs(ts: bigint): bigint {
  return ts - (ts % NANOSECONDS_PER_DAY);
}

function generateGuestStudyPlan(examId: bigint, setup: ExamSetup): DailyTask[] {
  const now = BigInt(Date.now()) * 1_000_000n;
  const todayStart = startOfDayNs(now);
  const examDayStart = startOfDayNs(BigInt(setup.examDate));

  const daysUntilExam = Number((examDayStart - todayStart) / NANOSECONDS_PER_DAY);
  if (daysUntilExam <= 0) return [];

  const totalDays = daysUntilExam;
  const revisionDays = totalDays >= 3 ? 2 : totalDays >= 2 ? 1 : 0;
  const studyDays = totalDays > revisionDays ? totalDays - revisionDays : totalDays;

  const allTopics: [string, string][] = [];
  for (const subject of setup.subjects) {
    for (const topic of subject.topics) {
      allTopics.push([subject.name, topic]);
    }
  }

  const tasks: DailyTask[] = [];
  let nextTaskId = Date.now();
  const topicCount = allTopics.length;
  if (topicCount === 0) return [];

  if (studyDays > 0) {
    let topicIndex = 0;
    let dayIndex = 0;
    while (dayIndex < studyDays && topicIndex < topicCount) {
      const dayStart = todayStart + BigInt(dayIndex) * NANOSECONDS_PER_DAY;
      const remainingTopics = topicCount - topicIndex;
      const remainingDays = studyDays - dayIndex;
      const topicsThisDay = Math.ceil(remainingTopics / remainingDays);

      let t = 0;
      while (t < topicsThisDay && topicIndex < topicCount) {
        const [subjectName, topicName] = allTopics[topicIndex];
        tasks.push({
          id: BigInt(nextTaskId++),
          examId,
          subjectName,
          topicName,
          scheduledDate: dayStart,
          isCompleted: false,
          isRevision: false,
        });
        topicIndex++;
        t++;
      }
      dayIndex++;
    }
  }

  if (revisionDays > 0 && topicCount > 0) {
    for (let revDay = 0; revDay < revisionDays; revDay++) {
      const dayStart = todayStart + BigInt(studyDays + revDay) * NANOSECONDS_PER_DAY;
      for (const subject of setup.subjects) {
        tasks.push({
          id: BigInt(nextTaskId++),
          examId,
          subjectName: subject.name,
          topicName: `Revision: ${subject.name}`,
          scheduledDate: dayStart,
          isCompleted: false,
          isRevision: true,
        });
      }
    }
  }

  return tasks;
}

// ── Exam Queries ──────────────────────────────────────────────────────────────

export function useGetAllExams() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isGuestMode, deviceId } = useGuestMode();

  return useQuery<Exam[]>({
    queryKey: ['exams', isGuestMode ? deviceId : 'user'],
    queryFn: async () => {
      if (isGuestMode) {
        try {
          const stored = localStorage.getItem(`guest_exams_${deviceId}`);
          if (!stored) return [];
          const parsed = JSON.parse(stored);
          return parsed.map((e: any) => ({
            ...e,
            id: BigInt(e.id),
            createdAt: BigInt(e.createdAt),
            setup: {
              ...e.setup,
              examDate: BigInt(e.setup.examDate),
              dailyHours: BigInt(e.setup.dailyHours),
            },
            tasks: (e.tasks || []).map((t: any) => ({
              ...t,
              id: BigInt(t.id),
              examId: BigInt(t.examId),
              scheduledDate: BigInt(t.scheduledDate),
            })),
          }));
        } catch {
          return [];
        }
      }
      if (!actor) return [];
      return actor.getAllExams();
    },
    enabled: isGuestMode ? true : (!!actor && !actorFetching),
  });
}

export function useSubmitExamSetup() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isGuestMode, deviceId } = useGuestMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setup: ExamSetup) => {
      if (isGuestMode) {
        const examId = BigInt(Date.now());
        const tasks = generateGuestStudyPlan(examId, setup);
        const newExam: Exam = {
          id: examId,
          setup,
          tasks,
          createdAt: BigInt(Date.now()) * 1_000_000n,
        };

        const stored = localStorage.getItem(`guest_exams_${deviceId}`);
        const existing: any[] = stored ? JSON.parse(stored) : [];

        const serialized = {
          ...newExam,
          id: newExam.id.toString(),
          createdAt: newExam.createdAt.toString(),
          setup: {
            ...newExam.setup,
            examDate: newExam.setup.examDate.toString(),
            dailyHours: newExam.setup.dailyHours.toString(),
          },
          tasks: newExam.tasks.map(t => ({
            ...t,
            id: t.id.toString(),
            examId: t.examId.toString(),
            scheduledDate: t.scheduledDate.toString(),
          })),
        };

        localStorage.setItem(`guest_exams_${deviceId}`, JSON.stringify([...existing, serialized]));
        return examId;
      }

      if (!actor) throw new Error('Actor not available');
      return actor.submitExamSetup(setup);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

// ── Task Mutations ────────────────────────────────────────────────────────────

export function useMarkTaskComplete() {
  const { actor } = useActor();
  const { isGuestMode, deviceId } = useGuestMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, taskId }: { examId: bigint; taskId: bigint }) => {
      if (isGuestMode) {
        const stored = localStorage.getItem(`guest_exams_${deviceId}`);
        if (!stored) throw new Error('No exams found');
        const exams = JSON.parse(stored);
        const updated = exams.map((e: any) => {
          if (BigInt(e.id) !== examId) return e;
          return {
            ...e,
            tasks: e.tasks.map((t: any) =>
              BigInt(t.id) === taskId ? { ...t, isCompleted: true } : t
            ),
          };
        });
        localStorage.setItem(`guest_exams_${deviceId}`, JSON.stringify(updated));
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.markTaskComplete(examId, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
      queryClient.invalidateQueries({ queryKey: ['studyStreak'] });
    },
  });
}

export function useMarkTaskIncomplete() {
  const { actor } = useActor();
  const { isGuestMode, deviceId } = useGuestMode();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, taskId }: { examId: bigint; taskId: bigint }) => {
      if (isGuestMode) {
        const stored = localStorage.getItem(`guest_exams_${deviceId}`);
        if (!stored) throw new Error('No exams found');
        const exams = JSON.parse(stored);
        const updated = exams.map((e: any) => {
          if (BigInt(e.id) !== examId) return e;
          return {
            ...e,
            tasks: e.tasks.map((t: any) =>
              BigInt(t.id) === taskId ? { ...t, isCompleted: false } : t
            ),
          };
        });
        localStorage.setItem(`guest_exams_${deviceId}`, JSON.stringify(updated));
        return;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.markTaskIncomplete(examId, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
      queryClient.invalidateQueries({ queryKey: ['studyStreak'] });
    },
  });
}

// ── Progress Queries ──────────────────────────────────────────────────────────

function computeGuestWeeklyProgress(exam: Exam): ProgressData {
  const now = BigInt(Date.now()) * 1_000_000n;
  const todayStart = startOfDayNs(now);

  const dayLabels = ['Day-6', 'Day-5', 'Day-4', 'Day-3', 'Day-2', 'Yesterday', 'Today'];
  const weeklyEntries: WeeklyProgressEntry[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const dayStart = todayStart - BigInt(offset) * NANOSECONDS_PER_DAY;
    const dayTasks = exam.tasks.filter(t => startOfDayNs(t.scheduledDate) === dayStart);
    const completed = dayTasks.filter(t => t.isCompleted).length;
    weeklyEntries.push({
      dayLabel: dayLabels[6 - offset],
      completedTasks: BigInt(completed),
      totalTasks: BigInt(dayTasks.length),
    });
  }

  // Compute streak
  let streak = 0;
  let checkDay = 0;
  let streakBroken = false;
  while (!streakBroken) {
    const dayStart = todayStart - BigInt(checkDay) * NANOSECONDS_PER_DAY;
    const dayTasks = exam.tasks.filter(t => startOfDayNs(t.scheduledDate) === dayStart);
    const hasCompleted = dayTasks.some(t => t.isCompleted);
    if (hasCompleted) {
      streak++;
      checkDay++;
    } else {
      streakBroken = true;
    }
  }

  const totalCompleted = exam.tasks.filter(t => t.isCompleted).length;
  const totalPending = exam.tasks.filter(t => !t.isCompleted).length;

  return {
    weeklyEntries,
    studyStreak: BigInt(streak),
    totalCompleted: BigInt(totalCompleted),
    totalPending: BigInt(totalPending),
  };
}

export function useGetWeeklyProgress(examId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { isGuestMode, deviceId } = useGuestMode();

  return useQuery<ProgressData>({
    queryKey: ['weeklyProgress', examId?.toString(), isGuestMode ? deviceId : 'user'],
    queryFn: async () => {
      if (examId === null) {
        return {
          weeklyEntries: [],
          studyStreak: 0n,
          totalCompleted: 0n,
          totalPending: 0n,
        };
      }

      if (isGuestMode) {
        try {
          const stored = localStorage.getItem(`guest_exams_${deviceId}`);
          if (!stored) {
            return { weeklyEntries: [], studyStreak: 0n, totalCompleted: 0n, totalPending: 0n };
          }
          const exams = JSON.parse(stored);
          const examRaw = exams.find((e: any) => BigInt(e.id) === examId);
          if (!examRaw) {
            return { weeklyEntries: [], studyStreak: 0n, totalCompleted: 0n, totalPending: 0n };
          }
          const exam: Exam = {
            ...examRaw,
            id: BigInt(examRaw.id),
            createdAt: BigInt(examRaw.createdAt),
            setup: {
              ...examRaw.setup,
              examDate: BigInt(examRaw.setup.examDate),
              dailyHours: BigInt(examRaw.setup.dailyHours),
            },
            tasks: (examRaw.tasks || []).map((t: any) => ({
              ...t,
              id: BigInt(t.id),
              examId: BigInt(t.examId),
              scheduledDate: BigInt(t.scheduledDate),
            })),
          };
          return computeGuestWeeklyProgress(exam);
        } catch {
          return { weeklyEntries: [], studyStreak: 0n, totalCompleted: 0n, totalPending: 0n };
        }
      }

      if (!actor) throw new Error('Actor not available');
      return actor.getWeeklyProgress(examId);
    },
    enabled: isGuestMode ? true : (!!actor && !actorFetching),
    retry: 1,
  });
}

export function useGetStudyStreak(examId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { isGuestMode, deviceId } = useGuestMode();

  return useQuery<bigint>({
    queryKey: ['studyStreak', examId?.toString(), isGuestMode ? deviceId : 'user'],
    queryFn: async () => {
      if (examId === null) return 0n;

      if (isGuestMode) {
        try {
          const stored = localStorage.getItem(`guest_exams_${deviceId}`);
          if (!stored) return 0n;
          const exams = JSON.parse(stored);
          const examRaw = exams.find((e: any) => BigInt(e.id) === examId);
          if (!examRaw) return 0n;

          const now = BigInt(Date.now()) * 1_000_000n;
          const todayStart = startOfDayNs(now);
          const tasks = (examRaw.tasks || []).map((t: any) => ({
            ...t,
            scheduledDate: BigInt(t.scheduledDate),
            isCompleted: t.isCompleted,
          }));

          let streak = 0;
          let checkDay = 0;
          let streakBroken = false;
          while (!streakBroken) {
            const dayStart = todayStart - BigInt(checkDay) * NANOSECONDS_PER_DAY;
            const dayTasks = tasks.filter((t: any) => startOfDayNs(t.scheduledDate) === dayStart);
            const hasCompleted = dayTasks.some((t: any) => t.isCompleted);
            if (hasCompleted) {
              streak++;
              checkDay++;
            } else {
              streakBroken = true;
            }
          }
          return BigInt(streak);
        } catch {
          return 0n;
        }
      }

      if (!actor) throw new Error('Actor not available');
      return actor.getStudyStreak(examId);
    },
    enabled: isGuestMode ? true : (!!actor && !actorFetching),
    retry: 1,
  });
}

// ── User Profile Queries ──────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string; userTier: 'free' | 'premium' | 'trial'; guestMode: boolean; deviceId?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserTier() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['userTier'],
    queryFn: async () => {
      if (!actor) return 'free';
      const profile = await actor.getCallerUserProfile();
      return profile?.userTier ?? 'free';
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ── Backup & Restore Mutations ────────────────────────────────────────────────

export function useBackupData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.backupUserData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestBackup'] });
      toast.success('Backup successful! Your data has been saved to the cloud.');
    },
    onError: (error: any) => {
      const message = error?.message || 'Backup failed. Please try again.';
      toast.error(message);
    },
  });
}

export function useRestoreData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.restoreUserData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
      queryClient.invalidateQueries({ queryKey: ['studyStreak'] });
      toast.success('Data restored successfully from your latest backup.');
    },
    onError: (error: any) => {
      const message = error?.message || 'Restore failed. Please try again.';
      toast.error(message);
    },
  });
}

export function useGetLatestBackup() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['latestBackup'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLatestBackup();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
