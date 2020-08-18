import { MigrationInterface, QueryRunner } from 'typeorm';

export class entityGraphicAssign1597754473259 implements MigrationInterface {
  name = 'entityGraphicAssign1597754473259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "character" ADD "graphic" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "monster" ADD "graphic" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "position"`);
    await queryRunner.query(`ALTER TABLE "character" ADD "position" json NOT NULL`);
    await queryRunner.query(`ALTER TABLE "monster" DROP COLUMN "position"`);
    await queryRunner.query(`ALTER TABLE "monster" ADD "position" json NOT NULL`);
    await queryRunner.query(`ALTER TABLE "campaign" DROP COLUMN "dungeon"`);
    await queryRunner.query(`ALTER TABLE "campaign" ADD "dungeon" json NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaign" DROP COLUMN "dungeon"`);
    await queryRunner.query(`ALTER TABLE "campaign" ADD "dungeon" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "monster" DROP COLUMN "position"`);
    await queryRunner.query(`ALTER TABLE "monster" ADD "position" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "position"`);
    await queryRunner.query(`ALTER TABLE "character" ADD "position" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "monster" DROP COLUMN "graphic"`);
    await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "graphic"`);
  }
}
