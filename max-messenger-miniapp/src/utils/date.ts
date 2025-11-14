export const formatDate = (dateString?: string): string | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};

