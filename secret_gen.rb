require "jwt"

key_file = "/Users/sammccarthy/Documents/Security/AuthKey_SMUBK8WB39.p8"
team_id = "F74BA3P8QF"
client_id = "app.stockwise.twa-service-id"
key_id = "SMUBK8WB39"
validity_period = 180 # In days. Max 180 (6 months) according to Apple docs.

private_key = OpenSSL::PKey::EC.new IO.read key_file

token = JWT.encode(
	{
		iss: team_id,
		iat: Time.now.to_i,
		exp: Time.now.to_i + 86400 * validity_period,
		aud: "https://appleid.apple.com",
		sub: client_id
	},
	private_key,
	"ES256",
	header_fields=
	{
		kid: key_id
	}
)
puts token

https://appleid.apple.com/auth/authorize?response_type=code&redirect_uri=https://www.stockwise.app&client_id=app.stockwise.twa-service-id

curl -X POST https://appleid.apple.com/auth/token -d 'grant_type=authorization_code&code=ccdb931377fa54cbfbe3c24f502cbf6b7.0.rrtys.MOPNE-lIDSZnx6xpkeTeag&redirect_uri=https://www.stockwise.app&client_id=app.stockwise.twa-service-id&client_secret=eyJraWQiOiJTTVVCSzhXQjM5IiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJGNzRCQTNQOFFGIiwiaWF0IjoxNjcxNTI4MDE0LCJleHAiOjE2ODcwODAwMTQsImF1ZCI6Imh0dHBzOi8vYXBwbGVpZC5hcHBsZS5jb20iLCJzdWIiOiJhcHAuc3RvY2t3aXNlLnR3YS1zZXJ2aWNlLWlkIn0.iVqz9477-5NdKUCAeQfCdw77dO-iJV5TJlsgB-kx_RvICGHofCTMoESeqlPoe0XoH6djpo_xggV3i0o4ElhoYw'