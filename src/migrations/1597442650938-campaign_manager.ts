import { MigrationInterface, QueryRunner } from 'typeorm';

export class campaignManager1597442650938 implements MigrationInterface {
  name = 'campaignManager1597442650938';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "campaign_characters_character" ADD CONSTRAINT "FK_76e4c252bca117e89bb082c035d" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_characters_character" ADD CONSTRAINT "FK_ba8d6a207297d9c998fbf67dfa2" FOREIGN KEY ("characterUid") REFERENCES "character"("uid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaign_characters_character" DROP CONSTRAINT "FK_ba8d6a207297d9c998fbf67dfa2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_characters_character" DROP CONSTRAINT "FK_76e4c252bca117e89bb082c035d"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_ba8d6a207297d9c998fbf67dfa"`);
    await queryRunner.query(`DROP INDEX "IDX_76e4c252bca117e89bb082c035"`);
    await queryRunner.query(`DROP TABLE "campaign_characters_character"`);
  }
}
