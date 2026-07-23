import React from 'react';

interface StudentFilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    onExportCSV?: () => void;
    onNewStudent?: () => void;
}

export const StudentFilterBar: React.FC<StudentFilterBarProps> = ({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onExportCSV,
    onNewStudent,
}) => {
    return (
        <div className="student-filter-bar">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Buscar aluno por nome, CPF, e-mail..."
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    className="form-input"
                />
            </div>
            <div className="filter-actions">
                <select
                    value={statusFilter}
                    onChange={e => onStatusFilterChange(e.target.value)}
                    className="form-select"
                >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                </select>
                {onExportCSV && (
                    <button type="button" onClick={onExportCSV} className="btn-secondary">
                        📥 Exportar CSV
                    </button>
                )}
                {onNewStudent && (
                    <button type="button" onClick={onNewStudent} className="btn-primary">
                        + Novo Aluno
                    </button>
                )}
            </div>
        </div>
    );
};
