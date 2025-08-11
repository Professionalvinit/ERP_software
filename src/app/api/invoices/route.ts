import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Validation schema for creating invoices
const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative').optional(),
  total: z.number().positive('Total must be positive'),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().positive('Quantity must be positive'),
    price: z.number().positive('Price must be positive'),
  })).min(1, 'At least one item is required'),
});

// GET - List all invoices with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createInvoiceSchema.parse(body);

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        customerId: data.customerId,
        subtotal: data.subtotal,
        tax: data.tax || 0,
        total: data.total,
        dueDate: data.dueDate,
        status: 'DRAFT',
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
          })),
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}