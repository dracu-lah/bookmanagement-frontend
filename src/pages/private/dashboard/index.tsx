"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AddBookModal, BookFormData } from "./components/AddBookModal";
import { EditBookModal } from "./components/EditBookModal";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import { Book, bookApi } from "@/services/api";

const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Fetch books
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: bookApi.getBooks,
  });

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Library Dashboard</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Book
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Books</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading books...</p>
          ) : (
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
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.genre}</TableCell>
                    <TableCell>{book.publishedYear}</TableCell>
                    <TableCell>{book.status}</TableCell>
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
