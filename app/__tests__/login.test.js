import { POST } from "../api/login/route";
import mongoose from "mongoose";
import { User } from "../models/User";
import bcrypt from 'bcrypt'
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = 'secret-token'
    process.env.JWT_REFRESH_SECRET = 'refresh-secret-token'
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)

    const hashedPassword = await bcrypt.hash('secret', 10)
    await User.create({firstName: 'test', lastName: 'user', email: 'test@gmail.com', password: hashedPassword})
})

describe('POST /api/login', () => {
    it('should return a token for valid credentials', async() => {
        const req = new Request('http://localhost/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({email: 'test@gmail.com', password: 'secret'})
        });

        const res = await POST(req);

        expect (res.status).toBe(200)
        const data = await res.json();
        expect(data).toHaveProperty('token')
        expect(data).toHaveProperty('refreshToken')
    });

    it('should return an error for invalid credentials', async () => {
        const req = new Request('http://localhost/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: 'wrong@gmail.com', password: 'incorrect'})
        });

        const res = await POST(req)
        expect(res.status).toBe(401)

        const data = await res.json()
        expect(data).toEqual({error: 'Invalid Credentials'})
    })
})

afterAll(async () => {
   await mongoose.disconnect()
   await mongoServer.stop()
})