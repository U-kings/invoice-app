import { prisma } from "./index";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create a dummy test user
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
     firstName: "John",
      middleName: "Edward",
      lastName: "Doe",
      class: "Premium", 
      email: "test@example.com",
      phoneNumber: "+1234567890",
      password: "$2a$12$K7v1Y8M3G...dummyhash", // Replace with real hash
      terms: true,
      isVerified: true,
    },
  });

  // 2. Create a dummy billing client
  const client = await prisma.client.create({
    data: {
      name: "Acme Corp",
      email: "billing@acme.com",
    },
  });

  // 3. Create a starting sample invoice
  await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: client.id,
      status: "PENDING",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      lineItems: {
        create: [
          { description: "Web Development Services", quantity: 1, price: 2500.00 },
          { description: "Cloud Hosting Setup", quantity: 1, price: 150.00 },
        ],
      },
    },
  });

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
