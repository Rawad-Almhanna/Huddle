import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/streak_display.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    if (user == null) return const SizedBox();

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 8),
            CircleAvatar(
              radius: 44,
              backgroundColor: Color(user.avatarColor).withOpacity(0.2),
              child: Text(
                user.displayName.isNotEmpty
                    ? user.displayName[0].toUpperCase()
                    : '?',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w700,
                  color: Color(user.avatarColor),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              user.displayName,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              user.email,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade500,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Joined ${DateFormat('MMMM yyyy').format(user.joinedAt)}',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade400,
              ),
            ),
            const SizedBox(height: 24),
            StreakDisplay(user: user),
            const SizedBox(height: 16),
            _buildRewardsBadges(context),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _confirmLogout(context),
                icon: const Icon(Icons.logout, size: 18),
                label: const Text('Sign Out'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red.shade400,
                  side: BorderSide(color: Colors.red.shade300),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildRewardsBadges(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final streak = auth.user?.longestStreak ?? 0;

    final badges = [
      _Badge('Getting Started', 3, Icons.flash_on_outlined, const Color(0xFF60A5FA)),
      _Badge('Week Warrior', 7, Icons.local_fire_department_outlined, const Color(0xFFF97316)),
      _Badge('Consistent', 14, Icons.trending_up, const Color(0xFF8B5CF6)),
      _Badge('Monthly Master', 30, Icons.workspace_premium_outlined, const Color(0xFFF59E0B)),
      _Badge('Half Century', 50, Icons.military_tech_outlined, const Color(0xFFEC4899)),
      _Badge('Centurion', 100, Icons.shield_outlined, const Color(0xFFEF4444)),
      _Badge('Legendary', 365, Icons.diamond_outlined, const Color(0xFF14B8A6)),
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.emoji_events_outlined, size: 20),
                SizedBox(width: 8),
                Text(
                  'Streak Rewards',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.75,
              ),
              itemCount: badges.length,
              itemBuilder: (context, index) {
                final badge = badges[index];
                final unlocked = streak >= badge.daysRequired;
                return _buildBadgeItem(badge, unlocked);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadgeItem(_Badge badge, bool unlocked) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: unlocked
                ? badge.color.withOpacity(0.15)
                : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: unlocked ? badge.color.withOpacity(0.4) : Colors.grey.shade200,
            ),
          ),
          child: Icon(
            badge.icon,
            size: 26,
            color: unlocked ? badge.color : Colors.grey.shade300,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          badge.label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: unlocked ? Colors.black87 : Colors.grey.shade400,
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<AuthProvider>().logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade500,
            ),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}

class _Badge {
  final String label;
  final int daysRequired;
  final IconData icon;
  final Color color;

  const _Badge(this.label, this.daysRequired, this.icon, this.color);
}
