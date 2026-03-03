import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../theme/app_theme.dart';

class StreakDisplay extends StatelessWidget {
  final AppUser user;
  final bool compact;

  const StreakDisplay({
    super.key,
    required this.user,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (compact) return _buildCompact(context);
    return _buildFull(context);
  }

  Widget _buildCompact(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.streakColor.withOpacity(0.12),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            _streakEmoji,
            style: const TextStyle(fontSize: 18),
          ),
          const SizedBox(width: 6),
          Text(
            '${user.currentStreak}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.streakColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFull(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppTheme.streakColor,
                        AppTheme.streakColor.withOpacity(0.7),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text(
                      _streakEmoji,
                      style: const TextStyle(fontSize: 28),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${user.currentStreak} Day Streak',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user.streakTier,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppTheme.streakColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                _StatTile(
                  label: 'Longest',
                  value: '${user.longestStreak}',
                  icon: Icons.emoji_events_outlined,
                ),
                const SizedBox(width: 12),
                _StatTile(
                  label: 'Completed',
                  value: '${user.totalTasksCompleted}',
                  icon: Icons.check_circle_outline,
                ),
                const SizedBox(width: 12),
                _StatTile(
                  label: 'Tier',
                  value: user.streakTier,
                  icon: Icons.star_outline,
                  small: true,
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildMilestoneProgress(context),
          ],
        ),
      ),
    );
  }

  Widget _buildMilestoneProgress(BuildContext context) {
    final milestones = [3, 7, 14, 30, 50, 100, 365];
    final nextMilestone = milestones.firstWhere(
      (m) => m > user.currentStreak,
      orElse: () => 365,
    );
    final prevMilestone = milestones.lastWhere(
      (m) => m <= user.currentStreak,
      orElse: () => 0,
    );
    final progress = (user.currentStreak - prevMilestone) /
        (nextMilestone - prevMilestone).clamp(1, 999);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Next milestone: $nextMilestone days',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              '${user.currentStreak}/$nextMilestone',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: progress.clamp(0.0, 1.0),
            minHeight: 8,
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation(AppTheme.streakColor),
          ),
        ),
      ],
    );
  }

  String get _streakEmoji {
    if (user.currentStreak >= 100) return '\u{1F525}\u{1F525}\u{1F525}';
    if (user.currentStreak >= 30) return '\u{1F525}\u{1F525}';
    if (user.currentStreak >= 7) return '\u{1F525}';
    if (user.currentStreak >= 3) return '\u{2B50}';
    if (user.currentStreak >= 1) return '\u{26A1}';
    return '\u{1F4A4}';
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool small;

  const _StatTile({
    required this.label,
    required this.value,
    required this.icon,
    this.small = false,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: Colors.grey.shade600),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: small ? 11 : 16,
                fontWeight: FontWeight.w700,
              ),
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
