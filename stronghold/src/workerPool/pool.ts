
import * as worker from './worker'
import { Worker } from 'worker_threads'
import type {
  CreateTransactionRequest,
  CreateMinersFeeRequest,
  OmitRequestId,
  TransactionFeeRequest,
  VerifyTransactionRequest,
  WorkerRequest,
  WorkerResponse,
  WorkerRequestMessage,
  WorkerResponseMessage,
  BoxMessageRequest,
  UnboxMessageRequest,
} from './messages'
import type { Side } from '../merkletree/merkletree'
import { StrongholdTransaction } from '../primitives/transaction'
import { StrongholdNote } from '../primitives/note'
import { Identity, PrivateIdentity } from '../network'

const MESSAGE_QUEUE_MAX_LENGTH = 200

type WorkerPoolWorker = { worker: Worker; awaitingResponse: boolean }

/**
 * Manages the creation of worker threads and distribution of jobs to them.
 */
export class WorkerPool {
  private readonly resolvers: Map<number, (response: WorkerResponse) => void> = new Map<
    number,
    (response: WorkerResponse) => void
  >()
  private messageQueue: Array<WorkerRequestMessage> = []
  private workers: Array<WorkerPoolWorker> = []

  private _started = false
  public get started(): boolean {
    return this._started
  }

  private lastRequestId = 0

  private sendRequest(request: Readonly<WorkerRequest>): Promise<WorkerResponse | null> {
    const requestId = this.lastRequestId++

    const requestMessage: Readonly<WorkerRequestMessage> = { requestId, body: request }

    if (this.workers.length === 0) {
      const response = worker.handleRequest(requestMessage)
      return Promise.resolve(response ? response.body : null)
    }

    return this.promisifyRequest(requestMessage)
  }

  /**
   * Send a request to the worker thread,
   * giving it an id and constructing a promise that can be resolved
   * when the worker thread has issued a response message.
   */
  private promisifyRequest(request: Readonly<WorkerRequestMessage>): Promise<WorkerResponse> {
    const promise: Promise<WorkerResponse> = new Promise((resolve) => {
      this.resolvers.set(request.requestId, (posted) => resolve(posted))
    })

    for (const worker of this.workers) {
      // If we find a worker that's not busy, send it the request
      if (worker.awaitingResponse === false) {
        worker.awaitingResponse = true
        worker.worker.postMessage(request)
        return promise
      }
    }

    // All workers are busy, so push the request onto the messageQueue
    this.messageQueue.push(request)
    return promise
  }

  private promisifyResponse(
    worker: WorkerPoolWorker | undefined,
    response: WorkerResponseMessage,
  ): void {
    if (worker !== undefined) {
      // Send the worker a new request if the message queue is not empty
      if (this.messageQueue.length === 0) {
        worker.awaitingResponse = false
      } else {
        worker.awaitingResponse = true
        const message = this.messageQueue.shift()
        worker.worker.postMessage(message)
      }
    }

    // Resolve the outstanding promise with the response
    const resolver = this.resolvers.get(response.requestId)
    if (resolver) {
      this.resolvers.delete(response.requestId)
      resolver(response.body)
    }
  }

  start(workers: number): WorkerPool {
    if (this.started) {
      return this
    }

    this._started = true

    // Works around different paths when run under ts-jest
    let dir = __dirname
    if (dir.includes('stronghold/src/workerPool')) {
      dir = dir.replace('stronghold/src/workerPool', 'stronghold/build/src/workerPool')
    }

    for (let i = 0; i < workers; i++) {
      const worker = new Worker(dir + '/worker.js')

      worker.on('message', (value) => {
        const w = this.workers.find((w) => w.worker === worker)
        this.promisifyResponse(w, value)
      })

      this.workers.push({ worker, awaitingResponse: false })
    }

    return this
  }

  async stop(): Promise<undefined> {
    await Promise.all(this.workers.map((w) => w.worker.terminate()))
    this.workers = []
    this.messageQueue = []
    this.resolvers.clear()
    this._started = false
    return
  }

  async createMinersFee(
    spendKey: string,
    amount: bigint,
    memo: string,
  ): Promise<StrongholdTransaction> {
    const request: OmitRequestId<CreateMinersFeeRequest> = {
      type: 'createMinersFee',
      spendKey,
      amount,
      memo,
    }

    const response = await this.sendRequest(request)

    if (response === null || response.type !== request.type) {
      throw new Error('Response type must match request type')
    }

    return new StrongholdTransaction(Buffer.from(response.serializedTransactionPosted), this)
  }

  isMessageQueueFull(): boolean {
    return this.messageQueue.length >= MESSAGE_QUEUE_MAX_LENGTH
  }

  async createTransaction(
    spendKey: string,
    transactionFee: bigint,
    spends: {
      note: StrongholdNote
      treeSize: number
      rootHash: Buffer
      authPath: {
        side: Side
        hashOfSibling: Buffer
      }[]
    }[],
    receives: { publicAddress: string; amount: bigint; memo: string }[],
  ): Promise<StrongholdTransaction> {
    const request: OmitRequestId<CreateTransactionRequest> = {
      type: 'createTransaction',
      spendKey,
      transactionFee,
      spends: spends.map((s) => ({
        ...s,
        note: s.note.serialize(),
      })),
      receives,
    }

    const response = await this.sendRequest(request)

    if (response === null || response.type !== request.type) {
      throw new Error('Response type must match request type')
    }

    return new StrongholdTransaction(Buffer.from(response.serializedTransactionPosted), this)
  }

  async transactionFee(transaction: StrongholdTransaction): Promise<bigint> {
    const request: OmitRequestId<TransactionFeeRequest> = {
      type: 'transactionFee',
      serializedTransactionPosted: transaction.serialize(),
    }

    const response = await this.sendRequest(request)

    if (response === null || response.type !== request.type) {
      throw new Error('Response type must match request type')
    }

    return response.transactionFee
  }

  async verify(transaction: StrongholdTransaction): Promise<boolean> {
    const request: OmitRequestId<VerifyTransactionRequest> = {
      type: 'verify',
      serializedTransactionPosted: transaction.serialize(),
    }

    const response = await this.sendRequest(request)

    if (response === null || response.type !== request.type) {
      throw new Error('Response type must match request type')
    }

    return response.verified
  }

  async boxMessage(
    plainTextMessage: string,
    sender: PrivateIdentity,
    recipient: Identity,
  ): Promise<{ nonce: string; boxedMessage: string }> {
    const request: OmitRequestId<BoxMessageRequest> = {
      type: 'boxMessage',
      message: plainTextMessage,
      sender: sender,
      recipient: recipient,
    }

    const response = await this.sendRequest(request)

    if (response === null || response.type !== request.type) {
      throw new Error('Response type must match request type')
    }

    return { nonce: response.nonce, boxedMessage: response.boxedMessage }
  }

  async unboxMessage(
    boxedMessage: string,
    nonce: string,
    sender: Identity,
    recipient: PrivateIdentity,
  ): Promise<{ message: string | null }> {
    const request: OmitRequestId<UnboxMessageRequest> = {
      type: 'unboxMessage',
      boxedMessage: boxedMessage,
      nonce: nonce,
      recipient: recipient,
      sender: sender,
    }

    const response = await this.sendRequest(request)

    if (response === null || response.type !== request.type) {
      throw new Error('Response type must match request type')
    }

    return { message: response.message }
  }
}
