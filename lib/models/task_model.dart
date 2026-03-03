import 'package:cloud_firestore/cloud_firestore.dart';

enum TaskStatus { open, inProgress, completed }

enum TaskPriority { low, medium, high }

class Task {
  final String id;
  final String title;
  final String description;
  final String teamId;
  final String teamName;
  final String createdBy;
  final String createdByName;
  final List<String> assigneeIds;
  final Map<String, String> assigneeNames;
  final TaskStatus status;
  final TaskPriority priority;
  final DateTime? dueDate;
  final Map<String, DateTime> completedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Task({
    required this.id,
    required this.title,
    this.description = '',
    required this.teamId,
    this.teamName = '',
    required this.createdBy,
    this.createdByName = '',
    this.assigneeIds = const [],
    this.assigneeNames = const {},
    this.status = TaskStatus.open,
    this.priority = TaskPriority.medium,
    this.dueDate,
    this.completedBy = const {},
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory Task.fromMap(Map<String, dynamic> map, String docId) {
    final completedByRaw = map['completedBy'] as Map<String, dynamic>? ?? {};
    final completedByParsed = completedByRaw.map(
      (key, value) => MapEntry(key, (value as Timestamp).toDate()),
    );

    return Task(
      id: docId,
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      teamId: map['teamId'] ?? '',
      teamName: map['teamName'] ?? '',
      createdBy: map['createdBy'] ?? '',
      createdByName: map['createdByName'] ?? '',
      assigneeIds: List<String>.from(map['assigneeIds'] ?? []),
      assigneeNames: Map<String, String>.from(map['assigneeNames'] ?? {}),
      status: TaskStatus.values.firstWhere(
        (e) => e.name == (map['status'] ?? 'open'),
        orElse: () => TaskStatus.open,
      ),
      priority: TaskPriority.values.firstWhere(
        (e) => e.name == (map['priority'] ?? 'medium'),
        orElse: () => TaskPriority.medium,
      ),
      dueDate: map['dueDate'] != null
          ? (map['dueDate'] as Timestamp).toDate()
          : null,
      completedBy: completedByParsed,
      createdAt: map['createdAt'] != null
          ? (map['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
      updatedAt: map['updatedAt'] != null
          ? (map['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'description': description,
      'teamId': teamId,
      'teamName': teamName,
      'createdBy': createdBy,
      'createdByName': createdByName,
      'assigneeIds': assigneeIds,
      'assigneeNames': assigneeNames,
      'status': status.name,
      'priority': priority.name,
      'dueDate': dueDate != null ? Timestamp.fromDate(dueDate!) : null,
      'completedBy': completedBy.map(
        (key, value) => MapEntry(key, Timestamp.fromDate(value)),
      ),
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(DateTime.now()),
    };
  }

  Task copyWith({
    String? title,
    String? description,
    List<String>? assigneeIds,
    Map<String, String>? assigneeNames,
    TaskStatus? status,
    TaskPriority? priority,
    DateTime? dueDate,
    Map<String, DateTime>? completedBy,
  }) {
    return Task(
      id: id,
      title: title ?? this.title,
      description: description ?? this.description,
      teamId: teamId,
      teamName: teamName,
      createdBy: createdBy,
      createdByName: createdByName,
      assigneeIds: assigneeIds ?? this.assigneeIds,
      assigneeNames: assigneeNames ?? this.assigneeNames,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      dueDate: dueDate ?? this.dueDate,
      completedBy: completedBy ?? this.completedBy,
      createdAt: createdAt,
    );
  }

  bool isCompletedByUser(String uid) => completedBy.containsKey(uid);

  double get completionProgress {
    if (assigneeIds.isEmpty) return 0;
    return completedBy.length / assigneeIds.length;
  }

  String get priorityLabel {
    switch (priority) {
      case TaskPriority.high:
        return 'High';
      case TaskPriority.medium:
        return 'Medium';
      case TaskPriority.low:
        return 'Low';
    }
  }

  String get statusLabel {
    switch (status) {
      case TaskStatus.open:
        return 'Open';
      case TaskStatus.inProgress:
        return 'In Progress';
      case TaskStatus.completed:
        return 'Completed';
    }
  }
}
