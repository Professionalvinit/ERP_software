import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
      });
    }

    console.log('Starting database seeding...');

    // Create demo users
    const hashedPassword = await hashPassword('demo123456');
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Administrator',
        role: 'ADMIN',
      },
    });

    const salesUser = await prisma.user.create({
      data: {
        email: 'sales@demo.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Sales',
        role: 'SALES',
      },
    });

    const accountantUser = await prisma.user.create({
      data: {
        email: 'accountant@demo.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Finance',
        role: 'ACCOUNTANT',
      },
    });

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: 'Electronics', description: 'Electronic devices and gadgets' },
      }),
      prisma.category.create({
        data: { name: 'Software', description: 'Software licenses and subscriptions' },
      }),
      prisma.category.create({
        data: { name: 'Consulting', description: 'Professional consulting services' },
      }),
      prisma.category.create({
        data: { name: 'Hardware', description: 'Computer hardware and components' },
      }),
    ]);

    // Create products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Wireless Headphones',
          sku: 'WH-001',
          description: 'Premium wireless headphones with noise cancellation',
          categoryId: categories[0].id,
          price: 299.99,
          stock: 45,
        },
      }),
      prisma.product.create({
        data: {
          name: 'Business Software License',
          sku: 'BSL-002',
          description: 'Annual business software license',
          categoryId: categories[1].id,
          price: 999.00,
          stock: 0, // Digital product
        },
      }),
      prisma.product.create({
        data: {
          name: 'IT Consulting',
          sku: 'ITC-003',
          description: 'Professional IT consulting service per hour',
          categoryId: categories[2].id,
          price: 150.00,
          stock: 0, // Service
        },
      }),
      prisma.product.create({
        data: {
          name: 'Laptop Computer',
          sku: 'LAP-004',
          description: 'High-performance business laptop',
          categoryId: categories[3].id,
          price: 1299.99,
          stock: 8,
        },
      }),
    ]);

    // Create customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'Acme Corporation',
          email: 'contact@acme.com',
          phone: '+1-555-0101',
          address: '123 Business St',
          company: 'Acme Corp',
        },
      }),
      prisma.customer.create({
        data: {
          name: 'TechStart Inc',
          email: 'hello@techstart.com',
          phone: '+1-555-0202',
          address: '456 Innovation Ave',
          company: 'TechStart Inc',
        },
      }),
      prisma.customer.create({
        data: {
          name: 'Global Solutions Ltd',
          email: 'info@globalsolutions.com',
          phone: '+44-20-7123-4567',
          address: '789 Corporate Blvd',
          company: 'Global Solutions Ltd',
        },
      }),
      prisma.customer.create({
        data: {
          name: 'StartUp Ventures',
          email: 'team@startupventures.com',
          phone: '+1-555-0404',
          address: '321 Startup Lane',
          company: 'StartUp Ventures',
        },
      }),
    ]);

    // Create invoices
    const invoices = await Promise.all([
      prisma.invoice.create({
        data: {
          number: 'INV-0001',
          customerId: customers[0].id,
          subtotal: 2399.95,
          tax: 191.99,
          total: 2591.94,
          status: 'PAID',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: {
            create: [
              {
                productId: products[0].id,
                quantity: 8,
                price: 299.99,
                total: 2399.92,
              },
            ],
          },
        },
      }),
      prisma.invoice.create({
        data: {
          number: 'INV-0002',
          customerId: customers[1].id,
          subtotal: 999.00,
          tax: 79.92,
          total: 978.92,
          status: 'SENT',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          items: {
            create: [
              {
                productId: products[1].id,
                quantity: 1,
                price: 999.00,
                total: 999.00,
              },
            ],
          },
        },
      }),
    ]);

    // Payment tracking would be handled separately in a real system

    // Create leads
    const leads = await Promise.all([
      prisma.lead.create({
        data: {
          name: 'Enterprise Software Implementation',
          email: 'enterprise@globalsolutions.com',
          phone: '+44-20-7123-4567',
          company: 'Global Solutions Ltd',
          value: 50000,
          status: 'PROPOSAL',
          source: 'Referral',
          customerId: customers[2].id,
        },
      }),
      prisma.lead.create({
        data: {
          name: 'IT Consulting Contract',
          email: 'team@startupventures.com',
          phone: '+1-555-0404',
          company: 'StartUp Ventures',
          value: 25000,
          status: 'QUALIFIED',
          source: 'Website',
          customerId: customers[3].id,
        },
      }),
      prisma.lead.create({
        data: {
          name: 'Hardware Upgrade Project',
          email: 'procurement@newcompany.com',
          phone: '+1-555-0505',
          company: 'New Company Inc',
          value: 75000,
          status: 'NEW',
          source: 'Cold Call',
        },
      }),
    ]);

    // Create some interactions
    await Promise.all([
      prisma.interaction.create({
        data: {
          leadId: leads[0].id,
          type: 'CALL',
          subject: 'Follow-up on recent purchase',
          description: 'Called to ensure customer satisfaction with recent headphone purchase.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.interaction.create({
        data: {
          leadId: leads[1].id,
          type: 'EMAIL',
          subject: 'Software license renewal reminder',
          description: 'Sent email reminder about upcoming software license renewal.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Stock movements would be tracked separately in a real system

    console.log('Database seeding completed successfully!');

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        users: 3,
        categories: categories.length,
        products: products.length,
        customers: customers.length,
        invoices: invoices.length,
        leads: 3,
        interactions: 2,
      },
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}