import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ── Premium Features ──────────────────────────────────────────────────────

  public type PremiumFeature = {
    #smart_study_insights;
    #advanced_statistics;
    #unlimited_study_plans;
    #cloud_backup;
    #customizable_themes;
    #ad_free_experience;
    #advanced_focus_mode;
  };

  public type UserTier = {
    #free;
    #premium;
  };

  public type UserProfile = {
    name : Text;
    userTier : UserTier;
    guestMode : Bool;
    deviceId : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let guestProfiles = Map.empty<Text, UserProfile>();

  // ── Feature Checking ──────────────────────────────────────────────────────

  public query ({ caller }) func hasFeatureAccess(feature : PremiumFeature) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check feature access");
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.userTier == #premium };
    };
  };

  public query ({ caller }) func hasTierAccess(requiredTier : UserTier) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check tier access");
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.userTier == requiredTier };
    };
  };

  public query ({ caller }) func checkFeatureAccess(feature : PremiumFeature) : async ({ accessGranted : Bool }) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check feature access");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        { accessGranted = false };
      };
      case (?profile) {
        { accessGranted = profile.userTier == #premium };
      };
    };
  };

  // ── User Profile Queries and Updates ──────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Guest Profile Support
  public query ({ caller }) func getGuestProfile(deviceId : Text) : async ?UserProfile {
    guestProfiles.get(deviceId);
  };

  public shared ({ caller }) func createGuestProfile(deviceId : Text, name : Text) : async () {
    let guestProfile : UserProfile = {
      name;
      userTier = #free;
      guestMode = true;
      deviceId = ?deviceId;
    };
    guestProfiles.add(deviceId, guestProfile);
  };

  public shared ({ caller }) func upgradeToPremium() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can upgrade to premium");
    };
    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
    let updatedProfile : UserProfile = {
      name = currentProfile.name;
      userTier = #premium;
      guestMode = false;
      deviceId = null;
    };
    userProfiles.add(caller, updatedProfile);
  };

  // ── Domain Types (No Change) ──────────────────────────────────────────────

  public type Subject = {
    name : Text;
    topics : [Text];
  };

  public type ExamSetup = {
    examName : Text;
    subjects : [Subject];
    examDate : Int;   // Unix timestamp (nanoseconds)
    dailyHours : Nat; // hours available per day
  };

  public type DailyTask = {
    id : Nat;
    examId : Nat;
    subjectName : Text;
    topicName : Text;
    scheduledDate : Int; // Unix timestamp (nanoseconds), start of day
    isCompleted : Bool;
    isRevision : Bool;
  };

  public type Exam = {
    id : Nat;
    setup : ExamSetup;
    tasks : [DailyTask];
    createdAt : Int;
  };

  public type WeeklyProgressEntry = {
    dayLabel : Text;
    completedTasks : Nat;
    totalTasks : Nat;
  };

  public type ProgressData = {
    weeklyEntries : [WeeklyProgressEntry];
    studyStreak : Nat;
    totalCompleted : Nat;
    totalPending : Nat;
  };

  public type DayProgress = {
    completedTasks : Nat;
    totalTasks : Nat;
    percentage : Nat;
  };

  // ── State ─────────────────────────────────────────────────────────────────
  var nextExamId : Nat = 1;
  var nextTaskId : Nat = 1;
  let userExams = Map.empty<Principal, [Exam]>();
  let guestExams = Map.empty<Text, [Exam]>();

  // ── Study Plan Generation ─────────────────────────────────────────────────

  let nanosecondsPerDay : Int = 86_400_000_000_000;

  func startOfDay(ts : Int) : Int {
    ts - (ts % nanosecondsPerDay);
  };

  func generateStudyPlan(examId : Nat, setup : ExamSetup) : [DailyTask] {
    let now = Time.now();
    let todayStart = startOfDay(now);
    let examDayStart = startOfDay(setup.examDate);

    let daysUntilExam : Int = (examDayStart - todayStart) / (nanosecondsPerDay : Int);
    if (daysUntilExam <= 0) { return [] };

    let totalDays = Int.abs(daysUntilExam);

    let revisionDays : Nat = if (totalDays >= 3) { 2 } else if (totalDays >= 2) { 1 } else { 0 };
    let studyDays : Nat = if (totalDays > revisionDays) { totalDays - revisionDays } else { totalDays };

    var allTopics : [(Text, Text)] = [];
    for (subject in setup.subjects.vals()) {
      for (topic in subject.topics.vals()) {
        allTopics := allTopics.concat([(subject.name, topic)]);
      };
    };

    var tasks : [DailyTask] = [];
    let topicCount = allTopics.size();
    if (topicCount == 0) { return [] };

    if (studyDays > 0) {
      var topicIndex = 0;
      var dayIndex = 0;
      while (dayIndex < studyDays and topicIndex < topicCount) {
        let dayStart = todayStart + (dayIndex * nanosecondsPerDay);
        let remainingTopics = topicCount - topicIndex;
        let remainingDays = studyDays - dayIndex;
        let topicsThisDay : Nat = (remainingTopics + remainingDays - 1) / remainingDays;

        var t = 0;
        while (t < topicsThisDay and topicIndex < topicCount) {
          let (subjectName, topicName) = allTopics[topicIndex];
          let task : DailyTask = {
            id = nextTaskId;
            examId = examId;
            subjectName = subjectName;
            topicName = topicName;
            scheduledDate = dayStart;
            isCompleted = false;
            isRevision = false;
          };
          nextTaskId += 1;
          tasks := tasks.concat([task]);
          topicIndex += 1;
          t += 1;
        };
        dayIndex += 1;
      };
    };

    if (revisionDays > 0 and topicCount > 0) {
      var revDay = 0;
      while (revDay < revisionDays) {
        let dayStart = todayStart + ((studyDays + revDay) * nanosecondsPerDay);
        for (subject in setup.subjects.vals()) {
          let task : DailyTask = {
            id = nextTaskId;
            examId = examId;
            subjectName = subject.name;
            topicName = "Revision: " # subject.name;
            scheduledDate = dayStart;
            isCompleted = false;
            isRevision = true;
          };
          nextTaskId += 1;
          tasks := tasks.concat([task]);
        };
        revDay += 1;
      };
    };

    tasks;
  };

  // ── Exam Management────────────────────────────────────────────────────────

  public shared ({ caller }) func submitExamSetup(setup : ExamSetup) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can submit exam setups");
    };

    let existing = switch (userExams.get(caller)) {
      case (null) { [] };
      case (?e) { e };
    };

    if (existing.size() >= 1) {
      let userTier = switch (userProfiles.get(caller)) {
        case (null) { #free };
        case (?p) { p.userTier };
      };
      if (userTier != #premium and not (AccessControl.isAdmin(accessControlState, caller))) {
        Runtime.trap("Upgrade to premium to manage multiple exams simultaneously");
      };
    };

    let examId = nextExamId;
    nextExamId += 1;
    let tasks = generateStudyPlan(examId, setup);

    let exam : Exam = {
      id = examId;
      setup = setup;
      tasks = tasks;
      createdAt = Time.now();
    };

    let newExams = existing.concat([exam]);
    userExams.add(caller, newExams);
    examId;
  };

  public shared ({ caller }) func submitGuestExamSetup(deviceId : Text, setup : ExamSetup) : async Nat {
    let existing = switch (guestExams.get(deviceId)) {
      case (null) { [] };
      case (?e) { e };
    };

    let examId = nextExamId;
    nextExamId += 1;
    let tasks = generateStudyPlan(examId, setup);

    let exam : Exam = {
      id = examId;
      setup = setup;
      tasks = tasks;
      createdAt = Time.now();
    };

    let newExams = existing.concat([exam]);
    guestExams.add(deviceId, newExams);
    examId;
  };

  public query ({ caller }) func getAllExams() : async [Exam] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view exams");
    };
    switch (userExams.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };
  };

  public query ({ caller }) func getGuestExams(deviceId : Text) : async [Exam] {
    switch (guestExams.get(deviceId)) {
      case (null) { [] };
      case (?existing) { existing };
    };
  };

  // ── Task Queries and Day Progress ─────────────────────────────────────────

  public query ({ caller }) func getTodayTasks(examId : Nat) : async [DailyTask] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can get today's tasks");
    };

    let userExamList = switch (userExams.get(caller)) {
      case (null) { Runtime.trap("No exams found for user") };
      case (?existing) { existing };
    };

    var foundExam : ?Exam = null;
    for (exam in userExamList.vals()) {
      if (exam.id == examId) { foundExam := ?exam };
    };

    let exam = switch (foundExam) {
      case (null) { Runtime.trap("Exam not found") };
      case (?e) { e };
    };

    let todayStart = startOfDay(Time.now());
    exam.tasks.filter(func(t : DailyTask) : Bool {
      startOfDay(t.scheduledDate) == todayStart;
    });
  };

  public query ({ caller }) func getTodayGuestTasks(deviceId : Text, examId : Nat) : async [DailyTask] {
    let guestExamList = switch (guestExams.get(deviceId)) {
      case (null) { Runtime.trap("No exams found for device") };
      case (?existing) { existing };
    };

    var foundExam : ?Exam = null;
    for (exam in guestExamList.vals()) {
      if (exam.id == examId) { foundExam := ?exam };
    };

    let exam = switch (foundExam) {
      case (null) { Runtime.trap("Exam not found") };
      case (?e) { e };
    };

    let todayStart = startOfDay(Time.now());
    exam.tasks.filter(func(t : DailyTask) : Bool {
      startOfDay(t.scheduledDate) == todayStart;
    });
  };

  public query ({ caller }) func getDayProgress(examId : Nat) : async DayProgress {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can get day progress");
    };

    let userExamList = switch (userExams.get(caller)) {
      case (null) { Runtime.trap("No exams found for user") };
      case (?existing) { existing };
    };

    var foundExam : ?Exam = null;
    for (exam in userExamList.vals()) {
      if (exam.id == examId) { foundExam := ?exam };
    };

    let exam = switch (foundExam) {
      case (null) { Runtime.trap("Exam not found") };
      case (?e) { e };
    };

    let todayStart = startOfDay(Time.now());
    let todayTasks = exam.tasks.filter(func(t : DailyTask) : Bool {
      startOfDay(t.scheduledDate) == todayStart;
    });

    let total = todayTasks.size();
    var completed = 0;
    for (t in todayTasks.vals()) {
      if (t.isCompleted) { completed += 1 };
    };

    let percentage = if (total == 0) { 0 } else { (completed * 100) / total };
    { completedTasks = completed; totalTasks = total; percentage = percentage };
  };

  // ── Exam & Revision ───────────────────────────────────────────────────────
  public shared ({ caller }) func markTaskComplete(examId : Nat, taskId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can mark tasks complete");
    };

    let userExamList = switch (userExams.get(caller)) {
      case (null) { Runtime.trap("No exams found for user") };
      case (?existing) { existing };
    };

    var examIndex : ?Nat = null;
    var idx = 0;
    for (exam in userExamList.vals()) {
      if (exam.id == examId) { examIndex := ?idx };
      idx += 1;
    };

    let eIdx = switch (examIndex) {
      case (null) { Runtime.trap("Exam not found") };
      case (?i) { i };
    };

    let exam = userExamList[eIdx];

    let updatedTasks = exam.tasks.map(func(t : DailyTask) : DailyTask {
      if (t.id == taskId) {
        { id = t.id; examId = t.examId; subjectName = t.subjectName;
          topicName = t.topicName; scheduledDate = t.scheduledDate;
          isCompleted = true; isRevision = t.isRevision }
      } else { t };
    });

    let updatedExam : Exam = {
      id = exam.id;
      setup = exam.setup;
      tasks = updatedTasks;
      createdAt = exam.createdAt;
    };

    let newExams = Array.tabulate(userExamList.size(), func(i : Nat) : Exam {
      if (i == eIdx) { updatedExam } else { userExamList[i] };
    });

    userExams.add(caller, newExams);
  };

  public shared ({ caller }) func markTaskIncomplete(examId : Nat, taskId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can update tasks");
    };

    let userExamList = switch (userExams.get(caller)) {
      case (null) { Runtime.trap("No exams found for user") };
      case (?existing) { existing };
    };

    var examIndex : ?Nat = null;
    var idx = 0;
    for (exam in userExamList.vals()) {
      if (exam.id == examId) { examIndex := ?idx };
      idx += 1;
    };

    let eIdx = switch (examIndex) {
      case (null) { Runtime.trap("Exam not found") };
      case (?i) { i };
    };

    let exam = userExamList[eIdx];

    let updatedTasks = exam.tasks.map(func(t : DailyTask) : DailyTask {
      if (t.id == taskId) {
        { id = t.id; examId = t.examId; subjectName = t.subjectName;
          topicName = t.topicName; scheduledDate = t.scheduledDate;
          isCompleted = false; isRevision = t.isRevision }
      } else { t };
    });

    let updatedExam : Exam = {
      id = exam.id;
      setup = exam.setup;
      tasks = updatedTasks;
      createdAt = exam.createdAt;
    };

    let newExams = Array.tabulate(userExamList.size(), func(i : Nat) : Exam {
      if (i == eIdx) { updatedExam } else { userExamList[i] };
    });

    userExams.add(caller, newExams);
  };

  // ── Guest Task Management ──────────────────────────────────────────────

  public shared ({ caller }) func markGuestTaskComplete(deviceId : Text, examId : Nat, taskId : Nat) : async () {
    let guestExamList = switch (guestExams.get(deviceId)) {
      case (null) { Runtime.trap("No exams found for device") };
      case (?existing) { existing };
    };

    var examIndex : ?Nat = null;
    var idx = 0;
    for (exam in guestExamList.vals()) {
      if (exam.id == examId) { examIndex := ?idx };
      idx += 1;
    };

    let eIdx = switch (examIndex) {
      case (null) { Runtime.trap("Exam not found") };
      case (?i) { i };
    };

    let exam = guestExamList[eIdx];

    let updatedTasks = exam.tasks.map(func(t : DailyTask) : DailyTask {
      if (t.id == taskId) {
        { id = t.id; examId = t.examId; subjectName = t.subjectName;
          topicName = t.topicName; scheduledDate = t.scheduledDate;
          isCompleted = true; isRevision = t.isRevision }
      } else { t };
    });

    let updatedExam : Exam = {
      id = exam.id;
      setup = exam.setup;
      tasks = updatedTasks;
      createdAt = exam.createdAt;
    };

    let newExams = Array.tabulate(guestExamList.size(), func(i : Nat) : Exam {
      if (i == eIdx) { updatedExam } else { guestExamList[i] };
    });

    guestExams.add(deviceId, newExams);
  };

  public shared ({ caller }) func markGuestTaskIncomplete(deviceId : Text, examId : Nat, taskId : Nat) : async () {
    let guestExamList = switch (guestExams.get(deviceId)) {
      case (null) { Runtime.trap("No exams found for device") };
      case (?existing) { existing };
    };

    var examIndex : ?Nat = null;
    var idx = 0;
    for (exam in guestExamList.vals()) {
      if (exam.id == examId) { examIndex := ?idx };
      idx += 1;
    };

    let eIdx = switch (examIndex) {
      case (null) { Runtime.trap("Exam not found") };
      case (?i) { i };
    };

    let exam = guestExamList[eIdx];

    let updatedTasks = exam.tasks.map(func(t : DailyTask) : DailyTask {
      if (t.id == taskId) {
        { id = t.id; examId = t.examId; subjectName = t.subjectName;
          topicName = t.topicName; scheduledDate = t.scheduledDate;
          isCompleted = false; isRevision = t.isRevision }
      } else { t };
    });

    let updatedExam : Exam = {
      id = exam.id;
      setup = exam.setup;
      tasks = updatedTasks;
      createdAt = exam.createdAt;
    };

    let newExams = Array.tabulate(guestExamList.size(), func(i : Nat) : Exam {
      if (i == eIdx) { updatedExam } else { guestExamList[i] };
    });

    guestExams.add(deviceId, newExams);
  };

  // ── Progress Data ─────────────────────────────────────────────────────────

  public query ({ caller }) func getWeeklyProgress(examId : Nat) : async ProgressData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access progress tracking");
    };

    let userExamList = switch (userExams.get(caller)) {
      case (null) { Runtime.trap("No exams found for user") };
      case (?existing) { existing };
    };

    var foundExam : ?Exam = null;
    for (exam in userExamList.vals()) {
      if (exam.id == examId) { foundExam := ?exam };
    };

    let exam = switch (foundExam) {
      case (null) { Runtime.trap("Exam not found") };
      case (?e) { e };
    };

    let now = Time.now();
    let todayStart = startOfDay(now);

    let dayLabels = ["Day-6", "Day-5", "Day-4", "Day-3", "Day-2", "Yesterday", "Today"];
    var weeklyEntries : [WeeklyProgressEntry] = [];
    var dayOffset = 6;
    var labelIdx = 0;
    while (dayOffset >= 0) {
      let dayStart = todayStart - (dayOffset * nanosecondsPerDay);
      let dayTasks = exam.tasks.filter(func(t : DailyTask) : Bool {
        startOfDay(t.scheduledDate) == dayStart;
      });
      var completed = 0;
      for (t in dayTasks.vals()) {
        if (t.isCompleted) { completed += 1 };
      };
      let entry : WeeklyProgressEntry = {
        dayLabel = dayLabels[labelIdx];
        completedTasks = completed;
        totalTasks = dayTasks.size();
      };
      weeklyEntries := weeklyEntries.concat([entry]);
      dayOffset -= 1;
      labelIdx += 1;
    };

    var streak = 0;
    var checkDay = 0;
    var streakBroken = false;
    while (not streakBroken) {
      let dayStart = todayStart - (checkDay * nanosecondsPerDay);
      let dayTasks = exam.tasks.filter(func(t : DailyTask) : Bool {
        startOfDay(t.scheduledDate) == dayStart;
      });
      var hasCompleted = false;
      for (t in dayTasks.vals()) {
        if (t.isCompleted) { hasCompleted := true };
      };
      if (hasCompleted) {
        streak += 1;
        checkDay += 1;
      } else {
        streakBroken := true;
      };
    };

    var totalCompleted = 0;
    var totalPending = 0;
    for (t in exam.tasks.vals()) {
      if (t.isCompleted) { totalCompleted += 1 } else { totalPending += 1 };
    };

    {
      weeklyEntries = weeklyEntries;
      studyStreak = streak;
      totalCompleted = totalCompleted;
      totalPending = totalPending;
    };
  };

  public query ({ caller }) func getGuestWeeklyProgress(deviceId : Text, examId : Nat) : async ProgressData {
    let guestExamList = switch (guestExams.get(deviceId)) {
      case (null) { Runtime.trap("No exams found for device") };
      case (?existing) { existing };
    };

    var foundExam : ?Exam = null;
    for (exam in guestExamList.vals()) {
      if (exam.id == examId) { foundExam := ?exam };
    };

    let exam = switch (foundExam) {
      case (null) { Runtime.trap("Exam not found") };
      case (?e) { e };
    };

    let now = Time.now();
    let todayStart = startOfDay(now);

    let dayLabels = ["Day-6", "Day-5", "Day-4", "Day-3", "Day-2", "Yesterday", "Today"];
    var weeklyEntries : [WeeklyProgressEntry] = [];
    var dayOffset = 6;
    var labelIdx = 0;
    while (dayOffset >= 0) {
      let dayStart = todayStart - (dayOffset * nanosecondsPerDay);
      let dayTasks = exam.tasks.filter(func(t : DailyTask) : Bool {
        startOfDay(t.scheduledDate) == dayStart;
      });
      var completed = 0;
      for (t in dayTasks.vals()) {
        if (t.isCompleted) { completed += 1 };
      };
      let entry : WeeklyProgressEntry = {
        dayLabel = dayLabels[labelIdx];
        completedTasks = completed;
        totalTasks = dayTasks.size();
      };
      weeklyEntries := weeklyEntries.concat([entry]);
      dayOffset -= 1;
      labelIdx += 1;
    };

    var streak = 0;
    var checkDay = 0;
    var streakBroken = false;
    while (not streakBroken) {
      let dayStart = todayStart - (checkDay * nanosecondsPerDay);
      let dayTasks = exam.tasks.filter(func(t : DailyTask) : Bool {
        startOfDay(t.scheduledDate) == dayStart;
      });
      var hasCompleted = false;
      for (t in dayTasks.vals()) {
        if (t.isCompleted) { hasCompleted := true };
      };
      if (hasCompleted) {
        streak += 1;
        checkDay += 1;
      } else {
        streakBroken := true;
      };
    };

    var totalCompleted = 0;
    var totalPending = 0;
    for (t in exam.tasks.vals()) {
      if (t.isCompleted) { totalCompleted += 1 } else { totalPending += 1 };
    };

    {
      weeklyEntries = weeklyEntries;
      studyStreak = streak;
      totalCompleted = totalCompleted;
      totalPending = totalPending;
    };
  };

  public query ({ caller }) func getStudyStreak(examId : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access progress tracking");
    };

    let userExamList = switch (userExams.get(caller)) {
      case (null) { return 0 };
      case (?existing) { existing };
    };

    var foundExam : ?Exam = null;
    for (exam in userExamList.vals()) {
      if (exam.id == examId) { foundExam := ?exam };
    };

    let exam = switch (foundExam) {
      case (null) { return 0 };
      case (?e) { e };
    };

    let todayStart = startOfDay(Time.now());
    var streak = 0;
    var checkDay = 0;
    var streakBroken = false;
    while (not streakBroken) {
      let dayStart = todayStart - (checkDay * nanosecondsPerDay);
      let dayTasks = exam.tasks.filter(func(t : DailyTask) : Bool {
        startOfDay(t.scheduledDate) == dayStart;
      });
      var hasCompleted = false;
      for (t in dayTasks.vals()) {
        if (t.isCompleted) { hasCompleted := true };
      };
      if (hasCompleted) {
        streak += 1;
        checkDay += 1;
      } else {
        streakBroken := true;
      };
    };
    streak;
  };

  public query ({ caller }) func getGuestStudyStreak(deviceId : Text, examId : Nat) : async Nat {
    let guestExamList = switch (guestExams.get(deviceId)) {
      case (null) { return 0 };
      case (?existing) { existing };
    };

    var foundExam : ?Exam = null;
    for (exam in guestExamList.vals()) {
      if (exam.id == examId) { foundExam := ?exam };
    };

    let exam = switch (foundExam) {
      case (null) { return 0 };
      case (?e) { e };
    };

    let todayStart = startOfDay(Time.now());
    var streak = 0;
    var checkDay = 0;
    var streakBroken = false;
    while (not streakBroken) {
      let dayStart = todayStart - (checkDay * nanosecondsPerDay);
      let dayTasks = exam.tasks.filter(func(t : DailyTask) : Bool {
        startOfDay(t.scheduledDate) == dayStart;
      });
      var hasCompleted = false;
      for (t in dayTasks.vals()) {
        if (t.isCompleted) { hasCompleted := true };
      };
      if (hasCompleted) {
        streak += 1;
        checkDay += 1;
      } else {
        streakBroken := true;
      };
    };
    streak;
  };

  // ── Admin Functions ───────────────────────────────────────────────────────

  public shared ({ caller }) func assignUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, role);
  };
};
