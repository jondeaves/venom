import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMonsterProps1597618175077 implements MigrationInterface {
  name = 'addMonsterProps1597618175077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "monster" ADD "level" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "monster" ADD "expvalue" integer NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "monster" DROP COLUMN "expvalue"`);
    await queryRunner.query(`ALTER TABLE "monster" DROP COLUMN "level"`);
  }
}
