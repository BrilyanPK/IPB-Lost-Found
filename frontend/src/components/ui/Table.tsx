import { Component } from 'react';
import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onSort?: (key: string) => void;
  getSortIcon?: (key: string) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export class Table<T> extends Component<TableProps<T>> {
  render() {
    const { columns, data, onSort, getSortIcon, loading, emptyMessage = 'Data tidak ditemukan' } = this.props;

    return (
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100/80">
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  className={`px-6 py-4 text-sm font-bold text-gray-700 tracking-wide ${col.sortable ? 'cursor-pointer select-none hover:text-blue-600 transition-colors' : ''}`}
                  onClick={() => col.sortable && onSort && onSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && getSortIcon && getSortIcon(String(col.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/30">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors group">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-600">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
}
