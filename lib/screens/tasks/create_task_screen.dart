import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/task_model.dart';
import '../../models/team_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/task_provider.dart';

class CreateTaskScreen extends StatefulWidget {
  final Team team;

  const CreateTaskScreen({super.key, required this.team});

  @override
  State<CreateTaskScreen> createState() => _CreateTaskScreenState();
}

class _CreateTaskScreenState extends State<CreateTaskScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  TaskPriority _priority = TaskPriority.medium;
  DateTime? _dueDate;
  Set<String> _selectedAssignees = {};
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _selectedAssignees = widget.team.memberIds.toSet();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedAssignees.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Select at least one assignee'),
          behavior: SnackBarBehavior.floating,
          backgroundColor: Colors.red.shade600,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      return;
    }

    setState(() => _submitting = true);
    final user = context.read<AuthProvider>().user!;

    final assigneeNames = Map<String, String>.fromEntries(
      _selectedAssignees.map(
        (id) => MapEntry(id, widget.team.memberNames[id] ?? 'Unknown'),
      ),
    );

    await context.read<TaskProvider>().createTask(
          title: _titleController.text.trim(),
          description: _descController.text.trim(),
          teamId: widget.team.id,
          teamName: widget.team.name,
          createdBy: user.uid,
          createdByName: user.displayName,
          assigneeIds: _selectedAssignees.toList(),
          assigneeNames: assigneeNames,
          priority: _priority,
          dueDate: _dueDate,
        );

    if (mounted) {
      setState(() => _submitting = false);
      Navigator.pop(context);
    }
  }

  Future<void> _pickDueDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _dueDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Task')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _SectionLabel('Title'),
              TextFormField(
                controller: _titleController,
                textCapitalization: TextCapitalization.sentences,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  hintText: 'What needs to be done?',
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Title is required';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              const _SectionLabel('Description (optional)'),
              TextFormField(
                controller: _descController,
                maxLines: 3,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  hintText: 'Add details about this task...',
                ),
              ),
              const SizedBox(height: 20),
              const _SectionLabel('Priority'),
              const SizedBox(height: 8),
              Row(
                children: TaskPriority.values.map((p) {
                  final isSelected = _priority == p;
                  final color = _priorityColor(p);
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _priority = p),
                      child: Container(
                        margin: EdgeInsets.only(
                          right: p != TaskPriority.high ? 8 : 0,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? color.withOpacity(0.15)
                              : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? color : Colors.transparent,
                            width: 1.5,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            p.name[0].toUpperCase() + p.name.substring(1),
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: isSelected ? color : Colors.grey.shade600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              const _SectionLabel('Due Date (optional)'),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: _pickDueDate,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.calendar_today_outlined,
                          size: 18, color: Colors.grey.shade500),
                      const SizedBox(width: 12),
                      Text(
                        _dueDate != null
                            ? DateFormat('EEEE, MMM d, yyyy').format(_dueDate!)
                            : 'Pick a date',
                        style: TextStyle(
                          color: _dueDate != null
                              ? Colors.black87
                              : Colors.grey.shade400,
                        ),
                      ),
                      const Spacer(),
                      if (_dueDate != null)
                        GestureDetector(
                          onTap: () => setState(() => _dueDate = null),
                          child: Icon(Icons.close,
                              size: 18, color: Colors.grey.shade400),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const _SectionLabel('Assign To'),
              const SizedBox(height: 8),
              _buildAssigneeSelector(),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _create,
                  child: _submitting
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Create Task'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAssigneeSelector() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: widget.team.memberNames.entries.map((e) {
        final isSelected = _selectedAssignees.contains(e.key);
        return FilterChip(
          selected: isSelected,
          label: Text(e.value),
          avatar: CircleAvatar(
            backgroundColor: Colors.transparent,
            child: Text(
              e.value.isNotEmpty ? e.value[0].toUpperCase() : '?',
              style: const TextStyle(fontSize: 12),
            ),
          ),
          onSelected: (selected) {
            setState(() {
              if (selected) {
                _selectedAssignees.add(e.key);
              } else {
                _selectedAssignees.remove(e.key);
              }
            });
          },
        );
      }).toList(),
    );
  }

  Color _priorityColor(TaskPriority p) {
    switch (p) {
      case TaskPriority.high:
        return const Color(0xFFEF4444);
      case TaskPriority.medium:
        return const Color(0xFFF59E0B);
      case TaskPriority.low:
        return const Color(0xFF10B981);
    }
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
    );
  }
}
