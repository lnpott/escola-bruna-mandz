import React from 'react';

interface FinancialSummaryProps {
    income: number;
    expenses: number;
    balance: number;
    pendingCount: number;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryProps> = ({
    income,
    expenses,
    balance,
    pendingCount,
}) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="financial-kpi-grid">
            <div className="kpi-card kpi-income">
                <span className="kpi-title">Receitas do Mês</span>
                <span className="kpi-value positive">{formatCurrency(income)}</span>
            </div>
            <div className="kpi-card kpi-expense">
                <span className="kpi-title">Despesas do Mês</span>
                <span className="kpi-value negative">{formatCurrency(expenses)}</span>
            </div>
            <div className="kpi-card kpi-balance">
                <span className="kpi-title">Saldo Estimado</span>
                <span className={`kpi-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(balance)}
                </span>
            </div>
            <div className="kpi-card kpi-pending">
                <span className="kpi-title">Mensalidades Pendentes</span>
                <span className="kpi-value warning">{pendingCount}</span>
            </div>
        </div>
    );
};
