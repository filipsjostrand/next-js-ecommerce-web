"use client"; // Viktigt! Detta gör att vi kan använda onClick och confirm

import { deleteProduct } from "@/lib/actions/product";

interface DeleteProductButtonProps {
  productId: string;
}

export default function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const handleDelete = async () => {
    const isConfirmed = confirm("Är du säker på att du vill ta bort produkten? Detta går inte att ångra.");

    if (isConfirmed) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        alert("Något gick fel vid radering.");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700 font-medium"
    >
      Delete
    </button>
  );
}