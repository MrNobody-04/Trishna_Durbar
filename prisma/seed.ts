import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Trishna Durbar database...");

  // 1. Seed Owner and Manager Accounts
  const ownerPasswordHash = await bcrypt.hash("DurbarOwner@2026", 10);
  const managerPasswordHash = await bcrypt.hash("DurbarManager@2026", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@trishnadurbar.com" },
    update: { passwordHash: ownerPasswordHash, role: "OWNER", isActive: true },
    create: {
      name: "Durbar Owner",
      email: "owner@trishnadurbar.com",
      passwordHash: ownerPasswordHash,
      role: "OWNER",
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@trishnadurbar.com" },
    update: { passwordHash: managerPasswordHash, role: "MANAGER", isActive: true },
    create: {
      name: "Durbar Manager",
      email: "manager@trishnadurbar.com",
      passwordHash: managerPasswordHash,
      role: "MANAGER",
      isActive: true,
    },
  });

  console.log("Created users:", owner.email, manager.email);

  // 2. Seed 9 Tables Across 4 Zones
  const tables = [
    // Hall: 3 Tables
    { name: "Table 1", floor: "HALL", capacity: 4, notes: "Main dining hall near entrance" },
    { name: "Table 2", floor: "HALL", capacity: 4, notes: "Main dining hall central" },
    { name: "Table 3", floor: "HALL", capacity: 6, notes: "Main dining hall family table" },

    // First Floor: 1 Table
    { name: "Table 4", floor: "FIRST_FLOOR", capacity: 8, notes: "First floor royal VIP lounge table" },

    // Rooftop: 2 Tables
    { name: "Table 5", floor: "ROOFTOP", capacity: 4, notes: "Rooftop terrace with panoramic view" },
    { name: "Table 6", floor: "ROOFTOP", capacity: 4, notes: "Rooftop garden lounge table" },

    // Ground Floor: 3 Tables
    { name: "Table 7", floor: "GROUND", capacity: 4, notes: "Ground floor garden corner" },
    { name: "Table 8", floor: "GROUND", capacity: 4, notes: "Ground floor front patio" },
    { name: "Table 9", floor: "GROUND", capacity: 6, notes: "Ground floor family booth" },
  ];

  for (const tableData of tables) {
    await prisma.diningTable.upsert({
      where: { name: tableData.name },
      update: { floor: tableData.floor, capacity: tableData.capacity, notes: tableData.notes },
      create: {
        name: tableData.name,
        floor: tableData.floor,
        capacity: tableData.capacity,
        notes: tableData.notes,
        status: "AVAILABLE",
      },
    });
  }
  console.log(`Seeded ${tables.length} tables across Ground, Hall, First Floor, Rooftop.`);

  // 3. Seed Menu Items transcribed from photos
  const menuItems = [
    // --- CHICKEN ITEMS ---
    { nameNepali: "चिकन रोष्ट", nameEnglish: "Chicken Roast (Half)", category: "CHICKEN", portion: "HALF", price: 150 },
    { nameNepali: "चिकन रोष्ट", nameEnglish: "Chicken Roast (Full)", category: "CHICKEN", portion: "FULL", price: 250 },
    { nameNepali: "चिकन चिल्ली", nameEnglish: "Chicken Chilli (Half)", category: "CHICKEN", portion: "HALF", price: 200 },
    { nameNepali: "चिकन चिल्ली", nameEnglish: "Chicken Chilli (Full)", category: "CHICKEN", portion: "FULL", price: 350 },
    { nameNepali: "चिकन बोइल", nameEnglish: "Chicken Boil (Half)", category: "CHICKEN", portion: "HALF", price: 150 },
    { nameNepali: "चिकन बोइल", nameEnglish: "Chicken Boil (Full)", category: "CHICKEN", portion: "FULL", price: 250 },
    { nameNepali: "चिकन साधेको", nameEnglish: "Chicken Sadeko (Half)", category: "CHICKEN", portion: "HALF", price: 200 },
    { nameNepali: "चिकन साधेको", nameEnglish: "Chicken Sadeko (Full)", category: "CHICKEN", portion: "FULL", price: 300 },
    { nameNepali: "चिकन सेकुवा", nameEnglish: "Chicken Sekuwa (Half)", category: "CHICKEN", portion: "HALF", price: 300 },
    { nameNepali: "चिकन सेकुवा", nameEnglish: "Chicken Sekuwa (Full)", category: "CHICKEN", portion: "FULL", price: 350 },
    { nameNepali: "चिकन भुजा/चिउरा", nameEnglish: "Chicken Bhuja/Chiura (Half)", category: "CHICKEN", portion: "HALF", price: 200 },
    { nameNepali: "चिकन भुजा/चिउरा", nameEnglish: "Chicken Bhuja/Chiura (Full)", category: "CHICKEN", portion: "FULL", price: 350 },

    // --- MUTTON & MEAT ITEMS ---
    { nameNepali: "मटन ग्रेवी", nameEnglish: "Mutton Gravy (Half)", category: "MUTTON", portion: "HALF", price: 250 },
    { nameNepali: "मटन ग्रेवी", nameEnglish: "Mutton Gravy (Full)", category: "MUTTON", portion: "FULL", price: 350 },
    { nameNepali: "मटन फ्राई", nameEnglish: "Mutton Fry (Half)", category: "MUTTON", portion: "HALF", price: 300 },
    { nameNepali: "मटन फ्राई", nameEnglish: "Mutton Fry (Full)", category: "MUTTON", portion: "FULL", price: 450 },
    { nameNepali: "मटन सेकुवा", nameEnglish: "Mutton Sekuwa (Half)", category: "MUTTON", portion: "HALF", price: 200 },
    { nameNepali: "मटन सेकुवा", nameEnglish: "Mutton Sekuwa (Full)", category: "MUTTON", portion: "FULL", price: 400 },
    { nameNepali: "कटनेसी", nameEnglish: "Katnesi (Half)", category: "MUTTON", portion: "HALF", price: 300 },
    { nameNepali: "कटनेसी", nameEnglish: "Katnesi (Full)", category: "MUTTON", portion: "FULL", price: 500 },
    { nameNepali: "भुटन", nameEnglish: "Bhutan (Half)", category: "MUTTON", portion: "HALF", price: 200 },
    { nameNepali: "भुटन", nameEnglish: "Bhutan (Full)", category: "MUTTON", portion: "FULL", price: 350 },
    { nameNepali: "मटन मासु - चिउरा/भुजा", nameEnglish: "Mutton Masu Chiura/Bhuja (Half)", category: "MUTTON", portion: "HALF", price: 250 },
    { nameNepali: "मटन मासु - चिउरा/भुजा", nameEnglish: "Mutton Masu Chiura/Bhuja (Full)", category: "MUTTON", portion: "FULL", price: 350 },
    { nameNepali: "बफ सुकुटी", nameEnglish: "Buff Sukuti (Half)", category: "MUTTON", portion: "HALF", price: 180 },
    { nameNepali: "बफ सुकुटी", nameEnglish: "Buff Sukuti (Full)", category: "MUTTON", portion: "FULL", price: 320 },
    { nameNepali: "ससेज बोइल", nameEnglish: "Sausage Boiled", category: "MUTTON", portion: "REGULAR", price: 120 },
    { nameNepali: "ससेज फ्राई", nameEnglish: "Sausage Fried", category: "MUTTON", portion: "REGULAR", price: 150 },

    // --- VEG ITEMS ---
    { nameNepali: "फ्रेन्च फ्राई", nameEnglish: "French Fries (Half)", category: "VEG", portion: "HALF", price: 100 },
    { nameNepali: "फ्रेन्च फ्राई", nameEnglish: "French Fries (Full)", category: "VEG", portion: "FULL", price: 180 },
    { nameNepali: "चिल्ली पोटेटो", nameEnglish: "Chilli Potato (Half)", category: "VEG", portion: "HALF", price: 140 },
    { nameNepali: "चिल्ली पोटेटो", nameEnglish: "Chilli Potato (Full)", category: "VEG", portion: "FULL", price: 240 },
    { nameNepali: "छोइला", nameEnglish: "Veg Choila (Half)", category: "VEG", portion: "HALF", price: 150 },
    { nameNepali: "छोइला", nameEnglish: "Veg Choila (Full)", category: "VEG", portion: "FULL", price: 250 },
    { nameNepali: "पनिर फ्राई", nameEnglish: "Paneer Fry (Half)", category: "VEG", portion: "HALF", price: 250 },
    { nameNepali: "पनिर फ्राई", nameEnglish: "Paneer Fry (Full)", category: "VEG", portion: "FULL", price: 400 },
    { nameNepali: "पनिर चिल्ली", nameEnglish: "Paneer Chilli (Half)", category: "VEG", portion: "HALF", price: 350 },
    { nameNepali: "पनिर चिल्ली", nameEnglish: "Paneer Chilli (Full)", category: "VEG", portion: "FULL", price: 500 },
    { nameNepali: "भटमास सादा", nameEnglish: "Bhatmas Plain", category: "VEG", portion: "REGULAR", price: 50 },
    { nameNepali: "Peanut साधेको", nameEnglish: "Peanut Sadeko (Half)", category: "VEG", portion: "HALF", price: 120 },
    { nameNepali: "Peanut साधेको", nameEnglish: "Peanut Sadeko (Full)", category: "VEG", portion: "FULL", price: 220 },
    { nameNepali: "Peanut बदाम सादा", nameEnglish: "Peanut Plain", category: "VEG", portion: "REGULAR", price: 80 },
    { nameNepali: "एमलगत बदाम साधेको", nameEnglish: "Almond/Mix Badam Sadeko (Half)", category: "VEG", portion: "HALF", price: 150 },
    { nameNepali: "एमलगत बदाम साधेको", nameEnglish: "Almond/Mix Badam Sadeko (Full)", category: "VEG", portion: "FULL", price: 250 },
    { nameNepali: "सलाद ग्रीन", nameEnglish: "Green Salad (Half)", category: "VEG", portion: "HALF", price: 100 },
    { nameNepali: "सलाद ग्रीन", nameEnglish: "Green Salad (Full)", category: "VEG", portion: "FULL", price: 200 },
    { nameNepali: "सलाद फ्रुट", nameEnglish: "Fruit Salad (Half)", category: "VEG", portion: "HALF", price: 150 },
    { nameNepali: "सलाद फ्रुट", nameEnglish: "Fruit Salad (Full)", category: "VEG", portion: "FULL", price: 250 },
    { nameNepali: "सलाद मिक्स", nameEnglish: "Mix Salad (Half)", category: "VEG", portion: "HALF", price: 150 },
    { nameNepali: "सलाद मिक्स", nameEnglish: "Mix Salad (Full)", category: "VEG", portion: "FULL", price: 350 },

    // --- COMBOS (कम्बो) ---
    {
      nameNepali: "कम्बो १ (भेज प्लेटर)",
      nameEnglish: "Veg Feast Combo (Chilli Paneer, Chowmein, Fried Rice, Sandwich, Fries, Chilli Potato, Papad, Salad)",
      category: "COMBO",
      portion: "MINI",
      price: 650,
    },
    {
      nameNepali: "कम्बो १ (भेज प्लेटर)",
      nameEnglish: "Veg Feast Combo Large (Chilli Paneer, Chowmein, Fried Rice, Sandwich, Fries, Chilli Potato, Papad, Salad)",
      category: "COMBO",
      portion: "LARGE",
      price: 1199,
    },
    {
      nameNepali: "कम्बो २ (चिकन प्लेटर)",
      nameEnglish: "Chicken Feast Combo (Roast, Chilli Chicken, Biryani, Salad, Papad, Chowmein, Sausage, Sekuwa)",
      category: "COMBO",
      portion: "MINI",
      price: 1155,
    },
    {
      nameNepali: "कम्बो २ (चिकन प्लेटर)",
      nameEnglish: "Chicken Feast Combo Large (Roast, Chilli Chicken, Biryani, Salad, Papad, Chowmein, Sausage, Sekuwa)",
      category: "COMBO",
      portion: "LARGE",
      price: 1299,
    },
    {
      nameNepali: "कम्बो ३ (मटन प्लेटर)",
      nameEnglish: "Mutton Feast Combo (Gravy, Chiura, Bhutan, Roast, Prawn Papad, Sekuwa)",
      category: "COMBO",
      portion: "MINI",
      price: 1455,
    },
    {
      nameNepali: "कम्बो ३ (मटन प्लेटर)",
      nameEnglish: "Mutton Feast Combo Large (Gravy, Chiura, Bhutan, Roast, Prawn Papad, Sekuwa)",
      category: "COMBO",
      portion: "LARGE",
      price: 2155,
    },
    {
      nameNepali: "कम्बो ४ (रोयल दरबार मिक्स प्लेटर)",
      nameEnglish: "Royal Non-Veg Durbar Platter (Mix Salad, Prawn Papad, Sukuti, Chicken Roast, Bhutan, Sekuwa, Veg Fried Rice, Biryani)",
      category: "COMBO",
      portion: "MINI",
      price: 1355,
    },
    {
      nameNepali: "कम्बो ४ (रोयल दरबार मिक्स प्लेटर)",
      nameEnglish: "Royal Non-Veg Durbar Platter Large (Mix Salad, Prawn Papad, Sukuti, Chicken Roast, Bhutan, Sekuwa, Veg Fried Rice, Biryani)",
      category: "COMBO",
      portion: "LARGE",
      price: 2355,
    },

    // --- MOMO (म:म:) ---
    { nameNepali: "म:म: स्टीम", nameEnglish: "Steam Momo (Half)", category: "MOMO", portion: "HALF", price: 50 },
    { nameNepali: "म:म: स्टीम", nameEnglish: "Steam Momo (Full)", category: "MOMO", portion: "FULL", price: 100 },
    { nameNepali: "म:म: फ्राई", nameEnglish: "Fried Momo (Half)", category: "MOMO", portion: "HALF", price: 90 },
    { nameNepali: "म:म: फ्राई", nameEnglish: "Fried Momo (Full)", category: "MOMO", portion: "FULL", price: 170 },
    { nameNepali: "सि. म:म:", nameEnglish: "C. Momo (Half)", category: "MOMO", portion: "HALF", price: 100 },
    { nameNepali: "सि. म:म:", nameEnglish: "C. Momo (Full)", category: "MOMO", portion: "FULL", price: 200 },
    { nameNepali: "चिल्ली म:म:", nameEnglish: "Chilli Momo (Half)", category: "MOMO", portion: "HALF", price: 100 },
    { nameNepali: "चिल्ली म:म:", nameEnglish: "Chilli Momo (Full)", category: "MOMO", portion: "FULL", price: 200 },
    { nameNepali: "झोल म:म:", nameEnglish: "Jhol Momo (Half)", category: "MOMO", portion: "HALF", price: 60 },
    { nameNepali: "झोल म:म:", nameEnglish: "Jhol Momo (Full)", category: "MOMO", portion: "FULL", price: 120 },

    // --- RICE (राइस) ---
    { nameNepali: "भेज फ्राई राइस", nameEnglish: "Veg Fried Rice (Half)", category: "RICE", portion: "HALF", price: 80 },
    { nameNepali: "भेज फ्राई राइस", nameEnglish: "Veg Fried Rice (Full)", category: "RICE", portion: "FULL", price: 150 },
    { nameNepali: "अण्डा फ्राई राइस", nameEnglish: "Egg Fried Rice (Half)", category: "RICE", portion: "HALF", price: 100 },
    { nameNepali: "अण्डा फ्राई राइस", nameEnglish: "Egg Fried Rice (Full)", category: "RICE", portion: "FULL", price: 170 },
    { nameNepali: "चिकन फ्राई राइस", nameEnglish: "Chicken Fried Rice (Half)", category: "RICE", portion: "HALF", price: 150 },
    { nameNepali: "चिकन फ्राई राइस", nameEnglish: "Chicken Fried Rice (Full)", category: "RICE", portion: "FULL", price: 250 },
    { nameNepali: "मिक्स फ्राई राइस", nameEnglish: "Mix Fried Rice (Half)", category: "RICE", portion: "HALF", price: 220 },
    { nameNepali: "मिक्स फ्राई राइस", nameEnglish: "Mix Fried Rice (Full)", category: "RICE", portion: "FULL", price: 350 },
    { nameNepali: "विर्यानी", nameEnglish: "Biryani (Half)", category: "RICE", portion: "HALF", price: 150 },
    { nameNepali: "विर्यानी", nameEnglish: "Biryani (Full)", category: "RICE", portion: "FULL", price: 250 },

    // --- SNACKS & BREAKFAST (नास्ता) ---
    { nameNepali: "समोसा", nameEnglish: "Samosa", category: "SNACKS", portion: "PIECE", price: 25 },
    { nameNepali: "समोसा छोले", nameEnglish: "Samosa Chhole", category: "SNACKS", portion: "REGULAR", price: 60 },
    { nameNepali: "अण्डा बोइल", nameEnglish: "Boiled Egg", category: "SNACKS", portion: "REGULAR", price: 30 },
    { nameNepali: "अण्ड फ्राई", nameEnglish: "Fried Egg", category: "SNACKS", portion: "REGULAR", price: 35 },
    { nameNepali: "पुरी तरकारी (२ पुरी)", nameEnglish: "Puri Tarkari (2 pcs + Tarkari)", category: "SNACKS", portion: "REGULAR", price: 50 },
    { nameNepali: "पकौडा (प्रति पिस)", nameEnglish: "Pakoda (Per Piece)", category: "SNACKS", portion: "PIECE", price: 10 },
    { nameNepali: "सेण्डवीज चिकन", nameEnglish: "Chicken Sandwich", category: "SNACKS", portion: "REGULAR", price: 160 },
    { nameNepali: "सेण्डवीज भेज", nameEnglish: "Veg Sandwich", category: "SNACKS", portion: "REGULAR", price: 120 },
    { nameNepali: "सेण्डवीज अण्डा", nameEnglish: "Egg Sandwich", category: "SNACKS", portion: "REGULAR", price: 140 },
    { nameNepali: "अण्डा मसला अम्लेट", nameEnglish: "Egg Masala Omelette", category: "SNACKS", portion: "REGULAR", price: 50 },
    { nameNepali: "चाउमीन भेज", nameEnglish: "Veg Chowmein (Half)", category: "SNACKS", portion: "HALF", price: 50 },
    { nameNepali: "चाउमीन भेज", nameEnglish: "Veg Chowmein (Full)", category: "SNACKS", portion: "FULL", price: 100 },
    { nameNepali: "चाउमीन अण्डा", nameEnglish: "Egg Chowmein (Half)", category: "SNACKS", portion: "HALF", price: 80 },
    { nameNepali: "चाउमीन अण्डा", nameEnglish: "Egg Chowmein (Full)", category: "SNACKS", portion: "FULL", price: 120 },
    { nameNepali: "चाउमीन चिकन", nameEnglish: "Chicken Chowmein (Half)", category: "SNACKS", portion: "HALF", price: 130 },
    { nameNepali: "चाउमीन चिकन", nameEnglish: "Chicken Chowmein (Full)", category: "SNACKS", portion: "FULL", price: 230 },
    { nameNepali: "चाउमीन मिक्स", nameEnglish: "Mix Chowmein (Half)", category: "SNACKS", portion: "HALF", price: 200 },
    { nameNepali: "चाउमीन मिक्स", nameEnglish: "Mix Chowmein (Full)", category: "SNACKS", portion: "FULL", price: 350 },

    // --- BEVERAGES & DRINKS (Soft पेय) ---
    { nameNepali: "चिया कालो", nameEnglish: "Black Tea", category: "BEVERAGE", portion: "REGULAR", price: 20 },
    { nameNepali: "चिया लेमन", nameEnglish: "Lemon Tea", category: "BEVERAGE", portion: "REGULAR", price: 25 },
    { nameNepali: "चिया दुध", nameEnglish: "Milk Tea", category: "BEVERAGE", portion: "REGULAR", price: 30 },
    { nameNepali: "कफि कालो", nameEnglish: "Black Coffee", category: "BEVERAGE", portion: "REGULAR", price: 50 },
    { nameNepali: "कफि दुध", nameEnglish: "Milk Coffee", category: "BEVERAGE", portion: "REGULAR", price: 60 },
    { nameNepali: "लस्सी", nameEnglish: "Sweet Lassi (Regular)", category: "BEVERAGE", portion: "REGULAR", price: 60 },
    { nameNepali: "लस्सी", nameEnglish: "Special Lassi (Large)", category: "BEVERAGE", portion: "LARGE", price: 100 },
    { nameNepali: "मिठा दही", nameEnglish: "Sweet Curd (Mitha Dahi)", category: "BEVERAGE", portion: "REGULAR", price: 60 },
    { nameNepali: "मही", nameEnglish: "Mahi / Fresh Buttermilk", category: "BEVERAGE", portion: "REGULAR", price: 30 },
    { nameNepali: "फ्रुटी", nameEnglish: "Frooti Mango Drink", category: "BEVERAGE", portion: "REGULAR", price: 30 },
    { nameNepali: "मि.वाटर", nameEnglish: "Mineral Water (1 Litre)", category: "BEVERAGE", portion: "REGULAR", price: 30 },
    { nameNepali: "कोक", nameEnglish: "Coke / Fanta / Sprite (Glass)", category: "BEVERAGE", portion: "REGULAR", price: 60 },
    { nameNepali: "कोक", nameEnglish: "Coke / Fanta / Sprite (500ml Bottle)", category: "BEVERAGE", portion: "LARGE", price: 100 },
  ];

  // Clear and insert menu items
  await prisma.menuItem.deleteMany({});
  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        nameNepali: item.nameNepali,
        nameEnglish: item.nameEnglish,
        category: item.category,
        portion: item.portion,
        price: item.price,
      },
    });
  }
  console.log(`Seeded ${menuItems.length} menu items from Trishna Durbar menu cards.`);

  // 4. Seed Default Payment QR for Fonepay / Bank
  const existingQr = await prisma.paymentQr.findFirst();
  if (!existingQr) {
    await prisma.paymentQr.create({
      data: {
        bankName: "Global IME Bank / Fonepay",
        accountName: "TRISHNA DURBAR RESTAURANT",
        accountNumber: "01010100987654321",
        qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=fonepay://merchant/trishnadurbar",
        isDefault: true,
        isActive: true,
        notes: "Scan using Fonepay, eSewa, Khalti or any mobile banking app",
      },
    });
    console.log("Seeded default Payment QR.");
  }

  // 5. Seed Initial Restaurant Expenses
  const existingExpense = await prisma.expense.findFirst();
  if (!existingExpense) {
    const expenses = [
      {
        title: "Fresh Chicken & Mutton Purchase (Butcher)",
        amount: 8500,
        category: "MEAT_PURCHASE",
        paymentMethod: "CASH",
        notes: "Daily fresh kitchen stock",
        createdById: manager.id,
      },
      {
        title: "Vegetables & Grocery Market",
        amount: 3200,
        category: "GROCERIES",
        paymentMethod: "CASH",
        notes: "Potatoes, onions, spices, momo cabbage and ginger garlic",
        createdById: manager.id,
      },
      {
        title: "LPG Cooking Gas Cylinders (2 Refills)",
        amount: 3800,
        category: "GAS",
        paymentMethod: "CASH",
        notes: "Kitchen commercial gas cylinders",
        createdById: owner.id,
      },
    ];

    for (const exp of expenses) {
      await prisma.expense.create({ data: exp });
    }
    console.log("Seeded initial expenses.");
  }

  console.log("Trishna Durbar seed finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
