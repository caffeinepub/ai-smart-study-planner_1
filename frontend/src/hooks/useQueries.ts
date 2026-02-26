import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, UserTier, ExamSetup, Exam, DailyTask, DayProgress, ProgressData } from '../backend';
import { useGuestMode } from './useGuestMode';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isGuestMode } = useGuestMode();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (isGuestMode) {
        // Return a local guest profile without requiring backend auth
        return {
          name: 'Guest User',
          userTier: UserTier.free,
          guestMode: true,
          deviceId: localStorage.getItem('guestDeviceId') ?? undefined,
        } as UserProfile;
      }
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: isGuestMode || (!!actor && !actorFetching),
    retry: false,
  });

  return {
    ...query,
    isLoading: (!isGuestMode && actorFetching) || query.isLoading,
    isFetched: (isGuestMode || !!actor) && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllExams() {
  const { actor, isFetching } = useActor();
  const { isGuestMode } = useGuestMode();

  return useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: async () => {
      if (isGuestMode) return [];
      if (!actor) return [];
      return actor.getAllExams();
    },
    enabled: isGuestMode || (!!actor && !isFetching),
  });
}

export function useSubmitExamSetup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setup: ExamSetup) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitExamSetup(setup);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      queryClient.invalidateQueries({ queryKey: ['dayProgress'] });
    },
  });
}

export function useGetTodayTasks(examId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { isGuestMode } = useGuestMode();

  return useQuery<DailyTask[]>({
    queryKey: ['todayTasks', examId?.toString()],
    queryFn: async () => {
      if (isGuestMode || !examId) return [];
      if (!actor) return [];
      return actor.getTodayTasks(examId);
    },
    enabled: isGuestMode || (!!actor && !isFetching && examId !== null),
  });
}

export function useGetDayProgress(examId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { isGuestMode } = useGuestMode();

  return useQuery<DayProgress>({
    queryKey: ['dayProgress', examId?.toString()],
    queryFn: async () => {
      if (isGuestMode || !examId) return { completedTasks: 0n, totalTasks: 0n, percentage: 0n };
      if (!actor) return { completedTasks: 0n, totalTasks: 0n, percentage: 0n };
      return actor.getDayProgress(examId);
    },
    enabled: isGuestMode || (!!actor && !isFetching && examId !== null),
  });
}

export function useMarkTaskComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, taskId }: { examId: bigint; taskId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTaskComplete(examId, taskId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks', variables.examId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['dayProgress', variables.examId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
    },
  });
}

export function useMarkTaskIncomplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, taskId }: { examId: bigint; taskId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTaskIncomplete(examId, taskId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks', variables.examId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['dayProgress', variables.examId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
    },
  });
}

export function useGetWeeklyProgress(examId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ProgressData>({
    queryKey: ['weeklyProgress', examId?.toString()],
    queryFn: async () => {
      if (!actor || !examId) throw new Error('Actor or examId not available');
      return actor.getWeeklyProgress(examId);
    },
    enabled: !!actor && !isFetching && examId !== null,
    retry: false,
  });
}

export function useGetStudyStreak(examId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['studyStreak', examId?.toString()],
    queryFn: async () => {
      if (!actor || !examId) throw new Error('Actor or examId not available');
      return actor.getStudyStreak(examId);
    },
    enabled: !!actor && !isFetching && examId !== null,
    retry: false,
  });
}

export function useUpgradeToPremium() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.upgradeToPremium();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateGuestProfile() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ deviceId, name }: { deviceId: string; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGuestProfile(deviceId, name);
    },
  });
}

export function useGetGuestProfile(deviceId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['guestProfile', deviceId],
    queryFn: async () => {
      if (!actor || !deviceId) return null;
      return actor.getGuestProfile(deviceId);
    },
    enabled: !!actor && !isFetching && !!deviceId,
    retry: false,
  });
}
