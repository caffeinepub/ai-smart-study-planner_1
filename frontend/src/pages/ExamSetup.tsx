import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, BookOpen, X, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useGetAllExams, useSubmitExamSetup } from '../hooks/useQueries';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import { useGuestMode } from '../hooks/useGuestMode';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import PaywallScreen from '../components/PaywallScreen';
import { useNavigate } from '@tanstack/react-router';

interface SubjectForm {
  name: string;
  topics: string[];
  topicInput: string;
}

export default function ExamSetup() {
  const navigate = useNavigate();
  const { data: exams = [] } = useGetAllExams();
  const { isPremium, isLoading: premiumLoading } = useConsolidatedPremiumStatus();
  const { isGuestMode } = useGuestMode();
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const submitExam = useSubmitExamSetup();

  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState('3');
  const [subjects, setSubjects] = useState<SubjectForm[]>([
    { name: '', topics: [], topicInput: '' },
  ]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const hasExistingExam = exams.length >= 1;

  const isLocked = hasExistingExam && !isPremium && !isGuestMode && !premiumLoading;

  const addSubject = () => {
    setSubjects([...subjects, { name: '', topics: [], topicInput: '' }]);
  };

  const removeSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const updateSubjectName = (idx: number, name: string) => {
    setSubjects(subjects.map((s, i) => (i === idx ? { ...s, name } : s)));
  };

  const updateTopicInput = (idx: number, topicInput: string) => {
    setSubjects(subjects.map((s, i) => (i === idx ? { ...s, topicInput } : s)));
  };

  const addTopic = (idx: number) => {
    const subject = subjects[idx];
    if (!subject.topicInput.trim()) return;
    setSubjects(
      subjects.map((s, i) =>
        i === idx
          ? { ...s, topics: [...s.topics, s.topicInput.trim()], topicInput: '' }
          : s
      )
    );
  };

  const removeTopic = (subjectIdx: number, topicIdx: number) => {
    setSubjects(
      subjects.map((s, i) =>
        i === subjectIdx
          ? { ...s, topics: s.topics.filter((_, ti) => ti !== topicIdx) }
          : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLocked) {
      setShowPaywall(true);
      return;
    }

    if (!isGuestMode) {
      if (isInitializing || actorFetching) {
        setErrorMessage('Still connecting to the network. Please wait a moment and try again.');
        return;
      }
      if (!isAuthenticated) {
        setErrorMessage('Please log in to create a study plan, or use guest mode to try it out.');
        return;
      }
    }

    const validSubjects = subjects.filter((s) => s.name.trim() && s.topics.length > 0);
    if (!examName.trim() || !examDate || validSubjects.length === 0) {
      setErrorMessage('Please fill in the exam name, date, and at least one subject with topics.');
      return;
    }

    const examDateNs = BigInt(new Date(examDate).getTime()) * 1_000_000n;

    try {
      await submitExam.mutateAsync({
        examName: examName.trim(),
        examDate: examDateNs,
        dailyHours: BigInt(parseInt(dailyHours)),
        subjects: validSubjects.map((s) => ({ name: s.name.trim(), topics: s.topics })),
      });

      navigate({ to: '/dashboard' });
    } catch (err: any) {
      const rawMessage: string = err?.message ?? '';
      let message = 'Failed to create study plan. Please try again.';
      if (rawMessage.includes('Actor not available')) {
        message = 'Unable to connect to the network. Please check your connection and try again.';
      } else if (rawMessage.includes('Unauthorized') || rawMessage.includes('Only registered users')) {
        message = 'You must be logged in to create a study plan. Please log in and try again.';
      } else if (rawMessage.includes('Upgrade to premium')) {
        message = 'Upgrade to premium to manage multiple exams simultaneously.';
      } else if (rawMessage.length > 0) {
        message = rawMessage;
      }
      setErrorMessage(message);
    }
  };

  if (hasExistingExam && premiumLoading && !isGuestMode) {
    return (
      <div className="p-5 space-y-6">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Study Plan Setup</h1>
          <p className="text-muted-foreground text-sm">
            Create a personalized study schedule for your upcoming exam.
          </p>
        </div>
        <div className="space-y-3">
          {exams.map((exam) => (
            <div
              key={exam.id.toString()}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-card border border-border shadow-card"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{exam.setup.examName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(Number(exam.setup.examDate) / 1_000_000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs rounded-full shrink-0">
                {exam.tasks.length} tasks
              </Badge>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
          <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Checking subscription status…
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">Study Plan Setup</h1>
        <p className="text-muted-foreground text-sm">
          Create a personalized study schedule for your upcoming exam.
        </p>
      </div>

      {exams.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
            Your Exams
          </h2>
          {exams.map((exam) => (
            <div
              key={exam.id.toString()}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-card border border-border shadow-card"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{exam.setup.examName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(Number(exam.setup.examDate) / 1_000_000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs rounded-full shrink-0">
                {exam.tasks.length} tasks
              </Badge>
            </div>
          ))}
        </div>
      )}

      {isLocked ? (
        <div className="rounded-2xl border-2 border-dashed border-primary/25 p-7 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base">Unlimited Exams — Premium</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
              Free plan supports one exam at a time. Upgrade to manage multiple exams simultaneously.
            </p>
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm text-white gradient-primary shadow-primary active:scale-95 transition-all duration-150"
          >
            Upgrade to Premium
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isGuestMode && !isAuthenticated && !isInitializing && (
            <div className="p-4 rounded-2xl bg-primary/8 border border-primary/20 flex items-start gap-3">
              <LogIn className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-primary">
                You need to be logged in to save your study plan to the cloud. Log in or switch to guest mode.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-destructive/8 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="examName" className="text-sm font-semibold">Exam Name</Label>
            <Input
              id="examName"
              placeholder="e.g., Mathematics Final"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
              className="rounded-xl border-border focus:border-primary focus:ring-primary/20 h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="examDate" className="text-sm font-semibold">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="rounded-xl border-border focus:border-primary focus:ring-primary/20 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyHours" className="text-sm font-semibold">Daily Hours</Label>
              <Input
                id="dailyHours"
                type="number"
                min="1"
                max="12"
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                required
                className="rounded-xl border-border focus:border-primary focus:ring-primary/20 h-11"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Subjects & Topics</Label>
              <button
                type="button"
                onClick={addSubject}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 active:scale-95 transition-all duration-150"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subject
              </button>
            </div>

            {subjects.map((subject, sIdx) => (
              <div key={sIdx} className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Subject name (e.g., Mathematics)"
                    value={subject.name}
                    onChange={(e) => updateSubjectName(sIdx, e.target.value)}
                    className="flex-1 h-9 text-sm rounded-xl border-border focus:border-primary"
                  />
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(sIdx)}
                      className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 active:scale-90 transition-all duration-150 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  )}
                </div>

                {subject.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {subject.topics.map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => removeTopic(sIdx, tIdx)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Add topic (press Enter)..."
                    value={subject.topicInput}
                    onChange={(e) => updateTopicInput(sIdx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTopic(sIdx);
                      }
                    }}
                    className="flex-1 h-9 text-sm rounded-xl border-border focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => addTopic(sIdx)}
                    className="px-3 h-9 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 active:scale-95 transition-all duration-150 shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitExam.isPending || (!isGuestMode && (isInitializing || actorFetching))}
            className="w-full py-3.5 rounded-2xl font-bold text-base text-white gradient-primary shadow-primary active:scale-[0.98] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitExam.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Plan...
              </>
            ) : (!isGuestMode && (isInitializing || actorFetching)) ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Create Study Plan
              </>
            )}
          </button>
        </form>
      )}

      {showPaywall && (
        <PaywallScreen onClose={() => setShowPaywall(false)} />
      )}
    </div>
  );
}
