export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  taskId: string;
  createdAt: string;
  isRead: boolean;
}

export async function getNotifications(workspaceId?: string): Promise<NotificationDto[]> {
  return [
    {
      id: "n-1",
      type: "assigned",
      title: "Assigned to Setup PostgreSQL tasks schema",
      taskId: "1",
      createdAt: new Date().toISOString(),
      isRead: false,
    },
    {
      id: "n-2",
      type: "comment",
      title: "New comment on API Authentication and scoping",
      taskId: "2",
      createdAt: new Date().toISOString(),
      isRead: false,
    },
  ];
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  return true;
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  return true;
}
