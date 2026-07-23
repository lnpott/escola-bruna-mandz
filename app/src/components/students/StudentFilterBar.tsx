import React from 'react';

interface StudentFilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    studentCount: number;
}

const STATUS_ITEMS: { value: string; label: string }[] = [
    { value: '', label: 'Todos os status' },
    { value: 'lead', label: '📋 Lead (Primeiro Contato)' },
    { value: 'interested', label: '🔍 Interessado' },
    { value: 'enrolled', label: '📝 Matriculado' },
    { value: 'active', label: '✅ Ativo' },
    { value: 'suspended', label: '⏸️ Trancado' },
    { value: 'completed', label: '🎓 Concluído' },
    { value: 'cancelled', label: '❌ Cancelado' },
];

export const StudentFilterBar: React.FC<StudentFilterBarProps> = ({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    studentCount,
}) => {
    return (
        <div className="students-filters">
            <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
            />
            <select
                value={statusFilter}
                onChange={e => onStatusFilterChange(e.target.value)}
            >
                {STATUS_ITEMS.map(item => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
            <span className="students-count">{studentCount} aluno(s)</span>
        </div>
    );
};
