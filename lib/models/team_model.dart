import 'package:cloud_firestore/cloud_firestore.dart';

class Team {
  final String id;
  final String name;
  final String description;
  final String leaderId;
  final String leaderName;
  final List<String> memberIds;
  final Map<String, String> memberNames;
  final String inviteCode;
  final DateTime createdAt;

  Team({
    required this.id,
    required this.name,
    this.description = '',
    required this.leaderId,
    required this.leaderName,
    required this.memberIds,
    required this.memberNames,
    required this.inviteCode,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory Team.fromMap(Map<String, dynamic> map, String docId) {
    return Team(
      id: docId,
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      leaderId: map['leaderId'] ?? '',
      leaderName: map['leaderName'] ?? '',
      memberIds: List<String>.from(map['memberIds'] ?? []),
      memberNames: Map<String, String>.from(map['memberNames'] ?? {}),
      inviteCode: map['inviteCode'] ?? '',
      createdAt: map['createdAt'] != null
          ? (map['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'description': description,
      'leaderId': leaderId,
      'leaderName': leaderName,
      'memberIds': memberIds,
      'memberNames': memberNames,
      'inviteCode': inviteCode,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  bool isLeader(String uid) => leaderId == uid;
  bool isMember(String uid) => memberIds.contains(uid);
  int get memberCount => memberIds.length;
}
