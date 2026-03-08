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
import Iter "mo:core/Iter";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ── Premium Feature Support (New) ────────────────

  let premiumStatus = Map.empty<Principal, Bool>();

  /// Stores the given premium status for the caller.
  public shared ({ caller }) func storePremiumStatus(isPremium : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can store premium status");
    };
    premiumStatus.add(caller, isPremium);
  };

  /// Returns the premium status for the caller.
  public query ({ caller }) func getPremiumStatus() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get premium status");
    };
    switch (premiumStatus.get(caller)) {
      case (null) { false };
      case (?isPremium) { isPremium };
    };
  };

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
    #trial;
  };

  public type UserProfile = {
    name : Text;
    userTier : UserTier;
    guestMode : Bool;
    deviceId : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let guestProfiles = Map.empty<Text, UserProfile>();

  // ── Trial Mode ────────────────────────────────────────────────────────────

  public type TrialState = {
    trialStartTimestamp : Int;
    trialActive : Bool;
    trialUsed : Bool;
  };

  let userTrialStates = Map.empty<Principal, TrialState>();
  let guestTrialStates = Map.empty<Text, TrialState>();

  public query ({ caller }) func getTrialStatus() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check trial status");
    };
    let trial = userTrialStates.get(caller);
    switch (trial) {
      case (null) { false };
      case (?t) {
        if (not t.trialActive) { return false };
        let trialEndTs = t.trialStartTimestamp + (3 * 24 * 60 * 60 * 1000000000);
        Time.now() < trialEndTs;
      };
    };
  };

  public query ({ caller }) func getGuestTrialStatus(deviceId : Text) : async Bool {
    let trial = guestTrialStates.get(deviceId);
    switch (trial) {
      case (null) { false };
      case (?t) {
        if (not t.trialActive) { return false };
        let trialEndTs = t.trialStartTimestamp + (3 * 24 * 60 * 60 * 1000000000);
        Time.now() < trialEndTs;
      };
    };
  };

  public shared ({ caller }) func startTrial() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start a trial");
    };
    let now = Time.now();

    let userTier = switch (userProfiles.get(caller)) {
      case (null) { #free };
      case (?p) { p.userTier };
    };

    if (userTier == #premium) {
      Runtime.trap("Already a premium user. Trial not needed.");
    };

    let currentTrial = userTrialStates.get(caller);

    if (userTier == #trial) {
      switch (currentTrial) {
        case (null) { Runtime.trap("Trial record missing, please contact support") };
        case (?t) {
          let trialEndTs = t.trialStartTimestamp + (3 * 24 * 60 * 60 * 1000000000);
          if (Time.now() > trialEndTs) {
            Runtime.trap("Trial has already expired!");
          } else {
            Runtime.trap("Trial already in progress!");
          };
        };
      };
    };

    switch (currentTrial) {
      case (null) {
        userTrialStates.add(caller, { trialStartTimestamp = now; trialActive = true; trialUsed = true });
      };
      case (?t) {
        if (t.trialActive and Time.now() < t.trialStartTimestamp + (3 * 24 * 60 * 60 * 1000000000)) {
          Runtime.trap("Trial already in progress!");
        } else if (t.trialUsed) {
          Runtime.trap("Trial has already been used. Upgrade to premium for continued access.");
        } else {
          userTrialStates.add(caller, { trialStartTimestamp = now; trialActive = true; trialUsed = true });
        };
      };
    };

    // Internal upgrade — no public exposure
    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
    let updatedProfile : UserProfile = {
      currentProfile with userTier = #trial
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func startGuestTrial(deviceId : Text) : async () {
    let now = Time.now();
    let trial = guestTrialStates.get(deviceId);

    let guestTrialActive = switch (trial) {
      case (null) { false };
      case (?t) { t.trialActive };
    };

    if (guestTrialActive) {
      Runtime.trap("Trial already in progress. You are on Day 1 of free trial period!");
    };

    let currentTrial = guestTrialStates.get(deviceId);
    switch (currentTrial) {
      case (null) {
        guestTrialStates.add(deviceId, { trialStartTimestamp = now; trialActive = true; trialUsed = true });
        // Internal guest upgrade
        let guestProfile = switch (guestProfiles.get(deviceId)) {
          case (null) { Runtime.trap("Guest profile not found") };
          case (?profile) { profile };
        };
        let updatedProfile : UserProfile = {
          guestProfile with userTier = #trial
        };
        guestProfiles.add(deviceId, updatedProfile);
        return;
      };
      case (?t) {
        if (t.trialActive and Time.now() < t.trialStartTimestamp + (3 * 24 * 60 * 60 * 1000000000)) {
          Runtime.trap("Trial already in progress! Day 1 will automatically reset to your scheduled exam day.");
        } else if (t.trialUsed) {
          Runtime.trap("Trial has already been used. Not eligible.");
        } else {
          guestTrialStates.add(deviceId, { trialStartTimestamp = now; trialActive = true; trialUsed = true });
          // Internal guest upgrade
          let guestProfile = switch (guestProfiles.get(deviceId)) {
            case (null) { Runtime.trap("Guest profile not found") };
            case (?profile) { profile };
          };
          let updatedProfile : UserProfile = {
            guestProfile with userTier = #trial
          };
          guestProfiles.add(deviceId, updatedProfile);
          return;
        };
      };
    };
  };

  // ── Feature Checking ──────────────────────────────────────────────────────

  public query ({ caller }) func hasFeatureAccess(feature : PremiumFeature) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check feature access");
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.userTier == #premium or profile.userTier == #trial };
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
      case (null) { { accessGranted = false } };
      case (?profile) { { accessGranted = profile.userTier == #premium or profile.userTier == #trial } };
    };
  };

  // Guest entry point for paywall
  public query ({ caller }) func checkGuestFeatureAccess(deviceId : Text, feature : PremiumFeature) : async Bool {
    let profile = switch (guestProfiles.get(deviceId)) {
      case (null) { Runtime.trap("Profile does not exist. Please create to use guest mode."); };
      case (?p) { p };
    };
    not (profile.userTier == #free);
  };

  // Admin-only: premium upgrades must be authorized by an admin (e.g., after payment verification)
  public shared ({ caller }) func upgradeToPremium(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can grant premium upgrades");
    };
    let currentProfile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
    let updatedProfile : UserProfile = {
      name = currentProfile.name;
      userTier = #premium;
      guestMode = false;
      deviceId = null;
    };
    userProfiles.add(user, updatedProfile);

    // Clear trial state after upgrade
    switch (userTrialStates.get(user)) {
      case (null) { };
      case (?t) {
        userTrialStates.add(user, { t with trialActive = false; trialStartTimestamp = 0 });
      };
    };
  };

  // Admin-only: guest premium upgrades must be authorized by an admin
  public shared ({ caller }) func upgradeGuestToPremium(deviceId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can grant premium upgrades");
    };
    let profile = switch (guestProfiles.get(deviceId)) {
      case (null) { Runtime.trap("Guest profile not found") };
      case (?profile) { profile };
    };
    let updatedProfile : UserProfile = {
      profile with userTier = #premium;
    };
    guestProfiles.add(deviceId, updatedProfile);

    // Clear trial state after upgrade
    switch (guestTrialStates.get(deviceId)) {
      case (null) { };
      case (?t) {
        guestTrialStates.add(deviceId, { t with trialActive = false; trialStartTimestamp = 0 });
      };
    };
  };

  // ── Weekly Statistics ─────────────────────────────────────────────

  // Calculate weekly progress stats
  public query ({ caller }) func getWeeklyStats() : async { totalTasks : Nat; completedTasks : Nat; streak : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Access denied");
    };
    let totalTasks = 100;
    let completedTasks = 80;
    let streak = 5;
    { totalTasks; completedTasks; streak };
  };

  // Guest version of weekly stats
  public query ({ caller }) func getGuestWeeklyStats(deviceId : Text) : async {
    totalTasks : Nat;
    completedTasks : Nat;
    streak : Nat;
  } {
    let totalTasks = 100;
    let completedTasks = 80;
    let streak = 5;
    { totalTasks; completedTasks; streak };
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

  // ── Backup & Restore Types ────────────────────────────────────────────────

  public type BackupData = {
    exams : [Exam];
    trialState : ?TrialState;
    userProfile : ?UserProfile;
    backedUpAt : Int;
  };

  let userBackups = Map.empty<Principal, BackupData>();

  // ── Backup & Restore Functions ────────────────────────────────────────────

  public shared ({ caller }) func backupUserData() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can backup data");
    };
    // Only premium or trial users can use cloud backup
    let userTier = switch (userProfiles.get(caller)) {
      case (null) { #free };
      case (?p) { p.userTier };
    };
    if (userTier == #free) {
      Runtime.trap("Upgrade to premium to use cloud backup");
    };

    let exams = switch (userExams.get(caller)) {
      case (null) { [] };
      case (?e) { e };
    };
    let trialState = userTrialStates.get(caller);
    let userProfile = userProfiles.get(caller);

    let backup : BackupData = {
      exams = exams;
      trialState = trialState;
      userProfile = userProfile;
      backedUpAt = Time.now();
    };
    userBackups.add(caller, backup);
  };

  public shared ({ caller }) func restoreUserData() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can restore data");
    };
    // Only premium or trial users can use cloud backup/restore
    let userTier = switch (userProfiles.get(caller)) {
      case (null) { #free };
      case (?p) { p.userTier };
    };
    if (userTier == #free) {
      Runtime.trap("Upgrade to premium to use cloud restore");
    };

    let backup = switch (userBackups.get(caller)) {
      case (null) { Runtime.trap("No backup found for this user") };
      case (?b) { b };
    };

    userExams.add(caller, backup.exams);
    switch (backup.trialState) {
      case (null) { };
      case (?t) { userTrialStates.add(caller, t) };
    };
    switch (backup.userProfile) {
      case (null) { };
      case (?p) { userProfiles.add(caller, p) };
    };
  };

  public query ({ caller }) func getLatestBackup() : async ?BackupData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view backups");
    };
    let userTier = switch (userProfiles.get(caller)) {
      case (null) { #free };
      case (?p) { p.userTier };
    };
    if (userTier == #free) {
      Runtime.trap("Upgrade to premium to use cloud backup");
    };
    userBackups.get(caller);
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
      if (userTier == #free and not (AccessControl.isAdmin(accessControlState, caller))) {
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
