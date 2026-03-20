import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const TaskContext = createContext(null);

export function useTask() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
}

let nextId = 1;

export function TaskProvider({ children }) {
  const [allTasks, setAllTasks] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentTeamId, setCurrentTeamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userTasks = useMemo(
    () => allTasks.filter((t) => t.assigneeIds.includes(currentUserId)),
    [allTasks, currentUserId]
  );

  const teamTasks = useMemo(
    () => allTasks.filter((t) => t.teamId === currentTeamId),
    [allTasks, currentTeamId]
  );

  const pendingTasks = useMemo(
    () => userTasks.filter((t) => t.status !== 'completed'),
    [userTasks]
  );

  const completedTasks = useMemo(
    () => userTasks.filter((t) => t.status === 'completed'),
    [userTasks]
  );

  const todayCompletedCount = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return userTasks.filter((t) =>
      Object.values(t.completedBy || {}).some((date) => {
        const d = date instanceof Date ? date : new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() === today.getTime();
      })
    ).length;
  }, [userTasks]);

  const loadUserTasks = useCallback((uid) => {
    setCurrentUserId(uid);
    setLoading(false);
  }, []);

  const loadTeamTasks = useCallback((teamId) => {
    setCurrentTeamId(teamId);
  }, []);

  const createTask = useCallback(
    async ({ title, description, teamId, teamName, createdBy, createdByName, assigneeIds, assigneeNames, priority, dueDate }) => {
      setError(null);
      const task = {
        id: `task-${nextId++}`,
        title,
        description,
        teamId,
        teamName,
        createdBy,
        createdByName,
        assigneeIds,
        assigneeNames,
        status: 'open',
        priority,
        dueDate,
        completedBy: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAllTasks((prev) => [...prev, task]);
      return task;
    },
    []
  );

  const markComplete = useCallback((taskId, uid) => {
    setAllTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const newCompleted = { ...task.completedBy, [uid]: new Date() };
        const allDone =
          Object.keys(newCompleted).length >= task.assigneeIds.length &&
          task.assigneeIds.length > 0;
        return {
          ...task,
          completedBy: newCompleted,
          status: allDone ? 'completed' : Object.keys(newCompleted).length > 0 ? 'inProgress' : task.status,
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const deleteTask = useCallback((taskId) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const clearTeamTasks = useCallback(() => setCurrentTeamId(null), []);
  const clearError = useCallback(() => setError(null), []);

  const value = {
    allTasks,
    userTasks,
    teamTasks,
    pendingTasks,
    completedTasks,
    todayCompletedCount,
    loading,
    error,
    loadUserTasks,
    loadTeamTasks,
    createTask,
    markComplete,
    deleteTask,
    clearTeamTasks,
    clearError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
