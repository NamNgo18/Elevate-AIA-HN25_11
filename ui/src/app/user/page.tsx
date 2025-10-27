"use client";

import { useUsers } from "@/features/users/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Plus } from "lucide-react";
import { randomInt } from "crypto";

const UserPage = () => {
  const { users, loading, addUser, deleteUser } = useUsers();

  if (loading)
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="text-muted-foreground mr-2 h-6 w-6 animate-spin" />
        <p>Loading users...</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Button
            onClick={() => {
              const id = Math.floor(Math.random() * 100);
              addUser({ id: id, name: `New User${id}`, email: "new@user.com" });
            }}
            size="sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>

        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">No users found.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span className="text-sm">{u.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteUser(u.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage;
