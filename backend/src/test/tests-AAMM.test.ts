import { addCandidate } from '../application/services/candidateService';
import { validateCandidateData } from '../application/validator';
import { Candidate } from '../domain/models/Candidate';
import { prisma } from './setup';

// Datos de prueba válidos
const validCandidateData = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '612345678',
  address: 'Calle Mayor 123, Madrid',
  educations: [
    {
      institution: 'Universidad Complutense',
      title: 'Ingeniería Informática',
      startDate: '2018-09-01',
      endDate: '2022-06-30'
    }
  ],
  workExperiences: [
    {
      company: 'TechCorp',
      position: 'Desarrollador Full Stack',
      description: 'Desarrollo de aplicaciones web con React y Node.js',
      startDate: '2022-07-01',
      endDate: '2024-01-31'
    }
  ],
  cv: {
    filePath: '/uploads/cv-juan-perez.pdf',
    fileType: 'application/pdf'
  }
};


describe('🔍 FAMILIA 1: Recepción de datos del formulario React → Backend', () => {
  
  describe('Recepción de datos válidos', () => {
    test('debe procesar correctamente datos completos de un candidato', async () => {
      const result = await addCandidate(validCandidateData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.firstName).toBe(validCandidateData.firstName);
      expect(result.lastName).toBe(validCandidateData.lastName);
      expect(result.email).toBe(validCandidateData.email);
      expect(result.phone).toBe(validCandidateData.phone);
      expect(result.address).toBe(validCandidateData.address);
    }, 30000);

    test('debe procesar datos mínimos de candidato (solo campos obligatorios)', async () => {
      const minimalData = {
        firstName: 'María',
        lastName: 'García',
        email: 'maria.garcia@example.com'
      };

      const result = await addCandidate(minimalData);

      expect(result).toBeDefined();
      expect(result.firstName).toBe(minimalData.firstName);
      expect(result.lastName).toBe(minimalData.lastName);
      expect(result.email).toBe(minimalData.email);
    });

    test('debe manejar datos con caracteres especiales en nombres', async () => {
      const dataWithSpecialChars = {
        firstName: 'José María',
        lastName: 'García-López',
        email: 'jose.garcia@example.com'
      };

      const result = await addCandidate(dataWithSpecialChars);

      expect(result.firstName).toBe(dataWithSpecialChars.firstName);
      expect(result.lastName).toBe(dataWithSpecialChars.lastName);
    });
  });

  describe('Validación de datos inválidos', () => {
    test('debe rechazar datos con campos obligatorios vacíos', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'Pérez',
        email: 'juan@example.com'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    test('debe rechazar email con formato inválido', async () => {
      const invalidEmailData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'email-sin-formato-valido'
      };

      await expect(addCandidate(invalidEmailData)).rejects.toThrow('Invalid email');
    });

    test('debe rechazar teléfono con formato inválido', async () => {
      const invalidPhoneData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '12345' // Formato inválido
      };

      await expect(addCandidate(invalidPhoneData)).rejects.toThrow('Invalid phone');
    });

    test('debe rechazar datos sin campos obligatorios', async () => {
      const missingData = {
        firstName: 'Juan',
        // lastName faltante
        email: 'juan@example.com'
      };

      await expect(addCandidate(missingData)).rejects.toThrow('Invalid name');
    });
  });

  describe('Validación de datos complejos', () => {
    test('debe validar correctamente fechas de educación', async () => {
      const invalidEducationData = {
        ...validCandidateData,
        email: 'otro@example.com',
        educations: [
          {
            institution: 'Universidad',
            title: 'Carrera',
            startDate: 'fecha-invalida',
            endDate: '2022-06-30'
          }
        ]
      };

      await expect(addCandidate(invalidEducationData)).rejects.toThrow('Invalid date');
    });

    test('debe validar longitud de campos según esquema de BD', async () => {
      const longNameData = {
        firstName: 'A'.repeat(101), // Más de 100 caracteres
        lastName: 'Pérez',
        email: 'juan@example.com'
      };

      await expect(addCandidate(longNameData)).rejects.toThrow('Invalid name');
    });

    test('debe validar descripción de experiencia laboral muy larga', async () => {
      const longDescriptionData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        workExperiences: [
          {
            company: 'TechCorp',
            position: 'Developer',
            description: 'A'.repeat(201), // Más de 200 caracteres
            startDate: '2022-01-01',
            endDate: '2023-01-01'
          }
        ]
      };

      await expect(addCandidate(longDescriptionData)).rejects.toThrow('Invalid description');
    });
  });
});

