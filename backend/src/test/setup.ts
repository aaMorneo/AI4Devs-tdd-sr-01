import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno para tests
dotenv.config({ path: '.env.test' });

// Configurar Prisma para tests con SQLite
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/test.db',
    },
  },
});

// Limpiar base de datos antes de cada test
beforeEach(async () => {
  try {
    await prisma.resume.deleteMany();
    await prisma.workExperience.deleteMany();
    await prisma.education.deleteMany();
    await prisma.candidate.deleteMany();
  } catch (error) {
    // Si la BD no existe, la creamos
    console.log('Base de datos de test no encontrada, se creará automáticamente');
  }
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma }; 