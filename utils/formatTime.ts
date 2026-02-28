export function formatMessageTime(timestamp: number): string {
  const messageDate = new Date(timestamp);
  const now = new Date();

  const isToday =
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  const isSameYear = messageDate.getFullYear() === now.getFullYear();

  if (isToday) {
    // Show time only → 2:34 PM
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isSameYear) {
    // Show date + time → Feb 15, 2:34 PM
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }) + ", " + messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // Different year → Feb 15 2023, 2:34 PM
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + ", " + messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}