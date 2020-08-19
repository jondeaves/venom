import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPlayerRefs1597841535051 implements MigrationInterface {
  name = 'addPlayerRefs1597841535051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "player" ("uid" character varying NOT NULL, "ap" integer NOT NULL, CONSTRAINT "PK_700516a810ac9c37a1e967aa10e" PRIMARY KEY ("uid"))`,
    );
    await queryRunner.query(`ALTER TABLE "character" ADD "gameState" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "character" ADD "playerUid" character varying`);
    await queryRunner.query(
      `ALTER TABLE "character" ADD CONSTRAINT "FK_d9d890d6112e677b388e8ded1ff" FOREIGN KEY ("playerUid") REFERENCES "player"("uid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "character" DROP CONSTRAINT "FK_d9d890d6112e677b388e8ded1ff"`);
    await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "playerUid"`);
    await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "gameState"`);
    await queryRunner.query(`DROP TABLE "player"`);
  }
}
