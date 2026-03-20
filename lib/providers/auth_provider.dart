import 'package:flutter/material.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  AppUser? _user;
  bool _loading = false;
  String? _error;

  AppUser? get user => _user;
  bool get loading => _loading;
  bool get isLoggedIn => _user != null;
  String? get error => _error;

  AuthProvider() {
    _user = AppUser(
      uid: 'demo-user',
      email: 'demo@alignapp.com',
      displayName: 'Demo User',
      currentStreak: 5,
      longestStreak: 12,
      totalTasksCompleted: 23,
    );
  }

  Future<void> logout() async {
    _user = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
