import { generateAccessToken } from '../lib/paypal'

// Test to generate access token from paypal
test('generate access token from paypal', async () => {
  const token = await generateAccessToken()
  expect(typeof token).toBe('string')
  expect(token.length).toBeGreaterThan(0)
})
