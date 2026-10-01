import prisma from "@/lib/db";
import { MenuCategory, PortionType } from "@/types";

export interface CreateMenuItemInput {
  nameNepali: string;
  nameEnglish: string;
  category: MenuCategory | string;
  portion?: PortionType | string;
  price: number;
  description?: string | null;
  comboItems?: string[] | null;
}

export const INITIAL_CATEGORIES = [
  { name: "CHICKEN", label: "🍗 चिकन (Chicken)", icon: "🍗", sortOrder: 1 },
  { name: "MUTTON", label: "🍖 मटन (Mutton)", icon: "🍖", sortOrder: 2 },
  { name: "VEG", label: "🥗 भेज (Veg)", icon: "🥗", sortOrder: 3 },
  { name: "COMBO", label: "🍱 कम्बो (Combo)", icon: "🍱", sortOrder: 4 },
  { name: "MOMO", label: "🥟 म:म: (Momo)", icon: "🥟", sortOrder: 5 },
  { name: "RICE", label: "🍚 राइस (Rice)", icon: "🍚", sortOrder: 6 },
  { name: "SNACKS", label: "🍳 नास्ता (Snacks)", icon: "🍳", sortOrder: 7 },
  { name: "BEVERAGE", label: "☕ Soft पेय (Drinks)", icon: "☕", sortOrder: 8 },
  { name: "HOOKAH", label: "💨 हुक्का (Hookah & Smoke)", icon: "💨", sortOrder: 9 },
  { name: "BAR", label: "🍺 बार र पेय (Hard Drinks)", icon: "🍺", sortOrder: 10 },
];

export async function getCategories() {
  const existing = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  if (existing.length === 0) {
    // Seed initial categories
    for (const cat of INITIAL_CATEGORIES) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }
    return await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    });
  }

  return existing;
}

export async function createCategory(input: {
  name: string;
  label: string;
  icon?: string;
}) {
  const cleanName = input.name.trim().toUpperCase().replace(/\s+/g, "_");
  const existing = await prisma.category.findUnique({
    where: { name: cleanName },
  });

  if (existing) {
    throw new Error(`Category "${cleanName}" already exists`);
  }

  const count = await prisma.category.count();

  return await prisma.category.create({
    data: {
      name: cleanName,
      label: input.label.trim(),
      icon: input.icon?.trim() || "🍽️",
      sortOrder: count + 1,
    },
  });
}

export async function deleteCategory(id: string) {
  // Check if any menu items belong to this category
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Category not found");

  const itemsCount = await prisma.menuItem.count({
    where: { category: category.name },
  });

  if (itemsCount > 0) {
    throw new Error(
      `Cannot delete category "${category.label}" because ${itemsCount} menu items belong to it. Please reassign or remove those items first.`
    );
  }

  return await prisma.category.delete({ where: { id } });
}

export async function getMenuItems(category?: string, search?: string) {
  const where: any = {};
  if (category && category !== "ALL") {
    where.category = category;
  }
  if (search && search.trim() !== "") {
    const q = search.trim().toLowerCase();
    where.OR = [
      { nameEnglish: { contains: q } },
      { nameNepali: { contains: q } },
    ];
  }

  return await prisma.menuItem.findMany({
    where,
    orderBy: [{ category: "asc" }, { price: "asc" }],
  });
}

export async function createMenuItem(input: CreateMenuItemInput) {
  return await prisma.menuItem.create({
    data: {
      nameNepali: input.nameNepali,
      nameEnglish: input.nameEnglish,
      category: input.category,
      portion: input.portion || "REGULAR",
      price: input.price,
      description: input.description || null,
      comboItems: input.comboItems ? JSON.stringify(input.comboItems) : null,
    },
  });
}

export async function updateMenuItem(
  id: string,
  input: {
    nameNepali?: string;
    nameEnglish?: string;
    category?: string;
    portion?: string;
    price?: number;
    description?: string | null;
    comboItems?: string[] | null;
    isAvailable?: boolean;
  }
) {
  const data: any = {};
  if (input.nameNepali !== undefined) data.nameNepali = input.nameNepali;
  if (input.nameEnglish !== undefined) data.nameEnglish = input.nameEnglish;
  if (input.category !== undefined) data.category = input.category;
  if (input.portion !== undefined) data.portion = input.portion;
  if (input.price !== undefined) data.price = input.price;
  if (input.description !== undefined) data.description = input.description;
  if (input.comboItems !== undefined) {
    data.comboItems = input.comboItems ? JSON.stringify(input.comboItems) : null;
  }
  if (input.isAvailable !== undefined) data.isAvailable = input.isAvailable;

  return await prisma.menuItem.update({
    where: { id },
    data,
  });
}

export async function deleteMenuItem(id: string) {
  return await prisma.menuItem.delete({ where: { id } });
}

export async function toggleMenuItemAvailability(id: string) {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) throw new Error("Menu item not found");
  return await prisma.menuItem.update({
    where: { id },
    data: { isAvailable: !item.isAvailable },
  });
}
