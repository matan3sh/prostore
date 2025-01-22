const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

export const paypal = {}

// Generate paypal access token
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    'base64'
  )

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (response.ok) {
    const { access_token } = await response.json()
    return access_token
  } else {
    const errorMessage = await response.text()
    throw new Error(errorMessage)
  }
}
