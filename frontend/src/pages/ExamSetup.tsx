import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, BookOpen, X, Lock, CheckCircle2 } from 'lucide-react';
import { useGetAllExams, useSubmitExamSetup, useGetCallerUserProfile } from '../hooks/useQueries';
import { usePremiumTestingMode } from '../hooks/usePremiumTestingMode';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { useGuestMode } from '../hooks/useGuestMode';
import PaywallScreen from '../components/PaywallScreen';

interface SubjectForm {
  name: string;
  topics: string[];
  topicInput: string;
}

export default function ExamSetup() {
  const { data: exams = [] } = useGetAllExams();
  const { data: userProfile } = useGetCallerUserProfile();
  const { isPremiumTestingEnabled } = usePremiumTestingMode();
  const { isPremium: isSubscriptionPremium } = useSubscriptionContext();
  const { isGuestMode } = useGuestMode();
  const submitExam = useSubmitExamSetup();

  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState('3');
  const [subjects, setSubjects] = useState<SubjectForm[]>([
    { name: '', topics: [], topicInput: '' },
  ]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [success, setSuccess] = useState(false);

  const isBackendPremium = userProfile?.userTier === 'premium';
  const isPremium = isPremiumTestingEnabled || isBackendPremium || isSubscriptionPremium;
  const hasExistingExam = exams.length >= 1;
  const isLocked = hasExistingExam && !isPremium && !isGuestMode;

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
    if (isLocked) {
      setShowPaywall(true);
      return;
    }

    const validSubjects = subjects.filter((s) => s.name.trim() && s.topics.length > 0);
    if (!examName.trim() || !examDate || validSubjects.length === 0) return;

    const examDateNs = BigInt(new Date(examDate).getTime()) * 1_000_000n;

    await submitExam.mutateAsync({
      examName: examName.trim(),
      examDate: examDateNs,
      dailyHours: BigInt(parseInt(dailyHours)),
      subjects: validSubjects.map((s) => ({ name: s.name.trim(), topics: s.topics })),
    });

    setSuccess(true);
    setExamName('');
    setExamDate('');
    setDailyHours('3');
    setSubjects([{ name: '', topics: [], topicInput: '' }]);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">Study Plan Setup</h1>
        <p className="text-muted-foreground text-sm">
          Create a personalized study schedule for your upcoming exam.
        </p>
      </div>

      {/* Existing exams */}
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
                  {new Date(Number(exam.setup.examDate) / 1_000_000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs rounded-full shrink-0">
                {exam.tasks.length} tasks
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Locked state for free users with existing exam */}
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
          {success && (
            <div className="p-4 rounded-2xl bg-green-500/8 border border-green-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Study plan created successfully!
              </p>
            </div>
          )}

          {/* Exam Name */}
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

          {/* Subjects */}
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

                {/* Topics chips */}
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
            disabled={submitExam.isPending}
            className="w-full py-3.5 rounded-2xl font-bold text-base text-white gradient-primary shadow-primary active:scale-[0.98] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitExam.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Plan...
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

      <PaywallScreen open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
