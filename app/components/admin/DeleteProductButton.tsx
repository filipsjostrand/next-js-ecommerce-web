"use client";

import { useState } from "react";
import { deleteProduct } from "@/lib/actions/product";
import { Trash2 } from "lucide-react"; // Om du vill ha en ikon

interface DeleteProductButtonProps {
  productId: string;
}

export default function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Standard confirm fungerar, men vi kör den på engelska
    const isConfirmed = confirm("Are you sure you want to delete this product? This action cannot be undone.");

    if (isConfirmed) {
      try {
        setIsDeleting(true);
        await deleteProduct(productId);
        // Här behövs oftast ingen alert vid framgång då
        // Server Action brukar köra revalidatePath som uppdaterar listan
      } catch (error) {
        alert("Something went wrong while deleting the product.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors cursor-pointer"
    >
      <Trash2 size={16} />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}