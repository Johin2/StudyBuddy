import { POST } from "../api/refresh/route";
import jwt from 'jsonwebtoken'

beforeAll(() => {
    process.env.JWT_SECRET = "secret-token";
    process.env.JWT_REFRESH_SECRET = "refresh-secret-token";

})

describe('POST /api/refresh', () => {
    it('should return a refresh token required error', async() => {
        const req = new Request('http://localhost/api/refresh', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({})
        })

        const res = await POST(req)
        expect(res.status).toBe(400)

        const data = await res.json()
        expect(data).toEqual({error: 'Refresh token is required'})
    });

    it('should return a refresh token for a valid refresh token',async () => {
        const payload = {id: 'user-id-123', email: "test@gmail.com", }
        const validRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '7d'
        })

        const req = new Request('http://localhost/api/refresh',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refreshToken: validRefreshToken})
        })

        const res = await POST(req)
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data).toHaveProperty("token")

        const decoded = jwt.decode(data.token, process.env.JWT_REFRESH_SECRET)
        expect(decoded.id).toEqual(payload.id)

        expect(decoded.email).toEqual(payload.email)
    })
})