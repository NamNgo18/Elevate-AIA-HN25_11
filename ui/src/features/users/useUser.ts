"use client";
import { useEffect, useState } from "react";
import { usersApi } from "./User.api";
import { User } from "./User.types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    setLoading(true);
    const data = await usersApi.list();
    setUsers(data);
    setLoading(false);
  }

  async function addUser(userData: User) {
    const newUser = await usersApi.create(userData);
    setUsers((prev) => [...prev, newUser]);
  }

  async function updateUser(id: number, updates: User) {
    const updated = await usersApi.update(id, updates);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  }

  async function deleteUser(id: number) {
    await usersApi.remove(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, addUser, updateUser, deleteUser };
}
