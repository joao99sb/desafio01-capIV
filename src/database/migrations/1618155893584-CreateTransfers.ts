import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTransfers1618155893584 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transfers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'sender_id',
            type: 'uuid'
          },
          {
            name: 'recipient_id',
            type: 'uuid'
          }
        ],
        foreignKeys: [
          {
            name: 'FK_sender_id_transfers',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['sender_id'],
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          {
            name: 'FK_recipient_id_transfers',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['recipient_id'],
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          }
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transfers')
  }

}
