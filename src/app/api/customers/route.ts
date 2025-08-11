import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Validation schema for creating customers
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
});

// GET - List all customers with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              invoices: true,
              leads: true,
            },
          },
          invoices: {
            select: {
              total: true,
              status: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.customer.count({ where }),
    ]);

    // Calculate total revenue for each customer
    const customersWithRevenue = customers.map((customer: any) => ({
      ...customer,
      totalRevenue: customer.invoices.reduce((sum: number, invoice: any) =>
        invoice.status === 'PAID' ? sum + invoice.total : sum, 0
      ),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      customers: customersWithRevenue,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCustomerSchema.parse(body);

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        company: data.company,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}