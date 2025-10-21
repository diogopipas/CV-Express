import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.blur(); // Remove focus to prevent scroll
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always maintain consistent width by showing exactly 7 elements
      // Format: [1] [ellipsis/2] [pages] [pages] [pages] [ellipsis/last-1] [last]
      
      pages.push(1);

      if (currentPage <= 3) {
        // Near start: 1 2 3 4 ... last-1 last
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-end');
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1 2 ... last-3 last-2 last-1 last
        pages.push(2);
        pages.push('ellipsis-start');
        for (let i = totalPages - 3; i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // Middle: 1 ... current-1 current current+1 ... last
        pages.push('ellipsis-start');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis-end');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => handlePageChange(currentPage - 1, e)}
        disabled={currentPage === 1}
        className="h-9 w-9 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) => {
        if (typeof page === 'string') {
          return (
            <Button
              type="button"
              key={`${page}-${index}`}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        return (
          <Button
            type="button"
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={(e) => handlePageChange(page, e)}
            className={`h-9 w-9 p-0 ${
              currentPage === page
                ? 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600'
                : ''
            }`}
          >
            {page}
          </Button>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => handlePageChange(currentPage + 1, e)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

