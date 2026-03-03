# Align - Team Task Management App

A Flutter app for collaborative team task management with a Snapchat-style streak system that rewards daily task completion.

## Features

- **Firebase Authentication** - Email/password login and registration
- **Team Management** - Create teams, invite members with 6-character codes
- **Task Assignment** - Team leaders create tasks and assign them to members
- **Collaborative Completion** - Track which members completed each task with progress bars
- **Streak System** - Snapchat-style daily streaks for completing at least one task per day
- **Reward Badges** - Unlock badges at 3, 7, 14, 30, 50, 100, and 365-day streaks
- **Clean Material 3 UI** - Modern, easy-to-navigate interface

## Prerequisites

1. **Flutter SDK** (3.2.0+) - [Install Flutter](https://docs.flutter.dev/get-started/install)
2. **Firebase CLI** - `npm install -g firebase-tools`
3. **FlutterFire CLI** - `dart pub global activate flutterfire_cli`

## Setup Instructions

### 1. Create the Flutter project shell

Since this project contains only the Dart source code, you need to generate the platform files first:

```bash
# Navigate to the parent directory of taskflow
cd taskflow

# Create a temporary Flutter project
flutter create --project-name align_app temp_project

# Copy platform directories into taskflow
xcopy temp_project\android android\ /E /I
xcopy temp_project\ios ios\ /E /I
xcopy temp_project\web web\ /E /I
xcopy temp_project\windows windows\ /E /I
xcopy temp_project\test test\ /E /I

# Clean up
rmdir /S /Q temp_project
```

Or more simply, create a fresh Flutter project and copy this `lib/` folder into it:

```bash
flutter create align_app_project
# Then copy lib/, pubspec.yaml, firestore.rules into align_app_project/
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication** > **Email/Password** sign-in method
3. Enable **Cloud Firestore** and create a database (start in test mode)
4. Configure Firebase for Flutter:

```bash
cd taskflow
flutterfire configure
```

This will auto-generate `lib/firebase_options.dart` with your actual project credentials (replacing the placeholder file).

### 3. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

### 4. (Optional) Add Poppins font

Download [Poppins from Google Fonts](https://fonts.google.com/specimen/Poppins) and place the `.ttf` files in `assets/fonts/`. If you skip this, remove the `fonts` section from `pubspec.yaml` and the app will use the system font.

### 5. Install dependencies and run

```bash
flutter pub get
flutter run
```

## Firestore Database Schema

```
users/{uid}
  ├── uid, email, displayName
  ├── avatarColor
  ├── currentStreak, longestStreak
  ├── lastCompletionDate
  ├── totalTasksCompleted
  └── joinedAt

teams/{teamId}
  ├── name, description
  ├── leaderId, leaderName
  ├── memberIds[], memberNames{}
  ├── inviteCode
  └── createdAt

tasks/{taskId}
  ├── title, description
  ├── teamId, teamName
  ├── createdBy, createdByName
  ├── assigneeIds[], assigneeNames{}
  ├── status (open/inProgress/completed)
  ├── priority (low/medium/high)
  ├── dueDate
  ├── completedBy{uid: timestamp}
  ├── createdAt
  └── updatedAt
```

## Streak System

| Days | Badge            |
|------|------------------|
| 3    | Getting Started  |
| 7    | Week Warrior     |
| 14   | Consistent       |
| 30   | Monthly Master   |
| 50   | Half Century     |
| 100  | Centurion        |
| 365  | Legendary        |

Complete at least **one task per day** to maintain your streak. Miss a day and it resets to zero!

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── firebase_options.dart        # Firebase config (auto-generated)
├── models/
│   ├── user_model.dart          # AppUser model with streak data
│   ├── team_model.dart          # Team model with invite codes
│   └── task_model.dart          # Task model with assignments
├── services/
│   ├── auth_service.dart        # Firebase Auth wrapper
│   └── firestore_service.dart   # Firestore CRUD + streak logic
├── providers/
│   ├── auth_provider.dart       # Authentication state
│   ├── team_provider.dart       # Team list state
│   └── task_provider.dart       # Task list state
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   ├── home/
│   │   └── home_screen.dart     # Dashboard with stats + task list
│   ├── teams/
│   │   ├── teams_screen.dart    # Team list + join
│   │   ├── create_team_screen.dart
│   │   └── team_detail_screen.dart
│   ├── tasks/
│   │   └── create_task_screen.dart
│   └── profile/
│       └── profile_screen.dart  # Streak display + badges
├── widgets/
│   ├── streak_display.dart      # Streak card + progress
│   ├── task_card.dart           # Task list item
│   └── team_card.dart           # Team list item
└── theme/
    └── app_theme.dart           # Material 3 theme
```
