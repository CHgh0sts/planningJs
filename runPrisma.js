const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Créer un événement
async function createEvent() {
  try {
    const newUser = await prisma.user.create({
      data: {
          username: 'testUser',
          color: '#ff0000',
          temp_password: 'hashedPasswordTest',
          password: null,
          role: 'user',
      },
    });
    console.log(newUser);
 } catch (e) {
    console.error('Erreur côté serveur:', e);
 }
}

// Récupérer tous les événements
async function getEvents() {
  const events = await prisma.event.findMany();
  console.log(events);
}

// Exécuter les fonctions
async function main() {
  await createEvent();
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
