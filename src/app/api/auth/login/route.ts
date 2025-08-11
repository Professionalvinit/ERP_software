import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { verifyPassword, generateToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Check if this is the demo login and no users exist yet
    if (email === 'admin@demo.com' && password === 'demo123456') {
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        // Auto-create demo user
        const { hashPassword } = await import('@/lib/auth');
        const hashedPassword = await hashPassword(password);
        
        const newUser = await prisma.user.create({
          data: {
            email: 'admin@demo.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Administrator',
            role: 'ADMIN',
          },
        });

        const token = generateToken();
        const { password: _password, ...userWithoutPassword } = newUser;

        return NextResponse.json({
          user: userWithoutPassword,
          token,
          message: 'Demo user created and logged in successfully',
        });
      }
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token and return user data (without password)
    const token = generateToken();
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
