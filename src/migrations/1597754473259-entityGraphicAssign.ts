import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class entityGraphicAssign1597754473259 implements MigrationInterface {
  name = 'entityGraphicAssign1597754473259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "character" ALTER COLUMN "position" TYPE json USING "position"::json`);
    await queryRunner.query(`UPDATE "character" SET "position" = '{}'::json WHERE "position" ISNULL`);
    await queryRunner.query(`ALTER TABLE "character" ALTER COLUMN "position" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "character" ADD COLUMN "graphic" character varying`);
    await queryRunner.query(`UPDATE "character" SET "graphic" = '' WHERE "graphic" ISNULL`);
    await queryRunner.query(`ALTER TABLE "character" ALTER COLUMN "graphic" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "monster" ALTER COLUMN "position" TYPE json USING "position"::json`);
    await queryRunner.query(`UPDATE "monster" SET "position" = '{}'::json WHERE "position" ISNULL`);
    await queryRunner.query(`ALTER TABLE "monster" ALTER COLUMN "position" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "monster" ADD COLUMN "graphic" character varying`);
    await queryRunner.query(`UPDATE "monster" SET "graphic" = '' WHERE "graphic" ISNULL`);
    await queryRunner.query(`ALTER TABLE "monster" ALTER COLUMN "graphic" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "campaign" ALTER COLUMN "dungeon" TYPE json USING "dungeon"::json`);
    await queryRunner.query(`UPDATE "campaign" SET "dungeon" = '{}'::json WHERE "dungeon" ISNULL`);
    await queryRunner.query(`ALTER TABLE "campaign" ALTER COLUMN "dungeon" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaign" ALTER COLUMN "dungeon" TYPE character varying`);

    await queryRunner.query(`ALTER TABLE "character" ALTER COLUMN "position" TYPE character varying`);
    await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "graphic"`);

    await queryRunner.query(`ALTER TABLE "monster" ALTER COLUMN "position" TYPE character varying`);
    await queryRunner.query(`ALTER TABLE "monster" DROP COLUMN "graphic"`);
  }
}
