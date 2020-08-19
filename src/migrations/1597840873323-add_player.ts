import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPlayer1597840873323 implements MigrationInterface {
  name = 'addPlayer1597840873323';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "player" ("uid" character varying NOT NULL, "ap" integer NOT NULL, CONSTRAINT "PK_700516a810ac9c37a1e967aa10e" PRIMARY KEY ("uid"))`,
    );
    await queryRunner.query(`ALTER TABLE "character" ADD "gameState" integer NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "gameState"`);
    await queryRunner.query(`DROP TABLE "player"`);
  }
}
