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
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100/80">
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  className={`px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest ${col.sortable ? 'cursor-pointer select-none hover:text-blue-600 transition-colors' : ''}`}
                  onClick={() => col.sortable && onSort && onSort(String(col.key))}
                >
                  <div className="flex items-center justify-center gap-1">
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
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold uppercase tracking-widest text-[10px]">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px] bg-gray-50/10">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-300 group">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-5 text-sm text-gray-600 font-medium">
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
