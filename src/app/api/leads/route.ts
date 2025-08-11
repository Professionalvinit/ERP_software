import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Validation schema for creating leads
const createLeadSchema = z.object({
  name: z.string().min(1, 'Lead name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  source: z.string().optional(),
  value: z.number().positive().optional(),
  customerId: z.string().optional(),
});

// GET - List all leads with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (userId) where.userId = userId;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              company: true,
            },
          },

          _count: {
            select: {
              interactions: true,
            },
          },
          interactions: {
            select: {
              type: true,
              subject: true,
              date: true,
            },
            orderBy: {
              date: 'desc',
            },
            take: 3,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.lead.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Calculate lead statistics
    const leadStats = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      _sum: {
        value: true,
      },
    });

    return NextResponse.json({
      leads,
      stats: leadStats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createLeadSchema.parse(body);

    // Verify customer exists if provided
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 400 }
        );
      }
    }

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        status: data.status || 'NEW',
        source: data.source,
        value: data.value,
        customerId: data.customerId,
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            company: true,
          },
        },

      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}