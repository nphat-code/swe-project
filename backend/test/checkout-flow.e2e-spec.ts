import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentStatus, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string | null;
  role: Role;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredSize {
  id: string;
  name: string;
  code: string;
  extraPrice: number;
  isDefault: boolean;
  productId: string;
}

interface StoredProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  isAvailable: boolean;
  stock: number;
  version: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredTopping {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredVoucher {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderAmount: number;
  isActive: boolean;
  validUntil: Date | null;
  createdAt: Date;
}

interface StoredOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  note: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  toppings: Prisma.JsonValue;
  createdAt: Date;
}

interface StoredPayment {
  id: string;
  orderId: string;
  idempotencyKey: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionId: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

class InMemoryE2EPrisma {
  users: StoredUser[] = [];
  categories: StoredCategory[] = [];
  products: StoredProduct[] = [];
  sizes: StoredSize[] = [];
  toppings: StoredTopping[] = [];
  vouchers: StoredVoucher[] = [];
  orders: StoredOrder[] = [];
  orderItems: StoredOrderItem[] = [];
  payments: StoredPayment[] = [];
  shouldFailHealthPing = false;

  private txChain: Promise<unknown> = Promise.resolve();

  private createP2002Error(target: string[]): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '6.19.3',
      meta: { target },
    });
  }

  private cloneOrderWithDetails(order: StoredOrder) {
    return {
      ...order,
      items: this.orderItems.filter((item) => item.orderId === order.id).map((item) => ({ ...item })),
      payments: this.payments
        .filter((payment) => payment.orderId === order.id)
        .map((payment) => ({ ...payment })),
    };
  }

  private pickUser(user: StoredUser, select?: Record<string, boolean>) {
    if (!select) {
      return { ...user };
    }
    const result: Record<string, unknown> = {};
    for (const [key, enabled] of Object.entries(select)) {
      if (enabled && key in user) {
        result[key] = user[key as keyof StoredUser];
      }
    }
    return result;
  }

  $queryRaw = async () => {
    if (this.shouldFailHealthPing) {
      throw new Error('E2E simulated database outage');
    }
    return [{ '?column?': 1 }];
  };

  $connect = async () => undefined;
  $disconnect = async () => undefined;

  user = {
    findUnique: async (args: { where: { id?: string; email?: string }; select?: Record<string, boolean> }) => {
      const found = this.users.find(
        (u) =>
          (args.where.id && u.id === args.where.id) ||
          (args.where.email && u.email === args.where.email),
      );
      return found ? this.pickUser(found, args.select) : null;
    },
    create: async (args: {
      data: { email: string; password: string; fullName: string; phone?: string | null; role?: Role };
      select?: Record<string, boolean>;
    }) => {
      if (this.users.some((u) => u.email === args.data.email)) {
        throw this.createP2002Error(['email']);
      }
      const now = new Date();
      const created: StoredUser = {
        id: randomUUID(),
        email: args.data.email,
        password: args.data.password,
        fullName: args.data.fullName,
        phone: args.data.phone ?? null,
        role: args.data.role ?? Role.CUSTOMER,
        loyaltyPoints: 0,
        createdAt: now,
        updatedAt: now,
      };
      this.users.push(created);
      return this.pickUser(created, args.select);
    },
    update: async (args: {
      where: { id: string };
      data: { loyaltyPoints?: { increment?: number } };
      select?: { loyaltyPoints: boolean };
    }) => {
      const user = this.users.find((u) => u.id === args.where.id);
      if (!user) {
        throw new Error('User not found');
      }
      if (args.data.loyaltyPoints?.increment !== undefined) {
        user.loyaltyPoints += args.data.loyaltyPoints.increment;
      }
      user.updatedAt = new Date();
      if (args.select?.loyaltyPoints) {
        return { loyaltyPoints: user.loyaltyPoints };
      }
      return { ...user };
    },
  };

  category = {
    findMany: async () =>
      this.categories
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((category) => ({
          ...category,
          _count: {
            products: this.products.filter((p) => p.categoryId === category.id).length,
          },
        })),
  };

  product = {
    findMany: async (args: {
      where?: {
        id?: { in?: string[] };
        isAvailable?: boolean;
        category?: { slug?: string };
      };
    }) => {
      let filtered = this.products.slice();
      if (args.where?.isAvailable !== undefined) {
        filtered = filtered.filter((p) => p.isAvailable === args.where?.isAvailable);
      }
      if (args.where?.id?.in) {
        const ids = args.where.id.in;
        filtered = filtered.filter((p) => ids.includes(p.id));
      }
      if (args.where?.category?.slug) {
        const cat = this.categories.find((c) => c.slug === args.where?.category?.slug);
        filtered = cat ? filtered.filter((p) => p.categoryId === cat.id) : [];
      }
      return filtered.map((product) => ({
        ...product,
        category: this.categories.find((c) => c.id === product.categoryId),
        sizes: this.sizes
          .filter((s) => s.productId === product.id)
          .sort((a, b) => a.extraPrice - b.extraPrice)
          .map((s) => ({ ...s })),
      }));
    },
    findUnique: async (args: { where: { id: string } }) => {
      const product = this.products.find((p) => p.id === args.where.id);
      if (!product) {
        return null;
      }
      return {
        ...product,
        category: this.categories.find((c) => c.id === product.categoryId),
        sizes: this.sizes
          .filter((s) => s.productId === product.id)
          .sort((a, b) => a.extraPrice - b.extraPrice)
          .map((s) => ({ ...s })),
      };
    },
    updateMany: async (args: {
      where: {
        id: string;
        isAvailable?: boolean;
        version?: number;
        stock?: { gte?: number };
      };
      data: {
        stock?: { decrement?: number };
        version?: { increment?: number };
      };
    }) => {
      const product = this.products.find((p) => p.id === args.where.id);
      if (!product) {
        return { count: 0 };
      }
      if (args.where.isAvailable !== undefined && product.isAvailable !== args.where.isAvailable) {
        return { count: 0 };
      }
      if (args.where.version !== undefined && product.version !== args.where.version) {
        return { count: 0 };
      }
      if (args.where.stock?.gte !== undefined && product.stock < args.where.stock.gte) {
        return { count: 0 };
      }
      if (args.data.stock?.decrement !== undefined) {
        product.stock -= args.data.stock.decrement;
      }
      if (args.data.version?.increment !== undefined) {
        product.version += args.data.version.increment;
      }
      product.updatedAt = new Date();
      return { count: 1 };
    },
    update: async (args: {
      where: { id: string };
      data: { stock?: { increment?: number }; version?: { increment?: number } };
    }) => {
      const product = this.products.find((p) => p.id === args.where.id);
      if (!product) {
        throw new Error('Product not found');
      }
      if (args.data.stock?.increment !== undefined) {
        product.stock += args.data.stock.increment;
      }
      if (args.data.version?.increment !== undefined) {
        product.version += args.data.version.increment;
      }
      product.updatedAt = new Date();
      return { ...product };
    },
  };

  topping = {
    findMany: async (args: { where?: { id?: { in?: string[] }; isAvailable?: boolean } }) =>
      this.toppings
        .filter((t) => {
          if (args.where?.isAvailable !== undefined && t.isAvailable !== args.where.isAvailable) {
            return false;
          }
          if (args.where?.id?.in && !args.where.id.in.includes(t.id)) {
            return false;
          }
          return true;
        })
        .sort((a, b) => a.price - b.price)
        .map((t) => ({ ...t })),
  };

  voucher = {
    findUnique: async (args: { where: { code: string } }) => {
      const found = this.vouchers.find((v) => v.code === args.where.code);
      return found ? { ...found } : null;
    },
  };

  order = {
    create: async (args: {
      data: {
        orderNumber: string;
        userId: string;
        customerName: string;
        customerPhone: string;
        note: string | null;
        status: OrderStatus;
        paymentStatus: PaymentStatus;
        paymentMethod: string;
        totalAmount: number;
        discountAmount: number;
        finalAmount: number;
        items: {
          create: Array<{
            productId: string;
            productName: string;
            sizeName: string;
            unitPrice: number;
            quantity: number;
            subtotal: number;
            toppings: Prisma.InputJsonValue;
          }>;
        };
      };
    }) => {
      if (this.orders.some((o) => o.orderNumber === args.data.orderNumber)) {
        throw this.createP2002Error(['orderNumber']);
      }
      const now = new Date();
      const createdOrder: StoredOrder = {
        id: randomUUID(),
        orderNumber: args.data.orderNumber,
        userId: args.data.userId,
        customerName: args.data.customerName,
        customerPhone: args.data.customerPhone,
        note: args.data.note,
        status: args.data.status,
        paymentStatus: args.data.paymentStatus,
        paymentMethod: args.data.paymentMethod,
        totalAmount: args.data.totalAmount,
        discountAmount: args.data.discountAmount,
        finalAmount: args.data.finalAmount,
        idempotencyKey: null,
        createdAt: now,
        updatedAt: now,
      };
      this.orders.push(createdOrder);
      for (const itemData of args.data.items.create) {
        this.orderItems.push({
          id: randomUUID(),
          orderId: createdOrder.id,
          productId: itemData.productId,
          productName: itemData.productName,
          sizeName: itemData.sizeName,
          unitPrice: itemData.unitPrice,
          quantity: itemData.quantity,
          subtotal: itemData.subtotal,
          toppings: itemData.toppings as Prisma.JsonValue,
          createdAt: now,
        });
      }
      return this.cloneOrderWithDetails(createdOrder);
    },
    findMany: async (args: { where: { userId: string } }) =>
      this.orders
        .filter((o) => o.userId === args.where.userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((o) => this.cloneOrderWithDetails(o)),
    findUnique: async (args: { where: { id: string } }) => {
      const found = this.orders.find((o) => o.id === args.where.id);
      return found ? this.cloneOrderWithDetails(found) : null;
    },
    findUniqueOrThrow: async (args: { where: { id: string } }) => {
      const found = this.orders.find((o) => o.id === args.where.id);
      if (!found) {
        throw new Error('Order not found');
      }
      return this.cloneOrderWithDetails(found);
    },
    updateMany: async (args: {
      where: {
        id: string;
        status?: OrderStatus | { in: OrderStatus[] };
        paymentStatus?: PaymentStatus | { not: PaymentStatus };
      };
      data: {
        status?: OrderStatus;
        paymentStatus?: PaymentStatus;
        paymentMethod?: string;
        idempotencyKey?: string;
      };
    }) => {
      const order = this.orders.find((o) => o.id === args.where.id);
      if (!order) {
        return { count: 0 };
      }
      if (args.where.status) {
        if (typeof args.where.status === 'string') {
          if (order.status !== args.where.status) {
            return { count: 0 };
          }
        } else if (!args.where.status.in.includes(order.status)) {
          return { count: 0 };
        }
      }
      if (args.where.paymentStatus) {
        if (typeof args.where.paymentStatus === 'string') {
          if (order.paymentStatus !== args.where.paymentStatus) {
            return { count: 0 };
          }
        } else if (order.paymentStatus === args.where.paymentStatus.not) {
          return { count: 0 };
        }
      }
      if (args.data.status !== undefined) {
        order.status = args.data.status;
      }
      if (args.data.paymentStatus !== undefined) {
        order.paymentStatus = args.data.paymentStatus;
      }
      if (args.data.paymentMethod !== undefined) {
        order.paymentMethod = args.data.paymentMethod;
      }
      if (args.data.idempotencyKey !== undefined) {
        if (
          this.orders.some(
            (existing) =>
              existing.id !== order.id && existing.idempotencyKey === args.data.idempotencyKey,
          )
        ) {
          throw this.createP2002Error(['idempotencyKey']);
        }
        order.idempotencyKey = args.data.idempotencyKey;
      }
      order.updatedAt = new Date();
      return { count: 1 };
    },
  };

  payment = {
    findUnique: async (args: { where: { idempotencyKey: string } }) => {
      const payment = this.payments.find((p) => p.idempotencyKey === args.where.idempotencyKey);
      if (!payment) {
        return null;
      }
      const order = this.orders.find((o) => o.id === payment.orderId);
      if (!order) {
        throw new Error('Order not found for payment');
      }
      return {
        ...payment,
        order: this.cloneOrderWithDetails(order),
      };
    },
    create: async (args: {
      data: {
        orderId: string;
        idempotencyKey: string;
        amount: number;
        method: string;
        status: PaymentStatus;
        transactionId: string | null;
        paidAt: Date | null;
      };
    }) => {
      if (this.payments.some((p) => p.idempotencyKey === args.data.idempotencyKey)) {
        throw this.createP2002Error(['idempotencyKey']);
      }
      const created: StoredPayment = {
        id: randomUUID(),
        orderId: args.data.orderId,
        idempotencyKey: args.data.idempotencyKey,
        amount: args.data.amount,
        method: args.data.method,
        status: args.data.status,
        transactionId: args.data.transactionId,
        paidAt: args.data.paidAt,
        createdAt: new Date(),
      };
      this.payments.push(created);
      return { ...created };
    },
  };

  $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const usersSnap = this.users.map((u) => ({ ...u }));
      const productsSnap = this.products.map((p) => ({ ...p }));
      const ordersSnap = this.orders.map((o) => ({ ...o }));
      const paymentsSnap = this.payments.map((p) => ({ ...p }));
      try {
        return await fn(this);
      } catch (error) {
        this.users = usersSnap;
        this.products = productsSnap;
        this.orders = ordersSnap;
        this.payments = paymentsSnap;
        throw error;
      }
    };

    const next = this.txChain.then(run, run);
    this.txChain = next.catch(() => undefined);
    return next;
  }
}

