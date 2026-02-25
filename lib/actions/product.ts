"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// SKAPA PRODUKT
export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const imageUrl = formData.get("imageUrl") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!name || !description || !categoryId) {
    throw new Error("Namn, beskrivning och kategori krävs.");
  }

  await db.product.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      description,
      price,
      stock,
      imageUrl,
      categoryId,
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// UPPDATERA PRODUKT (NY!)
export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const imageUrl = formData.get("imageUrl") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!id || !name || !description || !categoryId) {
    throw new Error("ID, namn, beskrivning och kategori krävs.");
  }

  await db.product.update({
    where: { id },
    data: {
      name,
      slug: name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      description,
      price,
      stock,
      imageUrl,
      categoryId,
    },
  });

  // Uppdatera cachen för både listan och den specifika produktsidan
  revalidatePath("/admin/products");
  revalidatePath(`/product/${name.toLowerCase().replace(/ /g, "-")}`);

  redirect("/admin/products");
}

// TA BORT PRODUKT
export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}