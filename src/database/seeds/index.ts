import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';

async function runAllSeeds() {
  try {
    console.log('🌱 Iniciando seeds de la base de datos...\n');
    
    // Ejecutar seeds en orden
    await seedRoles();
    console.log('');
    await seedUsers();
    
    console.log('\n🎉 Todos los seeds completados exitosamente');
  } catch (error) {
    console.error('\n❌ Error ejecutando seeds:', error);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runAllSeeds()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runAllSeeds };

// src/database/migrations/1703000000000-InitialMigration.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1703000000000 implements MigrationInterface {
  name = 'InitialMigration1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Esta migración se ejecutará automáticamente con synchronize: true
    // En producción, deberías generar migraciones reales con:
    // npm run migration:generate -- --name=InitialMigration
    console.log('Ejecutando migración inicial...');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios si es necesario
    console.log('Revirtiendo migración inicial...');
  }
}
