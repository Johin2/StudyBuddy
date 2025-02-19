import { POST } from "../api/signup/route";
import mongoose from "mongoose";
import { User } from "../models/User";
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'secret-token';
  process.env.JWT_REFRESH_SECRET = 'refresh-secret-token';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create an existing user for testing duplicate scenarios if needed
  await User.create({
    firstName: 'test',
    lastName: 'user',
    email: 'test@gmail.com',
    password: await bcrypt.hash('secret', 10)
  });
});

describe('POST /api/signup', () => {
  it('should create a new user with valid credentials', async () => {
    // Use a new email so that it does not conflict with the pre-created user
    const req = new Request('http://localhost/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'test',
        lastName: 'user',
        email: 'newuser@gmail.com',
        password: 'secret'
      })
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toEqual({ message: 'User Created' });
  });

  it('should return an error for missing credentials', async () => {
    const req = new Request('http://localhost/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'incorrect' })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toEqual({ error: 'All fields are required' });
  });

  it("should return an error for already existing error", async () => {
    const req = new Request('http://localhost/api/signup', {
        method: 'POST',
        headers: {"Content-Type": 'application/json'},
        body: JSON.stringify(
            {
                firstName: 'test',
                lastName: 'user',
                email: 'test@gmail.com',
                password: 'secret',
            }
        ),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data).toEqual({error: 'User already exists!'})
  })
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
