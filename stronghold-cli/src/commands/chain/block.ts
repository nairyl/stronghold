import { StrongholdCommand } from '../../command'
import { LocalFlags } from '../../flags'

export default class Block extends StrongholdCommand {
  static description = 'Show the block header of a requested hash'

  static args = [
    {
      name: 'hash',
      parse: (input: string): string => input.trim(),
      required: true,
      description: 'the hash of the block to look at',
    },
  ]

  static flags = {
    ...LocalFlags,
  }

  async start(): Promise<void> {
    const { args } = this.parse(Block)
    const hash = args.hash as string

    this.log(`Getting the block...`)
    await this.sdk.client.connect()
    const data = await this.sdk.client.getBlockInfo({ hash: hash })

    this.log(JSON.stringify(data.content, undefined, '  '))
  }
}