describe('💾 FAMILIA 2: Guardado en base de datos con Prisma', () => {
  
  describe('Guardado de candidato básico', () => {
    test('debe guardar correctamente un candidato en la base de datos', async () => {
      const candidateData = {
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana.lopez@example.com',
        phone: '612345678'
      };

      const result = await addCandidate(candidateData);

      // Verificar que se guardó en la BD
      const savedCandidate = await prisma.candidate.findUnique({
        where: { email: candidateData.email }
      });

      expect(savedCandidate).toBeTruthy();
      expect(savedCandidate?.firstName).toBe(candidateData.firstName);
      expect(savedCandidate?.lastName).toBe(candidateData.lastName);
      expect(savedCandidate?.email).toBe(candidateData.email);
      expect(savedCandidate?.phone).toBe(candidateData.phone);
    });

    test('debe generar ID automático al guardar candidato', async () => {
      const candidateData = {
        firstName: 'Carlos',
        lastName: 'Martínez',
        email: 'carlos.martinez@example.com'
      };

      const result = await addCandidate(candidateData);

      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('number');
      expect(result.id).toBeGreaterThan(0);
    });

    test('debe manejar campos opcionales correctamente', async () => {
      const candidateData = {
        firstName: 'Elena',
        lastName: 'Rodríguez',
        email: 'elena.rodriguez@example.com'
        // Sin phone ni address
      };

      const result = await addCandidate(candidateData);

      const savedCandidate = await prisma.candidate.findUnique({
        where: { email: candidateData.email }
      });

      expect(savedCandidate?.phone).toBeNull();
      expect(savedCandidate?.address).toBeNull();
    });
  });

  describe('Guardado de datos relacionados', () => {
    test('debe guardar candidato con educación relacionada', async () => {
      const candidateWithEducation = {
        firstName: 'Elena',
        lastName: 'Rodríguez',
        email: 'elena.rodriguez@example.com',
        educations: [
          {
            institution: 'Universidad Politécnica',
            title: 'Ingeniería de Software',
            startDate: '2019-09-01',
            endDate: '2023-06-30'
          }
        ]
      };

      const result = await addCandidate(candidateWithEducation);

      // Verificar que se guardó la educación
      const savedEducation = await prisma.education.findFirst({
        where: { candidateId: result.id }
      });

      expect(savedEducation).toBeTruthy();
      expect(savedEducation?.institution).toBe('Universidad Politécnica');
      expect(savedEducation?.title).toBe('Ingeniería de Software');
      expect(savedEducation?.candidateId).toBe(result.id);
    }, 30000);

    test('debe guardar candidato con experiencia laboral', async () => {
      const candidateWithExperience = {
        firstName: 'David',
        lastName: 'Fernández',
        email: 'david.fernandez@example.com',
        workExperiences: [
          {
            company: 'StartupTech',
            position: 'Senior Developer',
            description: 'Liderazgo técnico en proyectos web',
            startDate: '2021-03-01',
            endDate: '2024-01-31'
          }
        ]
      };

      const result = await addCandidate(candidateWithExperience);

      // Verificar que se guardó la experiencia
      const savedExperience = await prisma.workExperience.findFirst({
        where: { candidateId: result.id }
      });

      expect(savedExperience).toBeTruthy();
      expect(savedExperience?.company).toBe('StartupTech');
      expect(savedExperience?.position).toBe('Senior Developer');
      expect(savedExperience?.candidateId).toBe(result.id);
    }, 30000);

    test('debe guardar candidato con CV', async () => {
      const candidateWithCV = {
        firstName: 'Laura',
        lastName: 'Sánchez',
        email: 'laura.sanchez@example.com',
        cv: {
          filePath: '/uploads/cv-laura.pdf',
          fileType: 'application/pdf'
        }
      };

      const result = await addCandidate(candidateWithCV);

      // Verificar que se guardó el CV
      const savedCV = await prisma.resume.findFirst({
        where: { candidateId: result.id }
      });

      expect(savedCV).toBeTruthy();
      expect(savedCV?.filePath).toBe('/uploads/cv-laura.pdf');
      expect(savedCV?.fileType).toBe('application/pdf');
      expect(savedCV?.candidateId).toBe(result.id);
    });

    test('debe guardar candidato con múltiples educaciones y experiencias', async () => {
      const complexCandidate = {
        firstName: 'Miguel',
        lastName: 'Torres',
        email: 'miguel.torres@example.com',
        educations: [
          {
            institution: 'Universidad A',
            title: 'Grado en Informática',
            startDate: '2015-09-01',
            endDate: '2019-06-30'
          },
          {
            institution: 'Universidad B',
            title: 'Máster en IA',
            startDate: '2019-09-01',
            endDate: '2020-06-30'
          }
        ],
        workExperiences: [
          {
            company: 'Empresa A',
            position: 'Junior Developer',
            startDate: '2019-07-01',
            endDate: '2021-06-30'
          },
          {
            company: 'Empresa B',
            position: 'Senior Developer',
            startDate: '2021-07-01',
            endDate: '2024-01-31'
          }
        ]
      };

      const result = await addCandidate(complexCandidate);

      // Verificar educaciones
      const savedEducations = await prisma.education.findMany({
        where: { candidateId: result.id }
      });
      expect(savedEducations).toHaveLength(2);

      // Verificar experiencias
      const savedExperiences = await prisma.workExperience.findMany({
        where: { candidateId: result.id }
      });
      expect(savedExperiences).toHaveLength(2);
    }, 30000);
  });

  describe('Manejo de errores de base de datos', () => {
    test('debe rechazar email duplicado', async () => {
      const candidateData = {
        firstName: 'Pedro',
        lastName: 'Gómez',
        email: 'pedro.gomez@example.com'
      };

      // Guardar primer candidato
      await addCandidate(candidateData);

      // Intentar guardar candidato con mismo email
      await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
    });

    test('debe manejar errores de validación de datos', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'Test',
        email: 'test@example.com'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });
  });
});

