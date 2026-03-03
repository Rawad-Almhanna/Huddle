import 'dart:async';
import 'package:flutter/material.dart';
import '../models/task_model.dart';
import '../services/firestore_service.dart';

class TaskProvider extends ChangeNotifier {
  final FirestoreService _service = FirestoreService();

  List<Task> _userTasks = [];
  List<Task> _teamTasks = [];
  bool _loading = false;
  String? _error;
  StreamSubscription? _userSub;
  StreamSubscription? _teamSub;

  List<Task> get userTasks => _userTasks;
  List<Task> get teamTasks => _teamTasks;
  bool get loading => _loading;
  String? get error => _error;

  List<Task> get pendingTasks =>
      _userTasks.where((t) => t.status != TaskStatus.completed).toList();

  List<Task> get completedTasks =>
      _userTasks.where((t) => t.status == TaskStatus.completed).toList();

  int get todayCompletedCount {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    return _userTasks.where((t) {
      return t.completedBy.values.any((date) {
        final d = DateTime(date.year, date.month, date.day);
        return d == today;
      });
    }).length;
  }

  void loadUserTasks(String uid) {
    _userSub?.cancel();
    _loading = true;
    notifyListeners();

    _userSub = _service.getUserTasks(uid).listen(
      (tasks) {
        _userTasks = tasks;
        _loading = false;
        notifyListeners();
      },
      onError: (e) {
        _error = 'Failed to load tasks';
        _loading = false;
        notifyListeners();
      },
    );
  }

  void loadTeamTasks(String teamId) {
    _teamSub?.cancel();
    _teamSub = _service.getTeamTasks(teamId).listen(
      (tasks) {
        _teamTasks = tasks;
        notifyListeners();
      },
      onError: (e) {
        _error = 'Failed to load team tasks';
        notifyListeners();
      },
    );
  }

  Future<Task?> createTask({
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
    try {
      _error = null;
      final task = await _service.createTask(
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
      return task;
    } catch (e) {
      _error = 'Failed to create task';
      notifyListeners();
      return null;
    }
  }

  Future<void> markComplete(String taskId, String uid) async {
    try {
      await _service.markTaskCompleted(taskId, uid);
      await _service.updateStreak(uid);
    } catch (e) {
      _error = 'Failed to complete task';
      notifyListeners();
    }
  }

  Future<void> deleteTask(String taskId) async {
    try {
      await _service.deleteTask(taskId);
    } catch (e) {
      _error = 'Failed to delete task';
      notifyListeners();
    }
  }

  void clearTeamTasks() {
    _teamSub?.cancel();
    _teamTasks = [];
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _userSub?.cancel();
    _teamSub?.cancel();
    super.dispose();
  }
}
