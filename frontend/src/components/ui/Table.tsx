import { Component } from 'react';
import type { ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  entriesPerPage: number;
  onPageChange: (page: number) => void;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  getSortIcon?: (key: string) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationProps;
  topContent?: ReactNode;
}

export class Table<T> extends Component<TableProps<T>> {
  render() {
    const { columns, data, onSort, sortKey, sortDirection, getSortIcon, loading, emptyMessage = 'Data tidak ditemukan', pagination, topContent } = this.props;

    const getPageNumbers = () => {
      if (!pagination) return [];
      const pages = [];
      const maxPagesToShow = 5;
      const { currentPage, totalPages } = pagination;
      
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {topContent && (
          <div className="p-6 border-b border-gray-100">
            {topContent}
          </div>
        )}
        <div className="p-6 overflow-x-auto">
          <div className="min-w-full rounded-xl overflow-hidden ring-1 ring-gray-200">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-200">
                  {columns.map((col) => {
                    const isActive = sortKey === String(col.key);
                    return (
                      <th 
                        key={String(col.key)} 
                        style={{ width: col.width }}
                        className={`px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:bg-gray-100 transition-colors' : ''}`}
                        onClick={() => col.sortable && onSort && onSort(String(col.key))}
                      >
                        <div className="flex items-center gap-2 justify-between">
                          {col.header}
                          {col.sortable && (getSortIcon ? getSortIcon(String(col.key)) : (
                            <div className={`flex items-center ml-2 text-[12px] font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                              {isActive && sortDirection === 'asc' ? '↑' : isActive && sortDirection === 'desc' ? '↓' : '⇅'}
                            </div>
                          ))}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex justify-center items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-20 text-center text-gray-500 font-medium text-sm bg-gray-50/30">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors bg-white">
                      {columns.map((col) => (
                        <td key={String(col.key)} className="px-6 py-5 text-sm text-gray-700">
                          {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] || '')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {pagination && !loading && (
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium">
              Menampilkan {data.length} dari {pagination.totalEntries} entri
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              
              {getPageNumbers().map((pageNum) => (
                <button 
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    pagination.currentPage === pageNum 
                      ? 'bg-[#1E3A8A] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button 
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
