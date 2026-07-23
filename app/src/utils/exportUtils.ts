/**
 * Export utilities for generating CSV files and formatted printing
 */

/**
 * Downloads a array of objects as a CSV file with BOM UTF-8 (Excel compatible)
 */
export function exportToCSV<T extends Record<string, unknown>>(
    filename: string,
    headers: { key: keyof T; label: string }[],
    data: T[]
): void {
    if (!data || data.length === 0) return;

    // Add UTF-8 BOM for proper Excel encoding
    const BOM = '\uFEFF';
    
    // Header row
    const headerRow = headers.map(h => `"${String(h.label).replace(/"/g, '""')}"`).join(',');

    // Data rows
    const dataRows = data.map(item => {
        return headers
            .map(h => {
                const val = item[h.key];
                if (val === null || val === undefined) return '""';
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            })
            .join(',');
    });

    const csvContent = BOM + [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Triggers native browser print formatted for reports
 */
export function printReport(): void {
    window.print();
}
