import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Validation schema for creating products
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
});

// GET - List all products with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const lowStock = searchParams.get('lowStock') === 'true';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (lowStock) {
      where.stock = { lte: 10 }; // Consider products with 10 or fewer items as low stock
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              name: true,
            },
          },

        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createProductSchema.parse(body);

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        stock: data.stock || 0,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Stock is set directly in the product creation above

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}