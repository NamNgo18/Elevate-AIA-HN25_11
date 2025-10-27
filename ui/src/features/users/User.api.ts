import apiClient from "@/lib/api-client";

import { User } from "./User.types";

export const usersApi = {
  async list(): Promise<User[]> {
    const res = await apiClient.get("/users");
    return res.data;
  },
  async create(data: User): Promise<User> {
    const res = await apiClient.post("/users", data);
    return res.data;
  },
  async update(id: number, data: User): Promise<User> {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
