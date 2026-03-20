import 'package:flutter/material.dart';
import '../models/task_model.dart';

class TaskProvider extends ChangeNotifier {
  final List<Task> _allTasks = [];
  bool _loading = false;
  String? _error;
  int _nextId = 1;
  String? _currentUserId;

  List<Task> get userTasks =>
      _allTasks.where((t) => t.assigneeIds.contains(_currentUserId)).toList();

  List<Task> get teamTasks => _filteredTeamTasks;
  List<Task> _filteredTeamTasks = [];

  bool get loading => _loading;
  String? get error => _error;

  List<Task> get pendingTasks =>
      userTasks.where((t) => t.status != TaskStatus.completed).toList();

  List<Task> get completedTasks =>
      userTasks.where((t) => t.status == TaskStatus.completed).toList();

  int get todayCompletedCount {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    return userTasks.where((t) {
      return t.completedBy.values.any((date) {
        final d = DateTime(date.year, date.month, date.day);
        return d == today;
      });
    }).length;
  }

  void loadUserTasks(String uid) {
    _currentUserId = uid;
    _loading = false;
    notifyListeners();
  }

  void loadTeamTasks(String teamId) {
    _filteredTeamTasks =
        _allTasks.where((t) => t.teamId == teamId).toList();
    notifyListeners();
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
    _error = null;
    final task = Task(
      id: 'task-${_nextId++}',
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
    _allTasks.add(task);
    _filteredTeamTasks =
        _allTasks.where((t) => t.teamId == teamId).toList();
    notifyListeners();
    return task;
  }

  Future<void> markComplete(String taskId, String uid) async {
    final index = _allTasks.indexWhere((t) => t.id == taskId);
    if (index == -1) return;

    final task = _allTasks[index];
    final newCompletedBy = Map<String, DateTime>.from(task.completedBy)
      ..[uid] = DateTime.now();

    final allDone = newCompletedBy.length >= task.assigneeIds.length &&
        task.assigneeIds.isNotEmpty;

    _allTasks[index] = task.copyWith(
      completedBy: newCompletedBy,
      status: allDone
          ? TaskStatus.completed
          : newCompletedBy.isNotEmpty
              ? TaskStatus.inProgress
              : null,
    );

    _filteredTeamTasks =
        _allTasks.where((t) => t.teamId == task.teamId).toList();
    notifyListeners();
  }

  Future<void> deleteTask(String taskId) async {
    _allTasks.removeWhere((t) => t.id == taskId);
    notifyListeners();
  }

  void clearTeamTasks() {
    _filteredTeamTasks = [];
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
