import 'dart:math';
import 'package:flutter/material.dart';
import '../models/team_model.dart';

class TeamProvider extends ChangeNotifier {
  final List<Team> _teams = [];
  bool _loading = false;
  String? _error;
  int _nextId = 1;

  List<Team> get teams => _teams;
  bool get loading => _loading;
  String? get error => _error;

  void loadTeams(String uid) {
    _loading = false;
    notifyListeners();
  }

  Team? getTeam(String teamId) {
    try {
      return _teams.firstWhere((t) => t.id == teamId);
    } catch (_) {
      return null;
    }
  }

  Future<Team?> createTeam({
    required String name,
    required String description,
    required String leaderId,
    required String leaderName,
  }) async {
    _error = null;
    final code = _generateInviteCode();
    final team = Team(
      id: 'team-${_nextId++}',
      name: name,
      description: description,
      leaderId: leaderId,
      leaderName: leaderName,
      memberIds: [leaderId],
      memberNames: {leaderId: leaderName},
      inviteCode: code,
    );
    _teams.add(team);
    notifyListeners();
    return team;
  }

  Future<Team?> joinTeam(String code, String uid, String userName) async {
    _error = 'Join team is disabled in offline mode';
    notifyListeners();
    return null;
  }

  Future<void> leaveTeam(String teamId, String uid) async {}

  void clearError() {
    _error = null;
    notifyListeners();
  }

  String _generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final rand = Random.secure();
    return List.generate(6, (_) => chars[rand.nextInt(chars.length)]).join();
  }
}
