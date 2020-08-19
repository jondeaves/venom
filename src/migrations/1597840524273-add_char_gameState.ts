import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCharGameState1597840524273 implements MigrationInterface {
  name = 'addCharGameState1597840524273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "player" ("uid" character varying NOT NULL, "ap" integer NOT NULL, CONSTRAINT "PK_700516a810ac9c37a1e967aa10e" PRIMARY KEY ("uid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "player_characters_character" ("playerUid" character varying NOT NULL, "characterUid" character varying NOT NULL, CONSTRAINT "PK_581ee5a2f9c6e16839f0e255661" PRIMARY KEY ("playerUid", "characterUid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f654f2fd12d3237e520f6acab4" ON "player_characters_character" ("playerUid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44a60bba30ecded9502e3602c0" ON "player_characters_character" ("characterUid") `,
    );
    await queryRunner.query(`ALTER TABLE "character" ADD "gameState" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "player_characters_character" ADD CONSTRAINT "FK_f654f2fd12d3237e520f6acab45" FOREIGN KEY ("playerUid") REFERENCES "player"("uid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_characters_character" ADD CONSTRAINT "FK_44a60bba30ecded9502e3602c0c" FOREIGN KEY ("characterUid") REFERENCES "character"("uid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_characters_character" DROP CONSTRAINT "FK_44a60bba30ecded9502e3602c0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_characters_character" DROP CONSTRAINT "FK_f654f2fd12d3237e520f6acab45"`,
    );
    await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "gameState"`);
    await queryRunner.query(`DROP INDEX "IDX_44a60bba30ecded9502e3602c0"`);
    await queryRunner.query(`DROP INDEX "IDX_f654f2fd12d3237e520f6acab4"`);
    await queryRunner.query(`DROP TABLE "player_characters_character"`);
    await queryRunner.query(`DROP TABLE "player"`);
  }
}
