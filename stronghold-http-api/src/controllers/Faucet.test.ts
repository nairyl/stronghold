import request from 'supertest'
import { Express } from 'express-serve-static-core'

const NodeFileProvider = jest.fn()
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
NodeFileProvider.prototype.init = jest.fn()

const quickAddJob = jest.fn().mockReturnValue(true)
jest.mock('graphile-worker', () => ({
  quickAddJob,
}))

import { Server } from '../server/server'

describe('POST /getFunds', () => {
  let server: Express
  beforeAll(() => {
    server = new Server().app
  })
  it('should return 200 and a valid response', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const result: { body: { message: string }; status: number } = await request(server).post(
      `/api/v1/getFunds?publicKey=myPublicKey&email=cameronball%40stronghold.financial`,
    )

    expect(result.status).toEqual(200)
    expect(result.body.message).toEqual(
      'Added cameronball@stronghold.financial to our newsletter. Faucet request successfully added to the queue for key: myPublicKey.',
    )
  })

  it('should return 200 with missing email', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const result: { body: { message: string }; status: number } = await request(server).post(
      `/api/v1/getFunds?publicKey=myPublicKey&email=`,
    )
    expect(result.status).toEqual(200)
    expect(result.body.message).toEqual(
      'Faucet request successfully added to the queue for key: myPublicKey.',
    )
  })
})
