/**
 * tests/StudentFilterBar.test.tsx
 *
 * Testes unitários para o componente StudentFilterBar.
 * Verifica: input de busca, select de status com 7 opções, contagem, callbacks.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentFilterBar } from '../app/src/components/students/StudentFilterBar';

describe('StudentFilterBar', () => {
    const defaultProps = {
        searchQuery: '',
        onSearchChange: vi.fn(),
        statusFilter: '',
        onStatusFilterChange: vi.fn(),
        studentCount: 42,
    };

    it('renderiza input de busca com placeholder correto', () => {
        render(<StudentFilterBar {...defaultProps} />);

        const input = screen.getByPlaceholderText('Buscar por nome, e-mail ou telefone...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('');
    });

    it('renderiza select de status com 8 opções (Todos + 7 status)', () => {
        render(<StudentFilterBar {...defaultProps} />);

        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();

        const options = screen.getAllByRole('option');
        expect(options.length).toBe(8);

        expect(screen.getByText('Todos os status')).toBeInTheDocument();
        expect(screen.getByText('📋 Lead (Primeiro Contato)')).toBeInTheDocument();
        expect(screen.getByText('🔍 Interessado')).toBeInTheDocument();
        expect(screen.getByText('📝 Matriculado')).toBeInTheDocument();
        expect(screen.getByText('✅ Ativo')).toBeInTheDocument();
        expect(screen.getByText('⏸️ Trancado')).toBeInTheDocument();
        expect(screen.getByText('🎓 Concluído')).toBeInTheDocument();
        expect(screen.getByText('❌ Cancelado')).toBeInTheDocument();
    });

    it('exibe contagem de alunos formatada', () => {
        render(<StudentFilterBar {...defaultProps} />);

        expect(screen.getByText('42 aluno(s)')).toBeInTheDocument();
    });

    it('exibe contagem zero quando não há alunos', () => {
        render(<StudentFilterBar {...defaultProps} studentCount={0} />);

        expect(screen.getByText('0 aluno(s)')).toBeInTheDocument();
    });

    it('chama onSearchChange ao digitar no input', async () => {
        const onSearchChange = vi.fn();
        const user = userEvent.setup();

        render(<StudentFilterBar {...defaultProps} onSearchChange={onSearchChange} />);

        const input = screen.getByPlaceholderText('Buscar por nome, e-mail ou telefone...');
        await user.type(input, 'João');

        // userEvent.type dispara eventos para cada caractere
        expect(onSearchChange).toHaveBeenCalledTimes(4);
        expect(onSearchChange).toHaveBeenCalledWith('J');
        expect(onSearchChange).toHaveBeenCalledWith('o');
        expect(onSearchChange).toHaveBeenCalledWith('ã');
        expect(onSearchChange).toHaveBeenCalledWith('o');
    });

    it('chama onStatusFilterChange ao selecionar um status', async () => {
        const onStatusFilterChange = vi.fn();
        const user = userEvent.setup();

        render(<StudentFilterBar {...defaultProps} onStatusFilterChange={onStatusFilterChange} />);

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'active');

        expect(onStatusFilterChange).toHaveBeenCalledTimes(1);
        expect(onStatusFilterChange).toHaveBeenCalledWith('active');
    });

    it('chama onStatusFilterChange com string vazia para "Todos"', async () => {
        const onStatusFilterChange = vi.fn();
        const user = userEvent.setup();

        render(<StudentFilterBar {...defaultProps} onStatusFilterChange={onStatusFilterChange} statusFilter="active" />);

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, '');

        expect(onStatusFilterChange).toHaveBeenCalledWith('');
    });

    it('reflete o valor atual da busca via props', () => {
        render(<StudentFilterBar {...defaultProps} searchQuery="Maria" />);

        const input = screen.getByPlaceholderText('Buscar por nome, e-mail ou telefone...');
        expect(input).toHaveValue('Maria');
    });

    it('reflete o valor atual do filtro de status via props', () => {
        render(<StudentFilterBar {...defaultProps} statusFilter="cancelled" />);

        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('cancelled');
    });

    it('usa a classe CSS students-filters no container', () => {
        const { container } = render(<StudentFilterBar {...defaultProps} />);

        expect(container.firstChild.className).toContain('students-filters');
    });
});