describe('🔧 Pruebas de integración del validador', () => {
  
  test('debe validar datos completos correctamente', () => {
    expect(() => validateCandidateData(validCandidateData)).not.toThrow();
  });

  test('debe rechazar datos con campos obligatorios faltantes', () => {
    const invalidData = {
      firstName: 'Juan',
      // lastName faltante
      email: 'juan@example.com'
    };

    expect(() => validateCandidateData(invalidData)).toThrow();
  });

  test('debe permitir edición de candidato existente (con ID)', () => {
    const existingCandidate = {
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com'
    };

    expect(() => validateCandidateData(existingCandidate)).not.toThrow();
  });

  test('debe validar formato de email correctamente', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org'
    ];

    validEmails.forEach(email => {
      const data = { firstName: 'Test', lastName: 'User', email };
      expect(() => validateCandidateData(data)).not.toThrow();
    });
  });

  test('debe rechazar emails con formato inválido', () => {
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'user@',
      'user..name@example.com'
    ];

    invalidEmails.forEach(email => {
      const data = { firstName: 'Test', lastName: 'User', email };
      expect(() => validateCandidateData(data)).toThrow('Invalid email');
    });
  });
});

describe('🧪 Pruebas del modelo Candidate', () => {
  
  test('debe crear instancia de Candidate correctamente', () => {
    const candidate = new Candidate(validCandidateData);
    
    expect(candidate.firstName).toBe(validCandidateData.firstName);
    expect(candidate.lastName).toBe(validCandidateData.lastName);
    expect(candidate.email).toBe(validCandidateData.email);
    expect(candidate.education).toHaveLength(1);
    expect(candidate.workExperience).toHaveLength(1);
    expect(candidate.resumes).toHaveLength(1);
  });

  test('debe manejar datos opcionales correctamente', () => {
    const minimalData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com'
    };

    const candidate = new Candidate(minimalData);
    
    expect(candidate.phone).toBeUndefined();
    expect(candidate.address).toBeUndefined();
    expect(candidate.education).toEqual([]);
    expect(candidate.workExperience).toEqual([]);
    expect(candidate.resumes).toEqual([]);
  });

  test('debe manejar arrays vacíos correctamente', () => {
    const dataWithEmptyArrays = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      educations: [],
      workExperiences: [],
      cv: null
    };

    const candidate = new Candidate(dataWithEmptyArrays);
    
    expect(candidate.education).toEqual([]);
    expect(candidate.workExperience).toEqual([]);
    expect(candidate.resumes).toEqual([]);
  });
});

describe('🎯 Pruebas de casos edge y validaciones especiales', () => {
  
  test('debe manejar nombres con acentos y caracteres especiales', () => {
    const dataWithAccents = {
      firstName: 'José María',
      lastName: 'García-López',
      email: 'jose.garcia@example.com'
    };

    expect(() => validateCandidateData(dataWithAccents)).not.toThrow();
  });

  test('debe validar fechas de educación sin fecha de fin', () => {
    const educationWithoutEndDate = {
      ...validCandidateData,
      email: 'test@example.com',
      educations: [
        {
          institution: 'Universidad',
          title: 'Carrera',
          startDate: '2020-09-01'
          // Sin endDate
        }
      ]
    };

    expect(() => validateCandidateData(educationWithoutEndDate)).not.toThrow();
  });

  test('debe validar experiencia laboral actual (sin fecha de fin)', () => {
    const currentJob = {
      ...validCandidateData,
      email: 'test@example.com',
      workExperiences: [
        {
          company: 'Empresa Actual',
          position: 'Developer',
          startDate: '2023-01-01'
          // Sin endDate (trabajo actual)
        }
      ]
    };

    expect(() => validateCandidateData(currentJob)).not.toThrow();
  });
});
