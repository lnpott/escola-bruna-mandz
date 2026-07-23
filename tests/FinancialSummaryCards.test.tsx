/**
 * tests/FinancialSummaryCards.test.tsx
 *
 * Testes unitários para o componente FinancialSummaryCards.
 * Verifica: renderização dos 6 KPIs, formatação monetária, cores condicionais.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinancialSummaryCards } from '../app/src/components/financial/FinancialSummaryCards';

describe('FinancialSummaryCards', () => {
    const defaultProps = {
        income: 5000,
        expenses: 3000,
        balance: 2000,
        pendingCount: 1500,
        overdueStudents: 3,
        pendingTeacherPayments: 1200,
    };

    it('renderiza todos os 6 KPIs com labels corretos', () => {
        render(<FinancialSummaryCards {...defaultProps} />);

        expect(screen.getByText('Recebido no Mês')).toBeInTheDocument();
        expect(screen.getByText('Pago no Mês')).toBeInTheDocument();
        expect(screen.getByText('Saldo do Mês')).toBeInTheDocument();
        expect(screen.getByText('Pendentes (Mensalidades)')).toBeInTheDocument();
        expect(screen.getByText('Alunos em Atraso')).toBeInTheDocument();
        expect(screen.getByText('A Pagar (Professores)')).toBeInTheDocument();
    });

    it('formata valores monetários em pt-BR', () => {
        render(<FinancialSummaryCards {...defaultProps} />);

        expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument();
    });

    it('exibe contagem de alunos em atraso como número puro (sem moeda)', () => {
        render(<FinancialSummaryCards {...defaultProps} />);

        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('aplica classe good para saldo positivo', () => {
        render(<FinancialSummaryCards {...defaultProps} />);

        const balanceValue = screen.getByText('R$ 2.000,00');
        expect(balanceValue.className).toContain('good');
    });

    it('aplica classe bad para saldo negativo', () => {
        render(<FinancialSummaryCards
            income={1000}
            expenses={2000}
            balance={-1000}
            pendingCount={500}
        />);

        const balanceValue = screen.getByText('-R$ 1.000,00');
        expect(balanceValue.className).toContain('bad');
    });

    it('aplica classe good para overdueStudents = 0', () => {
        render(<FinancialSummaryCards
            income={5000}
            expenses={3000}
            balance={2000}
            pendingCount={1500}
            overdueStudents={0}
        />);

        const overdueValue = screen.getByText('0');
        expect(overdueValue.className).toContain('good');
    });

    it('aplica classe bad para overdueStudents > 0', () => {
        render(<FinancialSummaryCards {...defaultProps} />);

        // A cor do "A Pagar" fica classificada por warning standard
        const incomeValue = screen.getByText('R$ 5.000,00');
        expect(incomeValue.className).toContain('good');
    });

    it('renderiza sem overdueStudents e pendingTeacherPayments (opcionais)', () => {
        render(<FinancialSummaryCards
            income={5000}
            expenses={3000}
            balance={2000}
            pendingCount={1500}
        />);

        expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument(); // overdueStudents default = 0
        expect(screen.getByText('R$ 0,00')).toBeInTheDocument(); // pendingTeacherPayments default = 0
    });

    it('aplica classes CSS corretas nos cards (fin-kpi-*)', () => {
        const { container } = render(<FinancialSummaryCards {...defaultProps} />);

        const grid = container.firstChild;
        expect(grid.className).toContain('fin-kpi-grid');

        const cards = container.querySelectorAll('.fin-kpi-card');
        expect(cards.length).toBe(6);

        const labels = container.querySelectorAll('.fin-kpi-label');
        expect(labels.length).toBe(6);

        const values = container.querySelectorAll('.fin-kpi-value');
        expect(values.length).toBe(6);
    });
});
