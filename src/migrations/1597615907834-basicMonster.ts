import { MigrationInterface, QueryRunner } from 'typeorm';

export class basicMonster1597615907834 implements MigrationInterface {
  name = 'basicMonster1597615907834';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "campaign_monsters_monster" ADD CONSTRAINT "FK_c5dc7b2a567ee802791577b5e98" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_monsters_monster" ADD CONSTRAINT "FK_fffa45c124b3b912c1e8acf2a0f" FOREIGN KEY ("monsterId") REFERENCES "monster"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaign_monsters_monster" DROP CONSTRAINT "FK_fffa45c124b3b912c1e8acf2a0f"`);
    await queryRunner.query(`ALTER TABLE "campaign_monsters_monster" DROP CONSTRAINT "FK_c5dc7b2a567ee802791577b5e98"`);
    await queryRunner.query(`DROP INDEX "IDX_fffa45c124b3b912c1e8acf2a0"`);
    await queryRunner.query(`DROP INDEX "IDX_c5dc7b2a567ee802791577b5e9"`);
    await queryRunner.query(`DROP TABLE "campaign_monsters_monster"`);
  }
}
