## Usuario ##
Quiero que actúes como un generador experto de pruebas automatizadas para un proyecto fullstack en Node.js (backend) y React (frontend).

hay 2 familias principales de tests, recepción de los datos del formulario, y guardado en la base de datos.

Basado en la siguiente estructura de proyecto y requerimientos, genera un conjunto mínimo de pruebas (al menos dos por cada familia) que verifiquen:

1. La correcta recepción de datos enviados desde un formulario React al backend.
2. El correcto guardado de esos datos en una base de datos usando Prisma.

Estructura del proyecto:
- backend/
  - src/
    - index.ts
    - application/
    - domain/
    - presentation/
    - routes/
    - test/
      - @tests-AAMM.test.ts  (aquí se guardarán los tests)
  - prisma/
- frontend/
  - src/
  - public/
  - build/
- docker-compose.yml
- .env

Las pruebas deben:
- Estar escritas en TypeScript utilizando `ts-jest`.
- Usar buenas prácticas de testing para proyectos Node.js con TypeScript.
- Cubrir el flujo completo desde la recepción HTTP (controlador) hasta la persistencia en base de datos (repositorio).
- Utilizar herramientas como Jest y Supertest para el backend.
- Incluir mocks cuando sea necesario (por ejemplo, para evitar llamadas reales a la base de datos).
- Incluir ejemplos de validación de campos y errores comunes (como campos vacíos o mal formateados).
- Estar ubicadas en @tests-AAMM.test.ts.

Además, proporciona breves recomendaciones sobre:
- Cómo estructurar y nombrar futuros archivos de test dentro de `backend/src/test`.
- Buenas prácticas para mantener los tests legibles, aislados y mantenibles.

no crees nada aun, primero pregunta lo que necesites si tienes dudas para ir avanzando paso a paso 

## Asistente ##
realiza 5 preguntas para ir avanzando paso a paso

## Usuario ##
1. Estructura de datos y modelos
- aqui tienes el contenido de @/models 
2. Endpoints y controladores
- aqui tienes lo solicitado@candidateController.ts  y @candidateRoutes.ts 
3. Servicios de aplicación
- aqui tienes el service @candidateService.js 
4. Base de datos
- aqui tienes el schema @schema.prisma 
5. Validaciones
- todas las que veas necesarias

## Asistente ## 
sugiere la instalacion de la libreria supertest para realizar las pruebas
Para un proyecto de testing completo, recomiendo usar Supertest porque:
Pruebas más robustas: Verifican que las rutas funcionen correctamente
Detección temprana de bugs: Capturan problemas de middleware y validación
Estándar de la industria: Es la práctica recomendada para testing de APIs

## Usuario ##
realiza las pruebas sin necesidad de instalr supertest utilizando mocks para las pruebas

## Asistente ##
Realizare las pruebas utilizando mocks para las pruebas 

## Usuario ##
muy bien ahora como probamos los test

## Asistente ##
verifica que jest y ts-jest esten instalados y configurados para poder ejecutar los test, se crea una instancia de test para la base de datos y se ejecutan los test

## Usuario ##
veo que solo se ejecutaron las pruebas de la familia 1 y varias fallaron necesitamos que todas las pruebas se ejecuten y pasen

## Asistente ##
1 Aumentar el timeout de los tests que fallan por tiempo.
2 Revisar los tests que fallan por validación y corregir los datos o el validador.

## Usuario ##
muy bien, aumentemos el timeout y revisemos los tests que fallan por validación.
