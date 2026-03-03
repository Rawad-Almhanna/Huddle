import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final FirestoreService _firestoreService = FirestoreService();

  AppUser? _user;
  bool _loading = true;
  String? _error;

  AppUser? get user => _user;
  bool get loading => _loading;
  bool get isLoggedIn => _user != null;
  String? get error => _error;

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    _authService.authStateChanges.listen((firebaseUser) async {
      if (firebaseUser != null) {
        _user = await _authService.getCurrentUserProfile();
        if (_user != null) {
          _firestoreService.watchUserProfile(_user!.uid).listen((updated) {
            if (updated != null) {
              _user = updated;
              notifyListeners();
            }
          });
        }
      } else {
        _user = null;
      }
      _loading = false;
      notifyListeners();
    });
  }

  Future<bool> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    try {
      _error = null;
      _loading = true;
      notifyListeners();

      _user = await _authService.register(
        email: email,
        password: password,
        displayName: displayName,
      );
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _parseError(e.toString());
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    try {
      _error = null;
      _loading = true;
      notifyListeners();

      _user = await _authService.login(
        email: email,
        password: password,
      );
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _parseError(e.toString());
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  String _parseError(String error) {
    if (error.contains('email-already-in-use')) {
      return 'This email is already registered';
    }
    if (error.contains('wrong-password') || error.contains('invalid-credential')) {
      return 'Invalid email or password';
    }
    if (error.contains('user-not-found')) {
      return 'No account found with this email';
    }
    if (error.contains('weak-password')) {
      return 'Password must be at least 6 characters';
    }
    if (error.contains('invalid-email')) {
      return 'Please enter a valid email address';
    }
    if (error.contains('network-request-failed')) {
      return 'Network error. Check your connection';
    }
    return 'Something went wrong. Please try again';
  }
}
