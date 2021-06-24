import { Entity, PrimaryColumn, Column, Index, OneToMany } from 'typeorm'
import { Hash, Timestamp } from './SharedColumnType'
import { Transaction } from './Transaction'
import { bigint } from './ValueTransformer'

@Entity()
export class Block {
  @PrimaryColumn(Hash)
  hash!: string

  @Index()
  @Column({
    type: 'bigint',
    transformer: bigint,
  })
  sequence!: number

  @Column()
  previousBlockHash!: string
  previousBlock?: Block

  @Column()
  difficulty!: number

  @Column()
  size!: number

  @Column(Timestamp)
  timestamp!: number

  @Column()
  transactionsCount!: number

  @OneToMany(() => Transaction, (transaction) => transaction.block)
  transactions!: Transaction[]
}
