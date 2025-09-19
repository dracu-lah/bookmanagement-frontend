"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

import { AddBookModal, BookFormData } from "./components/AddBookModal";
import { EditBookModal } from "./components/EditBookModal";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import { Book, bookApi } from "@/services/api";

const BOOKS_PER_PAGE = 10;

const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch books
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: bookApi.getBooks,
  });

  // Get unique genres for filter dropdown
  const uniqueGenres = useMemo(() => {
    const genres = books.map((book) => book.genre).filter(Boolean);
    return [...new Set(genres)].sort();
  }, [books]);

  // Filter and search logic
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = genreFilter === "all" || book.genre === genreFilter;
      const matchesStatus =
        statusFilter === "all" || book.status === statusFilter;

      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [books, searchQuery, genreFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, genreFilter, statusFilter]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: bookApi.createBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Book, "id"> }) =>
      bookApi.updateBook(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: bookApi.deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
  });

  // Handlers
  const onAddSubmit = (data: BookFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => setIsAddModalOpen(false),
    });
  };

  const onEditSubmit = (data: BookFormData) => {
    if (!selectedBook) return;
    updateMutation.mutate(
      { id: selectedBook.id, data },
      {
        onSuccess: () => setIsEditModalOpen(false),
      },
    );
  };

  const handleDelete = () => {
    if (!selectedBook) return;
    deleteMutation.mutate(selectedBook.id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setGenreFilter("all");
    setStatusFilter("all");
  };

  const renderTableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Genre</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: BOOKS_PER_PAGE }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-20" />
            </TableCell>
            <TableCell className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      // Always show first page
      pages.push(1);

      // Add ellipsis if current page is far from start
      if (currentPage > 4) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add pages around current page
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      // Add ellipsis if current page is far from end
      if (currentPage < totalPages - 3) {
        pages.push(-2); // -2 represents second ellipsis
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    } else {
      // Show all pages if total pages <= 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === -1 || page === -2 ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Library Dashboard</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Book
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {uniqueGenres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery ||
              genreFilter !== "all" ||
              statusFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {currentBooks.length} of {filteredBooks.length} books
            {(searchQuery || genreFilter !== "all" || statusFilter !== "all") &&
              ` (filtered from ${books.length} total)`}
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Books</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            renderTableSkeleton()
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery || genreFilter !== "all" || statusFilter !== "all"
                  ? "No books match your search criteria."
                  : "No books found. Add your first book!"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">
                        {book.title}
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{book.genre}</Badge>
                      </TableCell>
                      <TableCell>{book.publishedYear}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            book.status === "Available"
                              ? "success"
                              : "destructive"
                          }
                          className={
                            book.status === "Available"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 dark:text-red-200 hover:bg-red-200"
                          }
                        >
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedBook(book);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setSelectedBook(book);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Book Modal */}
      <AddBookModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddSubmit}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Book Modal */}
      {selectedBook && (
        <EditBookModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={onEditSubmit}
          isSubmitting={updateMutation.isPending}
          initialValues={{
            title: selectedBook.title,
            author: selectedBook.author,
            genre: selectedBook.genre,
            publishedYear: selectedBook.publishedYear,
            status: selectedBook.status,
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        title="Delete Book"
        description={`Are you sure you want to delete "${selectedBook?.title}"?`}
      />
    </div>
  );
};

export default DashboardPage;
