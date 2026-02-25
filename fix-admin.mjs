import { PrismaClient } from '@prisma/client'

// Lägg till {} i konstruktorn
const prisma = new PrismaClient({})

async function main() {
  const adminEmail = "admin@ggadmin.com";

  try {
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        emailVerified: new Date(),
        role: "ADMIN"
      },
    })
    console.log(`✅ Succé! ${updatedUser.email} är nu verifierad admin.`);
  } catch (error) {
    console.error("❌ Fel vid uppdatering:", error.message);
    console.log("Tips: Se till att användaren faktiskt existerar i databasen.");
  } finally {
    await prisma.$disconnect()
  }
}

main()