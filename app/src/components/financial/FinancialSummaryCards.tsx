import React from 'react';

interface FinancialSummaryProps {
    income: number;
    expenses: number;
    balance: number;
    pendingCount: number;
    overdueStudents?: number;
    pendingTeacherPayments?: number;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryProps> = ({
    income,
    expenses,
    balance,
    pendingCount,
    overdueStudents = 0,
    pendingTeacherPayments = 0,
}) => {
    const fmt = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="fin-kpi-grid">
            <div className="fin-kpi-card bezel-shell">
                <div className="bezel-core">
                    <div className="fin-kpi-label">Recebido no Mês</div>
                    <div className="fin-kpi-value good">{fmt(income)}</div>
                </div>
            </div>
            <div className="fin-kpi-card bezel-shell">
                <div className="bezel-core">
                    <div className="fin-kpi-label">Pago no Mês</div>
                    <div className="fin-kpi-value warn">{fmt(expenses)}</div>
                </div>
            </div>
            <div className="fin-kpi-card bezel-shell">
                <div className="bezel-core">
                    <div className="fin-kpi-label">Saldo do Mês</div>
                    <div className={`fin-kpi-value ${balance >= 0 ? 'good' : 'bad'}`}>{fmt(balance)}</div>
                </div>
            </div>
            <div className="fin-kpi-card bezel-shell">
                <div className="bezel-core">
                    <div className="fin-kpi-label">Pendentes (Mensalidades)</div>
                    <div className="fin-kpi-value warn">{fmt(pendingCount)}</div>
                </div>
            </div>
            <div className="fin-kpi-card bezel-shell">
                <div className="bezel-core">
                    <div className="fin-kpi-label">Alunos em Atraso</div>
                    <div className={`fin-kpi-value ${overdueStudents > 0 ? 'bad' : 'good'}`}>{overdueStudents}</div>
                </div>
            </div>
            <div className="fin-kpi-card bezel-shell">
                <div className="bezel-core">
                    <div className="fin-kpi-label">A Pagar (Professores)</div>
                    <div className="fin-kpi-value warn">{fmt(pendingTeacherPayments)}</div>
                </div>
            </div>
        </div>
    );
};
