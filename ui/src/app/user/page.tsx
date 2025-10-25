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
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6 mr-2" />
        <p>Loading users...</p>
      </div>
    );

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Button
            onClick={() => {
              const id = Math.floor(Math.random() * 100);
              addUser({id: id, name: `New User${id}`, email: "new@user.com" })
            }}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </Button>
        </CardHeader>

        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
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
                    <Trash2 className="w-4 h-4" />
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
