import { DataSource, QueryRunner } from "typeorm";

export class TransactionManager {
  private queryRunner: QueryRunner;

  constructor(private dataSource: DataSource) { }

  async startTransaction() {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commitTransaction() {
    if (this.queryRunner) {
      await this.queryRunner.commitTransaction();
      await this.queryRunner.release();
    }
  }

  async rollbackTransaction() {
    if (this.queryRunner) {
      await this.queryRunner.rollbackTransaction();
      await this.queryRunner.release();
    }
  }
  async executeInTransaction<T>(callback: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    try {
      await this.startTransaction();
      const result = await callback(this.queryRunner);
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }
}