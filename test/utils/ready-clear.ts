import { TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import { applyAppSettings } from "src/settings/apply-app-setting";
import { DataSource } from "typeorm";

export async function initForTest(moduleFixture: TestingModule, AppModule: any) {

  const app = moduleFixture.createNestApplication();

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  applyAppSettings(app);

  await app.init();

  const dataSource = await app.resolve(DataSource);
  async function cleadDB() {
    await dataSource.query(`
    CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
    DECLARE
        statements CURSOR FOR
            SELECT tablename FROM pg_tables
            WHERE tableowner = username AND schemaname = 'public';
    BEGIN
        FOR stmt IN statements LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    SELECT truncate_tables('postgres');
    `);
  }
  return {
    app,
    cleadDB
  };
}