import 'package:cloud_firestore/cloud_firestore.dart';

class AppUser {
  final String uid;
  final String email;
  final String displayName;
  final int avatarColor;
  final int currentStreak;
  final int longestStreak;
  final DateTime? lastCompletionDate;
  final int totalTasksCompleted;
  final DateTime joinedAt;

  AppUser({
    required this.uid,
    required this.email,
    required this.displayName,
    this.avatarColor = 0xFF6C63FF,
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.lastCompletionDate,
    this.totalTasksCompleted = 0,
    DateTime? joinedAt,
  }) : joinedAt = joinedAt ?? DateTime.now();

  factory AppUser.fromMap(Map<String, dynamic> map) {
    return AppUser(
      uid: map['uid'] ?? '',
      email: map['email'] ?? '',
      displayName: map['displayName'] ?? '',
      avatarColor: map['avatarColor'] ?? 0xFF6C63FF,
      currentStreak: map['currentStreak'] ?? 0,
      longestStreak: map['longestStreak'] ?? 0,
      lastCompletionDate: map['lastCompletionDate'] != null
          ? (map['lastCompletionDate'] as Timestamp).toDate()
          : null,
      totalTasksCompleted: map['totalTasksCompleted'] ?? 0,
      joinedAt: map['joinedAt'] != null
          ? (map['joinedAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'avatarColor': avatarColor,
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'lastCompletionDate': lastCompletionDate != null
          ? Timestamp.fromDate(lastCompletionDate!)
          : null,
      'totalTasksCompleted': totalTasksCompleted,
      'joinedAt': Timestamp.fromDate(joinedAt),
    };
  }

  AppUser copyWith({
    String? displayName,
    int? avatarColor,
    int? currentStreak,
    int? longestStreak,
    DateTime? lastCompletionDate,
    int? totalTasksCompleted,
  }) {
    return AppUser(
      uid: uid,
      email: email,
      displayName: displayName ?? this.displayName,
      avatarColor: avatarColor ?? this.avatarColor,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      lastCompletionDate: lastCompletionDate ?? this.lastCompletionDate,
      totalTasksCompleted: totalTasksCompleted ?? this.totalTasksCompleted,
      joinedAt: joinedAt,
    );
  }

  String get streakTier {
    if (currentStreak >= 365) return 'Legendary';
    if (currentStreak >= 100) return 'Centurion';
    if (currentStreak >= 50) return 'Half Century';
    if (currentStreak >= 30) return 'Monthly Master';
    if (currentStreak >= 14) return 'Consistent';
    if (currentStreak >= 7) return 'Week Warrior';
    if (currentStreak >= 3) return 'Getting Started';
    return 'Newcomer';
  }
}
