import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/team_model.dart';
import '../models/task_model.dart';
import '../models/user_model.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // ── Teams ──

  Stream<List<Team>> getUserTeams(String uid) {
    return _db
        .collection('teams')
        .where('memberIds', arrayContains: uid)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => Team.fromMap(d.data(), d.id)).toList());
  }

  Future<Team> createTeam({
    required String name,
    required String description,
    required String leaderId,
    required String leaderName,
  }) async {
    final inviteCode = _generateInviteCode();
    final team = Team(
      id: '',
      name: name,
      description: description,
      leaderId: leaderId,
      leaderName: leaderName,
      memberIds: [leaderId],
      memberNames: {leaderId: leaderName},
      inviteCode: inviteCode,
    );

    final docRef = await _db.collection('teams').add(team.toMap());
    return Team(
      id: docRef.id,
      name: name,
      description: description,
      leaderId: leaderId,
      leaderName: leaderName,
      memberIds: [leaderId],
      memberNames: {leaderId: leaderName},
      inviteCode: inviteCode,
    );
  }

  Future<Team?> joinTeamByCode(String code, String uid, String userName) async {
    final snap = await _db
        .collection('teams')
        .where('inviteCode', isEqualTo: code.toUpperCase())
        .limit(1)
        .get();

    if (snap.docs.isEmpty) return null;

    final doc = snap.docs.first;
    final team = Team.fromMap(doc.data(), doc.id);

    if (team.isMember(uid)) return team;

    await doc.reference.update({
      'memberIds': FieldValue.arrayUnion([uid]),
      'memberNames.$uid': userName,
    });

    return Team.fromMap(
      {...doc.data(), 'memberIds': [...team.memberIds, uid], 'memberNames': {...team.memberNames, uid: userName}},
      doc.id,
    );
  }

  Future<void> leaveTeam(String teamId, String uid) async {
    await _db.collection('teams').doc(teamId).update({
      'memberIds': FieldValue.arrayRemove([uid]),
      'memberNames.$uid': FieldValue.delete(),
    });
  }

  Future<Team?> getTeam(String teamId) async {
    final doc = await _db.collection('teams').doc(teamId).get();
    if (!doc.exists) return null;
    return Team.fromMap(doc.data()!, doc.id);
  }

  // ── Tasks ──

  Stream<List<Task>> getTeamTasks(String teamId) {
    return _db
        .collection('tasks')
        .where('teamId', isEqualTo: teamId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => Task.fromMap(d.data(), d.id)).toList());
  }

  Stream<List<Task>> getUserTasks(String uid) {
    return _db
        .collection('tasks')
        .where('assigneeIds', arrayContains: uid)
        .orderBy('updatedAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => Task.fromMap(d.data(), d.id)).toList());
  }

  Future<Task> createTask({
    required String title,
    required String description,
    required String teamId,
    required String teamName,
    required String createdBy,
    required String createdByName,
    required List<String> assigneeIds,
    required Map<String, String> assigneeNames,
    required TaskPriority priority,
    DateTime? dueDate,
  }) async {
    final task = Task(
      id: '',
      title: title,
      description: description,
      teamId: teamId,
      teamName: teamName,
      createdBy: createdBy,
      createdByName: createdByName,
      assigneeIds: assigneeIds,
      assigneeNames: assigneeNames,
      priority: priority,
      dueDate: dueDate,
    );

    final docRef = await _db.collection('tasks').add(task.toMap());
    return Task(
      id: docRef.id,
      title: title,
      description: description,
      teamId: teamId,
      teamName: teamName,
      createdBy: createdBy,
      createdByName: createdByName,
      assigneeIds: assigneeIds,
      assigneeNames: assigneeNames,
      priority: priority,
      dueDate: dueDate,
    );
  }

  Future<void> markTaskCompleted(String taskId, String uid) async {
    await _db.collection('tasks').doc(taskId).update({
      'completedBy.$uid': Timestamp.fromDate(DateTime.now()),
      'updatedAt': Timestamp.fromDate(DateTime.now()),
    });

    final doc = await _db.collection('tasks').doc(taskId).get();
    final task = Task.fromMap(doc.data()!, doc.id);

    if (task.completedBy.length >= task.assigneeIds.length &&
        task.assigneeIds.isNotEmpty) {
      await _db.collection('tasks').doc(taskId).update({
        'status': TaskStatus.completed.name,
      });
    } else if (task.completedBy.isNotEmpty) {
      await _db.collection('tasks').doc(taskId).update({
        'status': TaskStatus.inProgress.name,
      });
    }
  }

  Future<void> updateTaskStatus(String taskId, TaskStatus status) async {
    await _db.collection('tasks').doc(taskId).update({
      'status': status.name,
      'updatedAt': Timestamp.fromDate(DateTime.now()),
    });
  }

  Future<void> deleteTask(String taskId) async {
    await _db.collection('tasks').doc(taskId).delete();
  }

  // ── Streaks ──

  Future<void> updateStreak(String uid) async {
    final userRef = _db.collection('users').doc(uid);
    final doc = await userRef.get();
    if (!doc.exists) return;

    final user = AppUser.fromMap(doc.data()!);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    if (user.lastCompletionDate != null) {
      final lastDate = DateTime(
        user.lastCompletionDate!.year,
        user.lastCompletionDate!.month,
        user.lastCompletionDate!.day,
      );

      if (lastDate == today) return; // Already completed today

      final yesterday = today.subtract(const Duration(days: 1));
      if (lastDate == yesterday) {
        final newStreak = user.currentStreak + 1;
        await userRef.update({
          'currentStreak': newStreak,
          'longestStreak':
              newStreak > user.longestStreak ? newStreak : user.longestStreak,
          'lastCompletionDate': Timestamp.fromDate(now),
          'totalTasksCompleted': FieldValue.increment(1),
        });
      } else {
        await userRef.update({
          'currentStreak': 1,
          'lastCompletionDate': Timestamp.fromDate(now),
          'totalTasksCompleted': FieldValue.increment(1),
        });
      }
    } else {
      await userRef.update({
        'currentStreak': 1,
        'longestStreak': user.longestStreak > 0 ? user.longestStreak : 1,
        'lastCompletionDate': Timestamp.fromDate(now),
        'totalTasksCompleted': FieldValue.increment(1),
      });
    }
  }

  Future<AppUser?> getUserProfile(String uid) async {
    final doc = await _db.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return AppUser.fromMap(doc.data()!);
  }

  Stream<AppUser?> watchUserProfile(String uid) {
    return _db.collection('users').doc(uid).snapshots().map((doc) {
      if (!doc.exists) return null;
      return AppUser.fromMap(doc.data()!);
    });
  }

  // ── Helpers ──

  String _generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final rand = Random.secure();
    return List.generate(6, (_) => chars[rand.nextInt(chars.length)]).join();
  }
}
