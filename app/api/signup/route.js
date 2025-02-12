import { connectDB } from '@/app/lib/mongodb';
import bcrypt from 'bcrypt'
import { User } from '@/app/models/User';

export async function POST(request) {
    await connectDB();
    
    const {firstName, lastName, email, password} = await request.json();

    if (!firstName || !lastName || !password || !email) {
        return new Response(JSON.stringify({error: "All fields are required", status: 400}))
    }

    const existingUser = await User.findOne({email})
    if (existingUser) {
        return new Response(JSON.stringify({error: "User already exists!", status: 400}))
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const normalized_email = email.toLowerCase()

    const newUser = new User({firstName, lastName, password: hashedPassword, email: normalized_email})
    await newUser.save();

    return new Response(JSON.stringify({message: "User created", status: 201}));
}