import 'dart:async';
import 'package:flutter/material.dart';
import '../models/team_model.dart';
import '../services/firestore_service.dart';

class TeamProvider extends ChangeNotifier {
  final FirestoreService _service = FirestoreService();

  List<Team> _teams = [];
  bool _loading = false;
  String? _error;
  StreamSubscription? _subscription;

  List<Team> get teams => _teams;
  bool get loading => _loading;
  String? get error => _error;

  void loadTeams(String uid) {
    _subscription?.cancel();
    _loading = true;
    notifyListeners();

    _subscription = _service.getUserTeams(uid).listen(
      (teams) {
        _teams = teams;
        _loading = false;
        notifyListeners();
      },
      onError: (e) {
        _error = 'Failed to load teams';
        _loading = false;
        notifyListeners();
      },
    );
  }

  Future<Team?> createTeam({
    required String name,
    required String description,
    required String leaderId,
    required String leaderName,
  }) async {
    try {
      _error = null;
      final team = await _service.createTeam(
        name: name,
        description: description,
        leaderId: leaderId,
        leaderName: leaderName,
      );
      return team;
    } catch (e) {
      _error = 'Failed to create team';
      notifyListeners();
      return null;
    }
  }

  Future<Team?> joinTeam(String code, String uid, String userName) async {
    try {
      _error = null;
      final team = await _service.joinTeamByCode(code, uid, userName);
      if (team == null) {
        _error = 'Invalid invite code';
        notifyListeners();
      }
      return team;
    } catch (e) {
      _error = 'Failed to join team';
      notifyListeners();
      return null;
    }
  }

  Future<void> leaveTeam(String teamId, String uid) async {
    try {
      await _service.leaveTeam(teamId, uid);
    } catch (e) {
      _error = 'Failed to leave team';
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
