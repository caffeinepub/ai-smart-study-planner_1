import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Trash2, BookOpen, Calendar, Clock, ChevronRight, Loader2 } from 'lucide-react';
// Fixed: use useSubmitExamSetup (not useCreateExam) which is the correct export
import { useSubmitExamSetup, useGetAllExams } from '../hooks/useQueries';
import { useGuestMode } from '../hooks/useGuestMode';
import { toast } from 'sonner';

interface SubjectForm {
  name: string;
  topics: string[];
}

export default function ExamSetup() {
  const navigate = useNavigate();
  // Fixed: use isGuestMode (not isGuest) from useGuestMode
  const { isGuestMode, deviceId } = useGuestMode();
  const submitExam = useSubmitExamSetup();
  const { data: exams = [] } = useGetAllExams();

  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(2);
  const [subjects, setSubjects] = useState<SubjectForm[]>([
    { name: '', topics: [''] },
  ]);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', topics: [''] }]);
  };

  const removeSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const updateSubjectName = (idx: number, name: string) => {
    const updated = [...subjects];
    updated[idx] = { ...updated[idx], name };
    setSubjects(updated);
  };

  const addTopic = (subjectIdx: number) => {
    const updated = [...subjects];
    updated[subjectIdx] = {
      ...updated[subjectIdx],
      topics: [...updated[subjectIdx].topics, ''],
    };
    setSubjects(updated);
  };

  const removeTopic = (subjectIdx: number, topicIdx: number) => {
    const updated = [...subjects];
    updated[subjectIdx] = {
      ...updated[subjectIdx],
      topics: updated[subjectIdx].topics.filter((_, i) => i !== topicIdx),
    };
    setSubjects(updated);
  };

  const updateTopic = (subjectIdx: number, topicIdx: number, value: string) => {
    const updated = [...subjects];
    updated[subjectIdx].topics[topicIdx] = value;
    setSubjects(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examName.trim()) {
      toast.error('Please enter an exam name.');
      return;
    }
    if (!examDate) {
      toast.error('Please select an exam date.');
      return;
    }
    const validSubjects = subjects.filter(
      (s) => s.name.trim() && s.topics.some((t) => t.trim())
    );
    if (validSubjects.length === 0) {
      toast.error('Please add at least one subject with topics.');
      return;
    }

    const examDateMs = new Date(examDate).getTime();
    const examDateNs = BigInt(examDateMs) * BigInt(1_000_000);

    try {
      // useSubmitExamSetup accepts ExamSetup directly
      await submitExam.mutateAsync({
        examName: examName.trim(),
        examDate: examDateNs,
        dailyHours: BigInt(dailyHours),
        subjects: validSubjects.map((s) => ({
          name: s.name.trim(),
          topics: s.topics.filter((t) => t.trim()).map((t) => t.trim()),
        })),
      });
      toast.success('Study plan created!');
      navigate({ to: '/dashboard' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Upgrade to premium')) {
        toast.error('Upgrade to Premium to manage multiple exams simultaneously.');
      } else {
        toast.error(msg || 'Failed to create study plan.');
      }
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">New Study Plan</h1>
            <p className="text-xs text-muted-foreground">
              {exams.length > 0
                ? `You have ${exams.length} active plan${exams.length > 1 ? 's' : ''}`
                : 'Set up your first study plan'}
            </p>
          </div>
        </div>
        {isGuestMode && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20">
            <p className="text-xs text-primary font-medium">
              Guest mode — your plan is saved locally on this device.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-5">
        {/* Exam name */}
        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Exam / Subject Name
          </label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g. Mathematics Final"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm outline-none border-b border-border/50 pb-1 focus:border-primary transition-colors"
          />
        </div>

        {/* Exam date */}
        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Exam Date
          </label>
          <input
            type="date"
            value={examDate}
            min={minDateStr}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full bg-transparent text-foreground text-sm outline-none border-b border-border/50 pb-1 focus:border-primary transition-colors"
          />
        </div>

        {/* Daily hours */}
        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Daily Study Hours
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDailyHours(Math.max(1, dailyHours - 1))}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-lg hover:bg-muted/80"
            >
              −
            </button>
            <span className="text-lg font-bold text-foreground w-16 text-center">
              {dailyHours}h / day
            </span>
            <button
              type="button"
              onClick={() => setDailyHours(Math.min(12, dailyHours + 1))}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-lg hover:bg-muted/80"
            >
              +
            </button>
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Subjects & Topics
            </p>
            <button
              type="button"
              onClick={addSubject}
              className="flex items-center gap-1 text-xs text-primary font-semibold hover:opacity-80"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subject
            </button>
          </div>

          {subjects.map((subject, sIdx) => (
            <div key={sIdx} className="glass-card p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) => updateSubjectName(sIdx, e.target.value)}
                  placeholder={`Subject ${sIdx + 1}`}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm font-semibold outline-none border-b border-border/50 pb-1 focus:border-primary transition-colors"
                />
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(sIdx)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2 pl-2">
                {subject.topics.map((topic, tIdx) => (
                  <div key={tIdx} className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => updateTopic(sIdx, tIdx, e.target.value)}
                      placeholder={`Topic ${tIdx + 1}`}
                      className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 text-xs outline-none border-b border-border/30 pb-0.5 focus:border-primary transition-colors"
                    />
                    {subject.topics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTopic(sIdx, tIdx)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTopic(sIdx)}
                  className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary font-medium mt-1"
                >
                  <Plus className="w-3 h-3" /> Add Topic
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitExam.isPending}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitExam.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Plan...
            </>
          ) : (
            'Create Study Plan'
          )}
        </button>
      </form>
    </div>
  );
}
