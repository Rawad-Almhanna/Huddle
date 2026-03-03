import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/task_model.dart';
import '../theme/app_theme.dart';

class TaskCard extends StatelessWidget {
  final Task task;
  final String currentUserId;
  final VoidCallback? onTap;
  final VoidCallback? onComplete;

  const TaskCard({
    super.key,
    required this.task,
    required this.currentUserId,
    this.onTap,
    this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    final isCompletedByMe = task.isCompletedByUser(currentUserId);
    final isFullyCompleted = task.status == TaskStatus.completed;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 4,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppTheme.priorityColor(task.priorityLabel),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          task.title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            decoration: isFullyCompleted
                                ? TextDecoration.lineThrough
                                : null,
                            color: isFullyCompleted
                                ? Colors.grey
                                : const Color(0xFF1A1A2E),
                          ),
                        ),
                        if (task.teamName.isNotEmpty)
                          Text(
                            task.teamName,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade500,
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (!isCompletedByMe && !isFullyCompleted && onComplete != null)
                    IconButton(
                      onPressed: onComplete,
                      icon: const Icon(Icons.check_circle_outline),
                      color: AppTheme.primaryColor,
                      tooltip: 'Mark as done',
                    )
                  else if (isCompletedByMe)
                    const Icon(
                      Icons.check_circle,
                      color: Color(0xFF10B981),
                    ),
                ],
              ),
              if (task.description.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  task.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildChip(
                    task.statusLabel,
                    AppTheme.statusColor(task.status.name),
                  ),
                  const SizedBox(width: 8),
                  _buildChip(
                    task.priorityLabel,
                    AppTheme.priorityColor(task.priorityLabel),
                  ),
                  const Spacer(),
                  if (task.dueDate != null)
                    Row(
                      children: [
                        Icon(
                          Icons.schedule,
                          size: 14,
                          color: _isDueWarning
                              ? Colors.red.shade400
                              : Colors.grey.shade500,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          DateFormat('MMM d').format(task.dueDate!),
                          style: TextStyle(
                            fontSize: 12,
                            color: _isDueWarning
                                ? Colors.red.shade400
                                : Colors.grey.shade500,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
              if (task.assigneeIds.length > 1) ...[
                const SizedBox(height: 10),
                _buildProgressBar(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  bool get _isDueWarning {
    if (task.dueDate == null || task.status == TaskStatus.completed) return false;
    return task.dueDate!.difference(DateTime.now()).inDays <= 1;
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildProgressBar() {
    final progress = task.completionProgress;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${task.completedBy.length}/${task.assigneeIds.length} completed',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
            ),
            Text(
              '${(progress * 100).round()}%',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 5,
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation(
              progress >= 1.0 ? const Color(0xFF10B981) : AppTheme.primaryColor,
            ),
          ),
        ),
      ],
    );
  }
}
