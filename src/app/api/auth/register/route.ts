import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'ACCOUNTANT', 'SALES']).default('USER'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    // Return user without password
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User registered successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}