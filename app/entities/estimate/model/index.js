
export const estimateStatuses = [
    { value: 'draft', label: 'Черновик', color: '#6B7280', bg: '#F3F4F6' },
    { value: 'approved', label: 'Утверждена', color: '#16A34A', bg: '#E6FCEB' },
    { value: 'in_progress', label: 'В работе', color: '#4F46E5', bg: '#EEF2FF' }
];

export const getEstimateStatusStyle = (status) => {
    const s = estimateStatuses.find(st => st.value === status) || estimateStatuses[0];
    return { color: s.color, bg: s.bg, label: s.label };
};

export const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Не указана';
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
