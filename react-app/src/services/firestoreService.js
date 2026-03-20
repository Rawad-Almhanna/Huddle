import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  deleteField,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// Teams

export function watchUserTeams(uid, callback) {
  const q = query(
    collection(db, 'teams'),
    where('memberIds', 'array-contains', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function createTeam({ name, description, leaderId, leaderName }) {
  const inviteCode = generateInviteCode();
  const data = {
    name,
    description,
    leaderId,
    leaderName,
    memberIds: [leaderId],
    memberNames: { [leaderId]: leaderName },
    inviteCode,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'teams'), data);
  return { id: docRef.id, ...data };
}

export async function joinTeamByCode(code, uid, userName) {
  const q = query(
    collection(db, 'teams'),
    where('inviteCode', '==', code.toUpperCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  const team = { id: docSnap.id, ...docSnap.data() };
  if (team.memberIds.includes(uid)) return team;

  await updateDoc(docSnap.ref, {
    memberIds: arrayUnion(uid),
    [`memberNames.${uid}`]: userName,
  });

  return {
    ...team,
    memberIds: [...team.memberIds, uid],
    memberNames: { ...team.memberNames, [uid]: userName },
  };
}

export async function leaveTeam(teamId, uid) {
  await updateDoc(doc(db, 'teams', teamId), {
    memberIds: arrayRemove(uid),
    [`memberNames.${uid}`]: deleteField(),
  });
}

export async function getTeam(teamId) {
  const d = await getDoc(doc(db, 'teams', teamId));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() };
}

// Tasks

export function watchTeamTasks(teamId, callback) {
  const q = query(
    collection(db, 'tasks'),
    where('teamId', '==', teamId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function watchUserTasks(uid, callback) {
  const q = query(
    collection(db, 'tasks'),
    where('assigneeIds', 'array-contains', uid),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function createTask({
  title,
  description,
  teamId,
  teamName,
  createdBy,
  createdByName,
  assigneeIds,
  assigneeNames,
  priority,
  dueDate,
}) {
  const now = Timestamp.now();
  const data = {
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
    dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
    completedBy: {},
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await addDoc(collection(db, 'tasks'), data);
  return { id: docRef.id, ...data };
}

export async function markTaskCompleted(taskId, uid) {
  const now = Timestamp.now();
  await updateDoc(doc(db, 'tasks', taskId), {
    [`completedBy.${uid}`]: now,
    updatedAt: now,
  });

  const d = await getDoc(doc(db, 'tasks', taskId));
  const task = d.data();
  const completedCount = Object.keys(task.completedBy || {}).length;

  if (completedCount >= (task.assigneeIds || []).length && task.assigneeIds?.length > 0) {
    await updateDoc(doc(db, 'tasks', taskId), { status: 'completed' });
  } else if (completedCount > 0) {
    await updateDoc(doc(db, 'tasks', taskId), { status: 'inProgress' });
  }
}

export async function updateTaskStatus(taskId, status) {
  await updateDoc(doc(db, 'tasks', taskId), {
    status,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, 'tasks', taskId));
}

// Streaks

export async function updateStreak(uid) {
  const userRef = doc(db, 'users', uid);
  const d = await getDoc(userRef);
  if (!d.exists()) return;

  const user = d.data();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (user.lastCompletionDate) {
    const lastDate = user.lastCompletionDate.toDate();
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

    if (lastDay.getTime() === today.getTime()) return;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDay.getTime() === yesterday.getTime()) {
      const newStreak = (user.currentStreak || 0) + 1;
      await updateDoc(userRef, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak || 0),
        lastCompletionDate: Timestamp.now(),
        totalTasksCompleted: increment(1),
      });
    } else {
      await updateDoc(userRef, {
        currentStreak: 1,
        lastCompletionDate: Timestamp.now(),
        totalTasksCompleted: increment(1),
      });
    }
  } else {
    await updateDoc(userRef, {
      currentStreak: 1,
      longestStreak: Math.max(1, user.longestStreak || 0),
      lastCompletionDate: Timestamp.now(),
      totalTasksCompleted: increment(1),
    });
  }
}

export function watchUserProfile(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), (d) => {
    if (!d.exists()) return callback(null);
    callback({ uid: d.id, ...d.data() });
  });
}
