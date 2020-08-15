import { MigrationInterface, QueryRunner } from 'typeorm';

export class basicCharacter1597437679213 implements MigrationInterface {
  name = 'basicCharacter1597437679213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "character" ("uid" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_1e68e7ffd5c106af49c1317e375" PRIMARY KEY ("uid"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "character"`);
  }
}
