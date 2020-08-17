import { MigrationInterface, QueryRunner } from 'typeorm';

export class basicCampaign1597671781673 implements MigrationInterface {
  name = 'basicCampaign1597671781673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "character" ("uid" character varying NOT NULL, "name" character varying NOT NULL, "max_health" integer NOT NULL, "current_health" integer NOT NULL, "power" integer NOT NULL, "defense" integer NOT NULL, "position" character varying NOT NULL, CONSTRAINT "PK_1e68e7ffd5c106af49c1317e375" PRIMARY KEY ("uid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "monster" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "level" integer NOT NULL, "expvalue" integer NOT NULL, "max_health" integer NOT NULL, "current_health" integer NOT NULL, "power" integer NOT NULL, "defense" integer NOT NULL, "position" character varying NOT NULL, CONSTRAINT "PK_9d95b6eedf1fbbea6b329b91f81" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "campaign" ("id" SERIAL NOT NULL, "roomId" character varying NOT NULL, "dungeon" character varying NOT NULL, CONSTRAINT "PK_0ce34d26e7f2eb316a3a592cdc4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "campaign_characters_character" ("campaignId" integer NOT NULL, "characterUid" character varying NOT NULL, CONSTRAINT "PK_cc4b8ca429f019fac2feb1ef1bc" PRIMARY KEY ("campaignId", "characterUid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76e4c252bca117e89bb082c035" ON "campaign_characters_character" ("campaignId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba8d6a207297d9c998fbf67dfa" ON "campaign_characters_character" ("characterUid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "campaign_monsters_monster" ("campaignId" integer NOT NULL, "monsterId" integer NOT NULL, CONSTRAINT "PK_84b42203d734ced53c973c362ca" PRIMARY KEY ("campaignId", "monsterId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c5dc7b2a567ee802791577b5e9" ON "campaign_monsters_monster" ("campaignId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fffa45c124b3b912c1e8acf2a0" ON "campaign_monsters_monster" ("monsterId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_characters_character" ADD CONSTRAINT "FK_76e4c252bca117e89bb082c035d" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_characters_character" ADD CONSTRAINT "FK_ba8d6a207297d9c998fbf67dfa2" FOREIGN KEY ("characterUid") REFERENCES "character"("uid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_monsters_monster" ADD CONSTRAINT "FK_c5dc7b2a567ee802791577b5e98" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_monsters_monster" ADD CONSTRAINT "FK_fffa45c124b3b912c1e8acf2a0f" FOREIGN KEY ("monsterId") REFERENCES "monster"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaign_monsters_monster" DROP CONSTRAINT "FK_fffa45c124b3b912c1e8acf2a0f"`);
    await queryRunner.query(`ALTER TABLE "campaign_monsters_monster" DROP CONSTRAINT "FK_c5dc7b2a567ee802791577b5e98"`);
    await queryRunner.query(
      `ALTER TABLE "campaign_characters_character" DROP CONSTRAINT "FK_ba8d6a207297d9c998fbf67dfa2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_characters_character" DROP CONSTRAINT "FK_76e4c252bca117e89bb082c035d"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_fffa45c124b3b912c1e8acf2a0"`);
    await queryRunner.query(`DROP INDEX "IDX_c5dc7b2a567ee802791577b5e9"`);
    await queryRunner.query(`DROP TABLE "campaign_monsters_monster"`);
    await queryRunner.query(`DROP INDEX "IDX_ba8d6a207297d9c998fbf67dfa"`);
    await queryRunner.query(`DROP INDEX "IDX_76e4c252bca117e89bb082c035"`);
    await queryRunner.query(`DROP TABLE "campaign_characters_character"`);
    await queryRunner.query(`DROP TABLE "campaign"`);
    await queryRunner.query(`DROP TABLE "monster"`);
    await queryRunner.query(`DROP TABLE "character"`);
  }
}