describe('BrewLite Full End-to-End HTTP Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: InMemoryE2EPrisma;
  let productId: string;
  let sizeLId: string;
  let toppingId: string;

  beforeAll(async () => {
    prisma = new InMemoryE2EPrisma();
    const now = new Date();
    const categoryId = 'cat-e2e-1';
    productId = 'prod-e2e-1';
    sizeLId = 'size-e2e-l';
    toppingId = 'top-e2e-1';

    prisma.categories.push({
      id: categoryId,
      name: 'Cà phê Pha Máy',
      slug: 'ca-phe-may',
      description: 'Espresso hiện đại',
      imageUrl: null,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
    });

    prisma.products.push({
      id: productId,
      name: 'Caramel Macchiato E2E',
      slug: 'caramel-macchiato-e2e',
      description: 'Espresso với caramel thơm ngậy',
      basePrice: 40000,
      imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2',
      isAvailable: true,
      stock: 20,
      version: 1,
      categoryId,
      createdAt: now,
      updatedAt: now,
    });

    prisma.sizes.push(
      {
        id: 'size-e2e-s',
        name: 'Nhỏ (S)',
        code: 'S',
        extraPrice: 0,
        isDefault: true,
        productId,
      },
      {
        id: sizeLId,
        name: 'Lớn (L)',
        code: 'L',
        extraPrice: 10000,
        isDefault: false,
        productId,
      },
    );

    prisma.toppings.push({
      id: toppingId,
      name: 'Trân châu hoàng kim',
      price: 10000,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    });

    prisma.vouchers.push({
      id: 'voucher-e2e-1',
      code: 'BREWLITEFIRST',
      description: 'Giảm 20%',
      discountPercent: 20,
      maxDiscount: 30000,
      minOrderAmount: 40000,
      isActive: true,
      validUntil: null,
      createdAt: now,
    });

    const staffPasswordHash = await bcrypt.hash('BrewLite@2026', 10);
    prisma.users.push({
      id: 'staff-e2e-1',
      email: 'barista@brewlite.vn',
      password: staffPasswordHash,
      fullName: 'Barista E2E',
      phone: '0909876543',
      role: Role.STAFF,
      loyaltyPoints: 0,
      createdAt: now,
      updatedAt: now,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('executes full journey: health -> menu -> auth -> voucher -> order -> payment retry & idempotency -> order confirmation -> state machine', async () => {
    const server = app.getHttpServer();

    const healthRes = await request(server).get('/health').expect(200);
    expect(healthRes.body.status).toBe('ok');
    expect(healthRes.body.database.status).toBe('up');
    expect(typeof healthRes.body.database.latencyMs).toBe('number');

    prisma.shouldFailHealthPing = true;
    await request(server).get('/health').expect(503);
    prisma.shouldFailHealthPing = false;

    const menuRes = await request(server).get('/products').expect(200);
    expect(menuRes.body).toHaveLength(1);
    expect(menuRes.body[0].name).toBe('Caramel Macchiato E2E');

    const detailRes = await request(server).get(`/products/${productId}`).expect(200);
    expect(detailRes.body.sizes).toHaveLength(2);
    expect(detailRes.body.availableToppings).toHaveLength(1);

    await request(server)
      .post('/orders')
      .send({
        items: [{ productId, sizeId: sizeLId, toppingIds: [toppingId], quantity: 2 }],
      })
      .expect(401);

    const registerRes = await request(server)
      .post('/auth/register')
      .send({
        email: 'e2e-customer@brewlite.vn',
        password: 'Password@123',
        fullName: 'Khách Hàng E2E',
        phone: '0901112223',
      })
      .expect(201);

    const customerToken = registerRes.body.accessToken as string;
    expect(customerToken).toBeTruthy();

    const voucherRes = await request(server)
      .get('/vouchers/validate?code=BREWLITEFIRST&subtotal=120000')
      .expect(200);
    expect(voucherRes.body.code).toBe('BREWLITEFIRST');
    expect(voucherRes.body.discountPercent).toBe(20);
    expect(voucherRes.body.maxDiscount).toBe(30000);
    expect(voucherRes.body.isActive).toBe(true);

    const orderRes = await request(server)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            productId,
            sizeId: sizeLId,
            toppingIds: [toppingId],
            quantity: 2,
          },
        ],
        voucherCode: 'BREWLITEFIRST',
        paymentMethod: 'WALLET',
      })
      .expect(201);

    const orderId = orderRes.body.id as string;
    expect(orderRes.body.orderNumber).toMatch(/^#\d{6}$/);
    expect(orderRes.body.status).toBe('PENDING');
    expect(orderRes.body.totalAmount).toBe(120000);
    expect(orderRes.body.discountAmount).toBe(24000);
    expect(orderRes.body.finalAmount).toBe(96000);

    const failPayRes = await request(server)
      .post('/payments')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('Idempotency-Key', 'e2e-idem-fail-1')
      .send({
        orderId,
        method: 'WALLET',
        simulateFailure: true,
      })
      .expect(200);

    expect(failPayRes.body.success).toBe(false);
    expect(failPayRes.body.order.status).toBe('PAYMENT_FAILED');
    expect(prisma.products[0].stock).toBe(20);

    const successPayRes = await request(server)
      .post('/payments')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('Idempotency-Key', 'e2e-idem-paid-2')
      .send({
        orderId,
        method: 'WALLET',
      })
      .expect(200);

    expect(successPayRes.body.success).toBe(true);
    expect(successPayRes.body.idempotentReplay).toBe(false);
    expect(successPayRes.body.order.status).toBe('PAID');
    expect(successPayRes.body.loyaltyPointsEarned).toBe(9);
    expect(successPayRes.body.loyaltyPointsBalance).toBe(9);
    expect(prisma.products[0].stock).toBe(18);

    const replayRes = await request(server)
      .post('/payments')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('Idempotency-Key', 'e2e-idem-paid-2')
      .send({
        orderId,
        method: 'WALLET',
      })
      .expect(200);

    expect(replayRes.body.idempotentReplay).toBe(true);
    expect(prisma.products[0].stock).toBe(18);
    expect(prisma.payments).toHaveLength(2);

    const historyRes = await request(server)
      .get('/orders/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(historyRes.body).toHaveLength(1);
    expect(historyRes.body[0].id).toBe(orderId);
    expect(historyRes.body[0].status).toBe('PAID');

    await request(server)
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'COMPLETED' })
      .expect(403);

    const staffLoginRes = await request(server)
      .post('/auth/login')
      .send({
        email: 'barista@brewlite.vn',
        password: 'BrewLite@2026',
      })
      .expect(200);
    const staffToken = staffLoginRes.body.accessToken as string;

    await request(server)
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'PREPARING' })
      .expect(200);

    await request(server)
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'READY' })
      .expect(200);

    const completedRes = await request(server)
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'COMPLETED' })
      .expect(200);
    expect(completedRes.body.status).toBe('COMPLETED');

    await request(server)
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'CANCELLED' })
      .expect(400);
  });
});

