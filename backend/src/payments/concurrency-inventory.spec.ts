import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentStatus, Prisma, Role } from '@prisma/client';
import { SafeUser } from '../auth/types/auth.types';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { PaymentsService } from './payments.service';

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
  toppings: Prisma.JsonValue | null;
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

class InMemoryTransactionalPrisma {
  readonly users = new Map<string, StoredUser>();
  readonly products = new Map<string, StoredProduct>();
  readonly sizes: StoredSize[] = [];
  readonly toppings = new Map<string, StoredTopping>();
  readonly vouchers = new Map<string, StoredVoucher>();
  readonly orders = new Map<string, StoredOrder>();
  readonly orderItems: StoredOrderItem[] = [];
  readonly payments = new Map<string, StoredPayment>();

  private rowLockChains = new Map<string, Promise<void>>();
  private idCounter = 1;

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${this.idCounter}`;
  }

  private async yieldTick(): Promise<void> {
    await new Promise<void>((resolve) => setImmediate(resolve));
  }

  private async acquireRowLock(
    txHeldLocks: Map<string, () => void>,
    lockKey: string,
  ): Promise<void> {
    if (txHeldLocks.has(lockKey)) {
      return;
    }

    const previous = this.rowLockChains.get(lockKey) ?? Promise.resolve();
    let releaseCurrent!: () => void;
    const current = new Promise<void>((resolve) => {
      releaseCurrent = resolve;
    });
    const nextChain = previous.then(() => current);
    this.rowLockChains.set(lockKey, nextChain);

    await previous;
    txHeldLocks.set(lockKey, () => {
      releaseCurrent();
      if (this.rowLockChains.get(lockKey) === nextChain) {
        this.rowLockChains.delete(lockKey);
      }
    });
  }

  private createClientSlice(txContext?: {
    heldLocks: Map<string, () => void>;
    undoStack: Array<() => void>;
  }) {
    const hydrateOrder = (order: StoredOrder) => ({
      ...order,
      items: this.orderItems.filter((item) => item.orderId === order.id).map((item) => ({ ...item })),
      payments: Array.from(this.payments.values())
        .filter((payment) => payment.orderId === order.id)
        .map((payment) => ({ ...payment })),
    });

    const lockIfInTx = async (lockKey: string) => {
      if (txContext) {
        await this.acquireRowLock(txContext.heldLocks, lockKey);
      }
    };

    const recordUndo = (undoFn: () => void) => {
      if (txContext) {
        txContext.undoStack.push(undoFn);
      }
    };

    return {
      product: {
        findMany: async (args: {
          where: { id: { in: string[] } };
          include?: { sizes?: boolean };
        }) => {
          await this.yieldTick();
          return Array.from(this.products.values())
            .filter((product) => args.where.id.in.includes(product.id))
            .map((product) => ({
              ...product,
              ...(args.include?.sizes
                ? {
                    sizes: this.sizes
                      .filter((size) => size.productId === product.id)
                      .map((size) => ({ ...size })),
                  }
                : {}),
            }));
        },
        update: async (args: {
          where: { id: string };
          data: { stock?: { increment?: number }; version?: { increment?: number } };
        }) => {
          await lockIfInTx(`product:${args.where.id}`);
          const product = this.products.get(args.where.id);
          if (!product) {
            throw new Error(`Product ${args.where.id} not found`);
          }
          const prev = { ...product };
          recordUndo(() => {
            this.products.set(prev.id, prev);
          });
          const next: StoredProduct = {
            ...product,
            stock: product.stock + (args.data.stock?.increment ?? 0),
            version: product.version + (args.data.version?.increment ?? 0),
            updatedAt: new Date(),
          };
          this.products.set(next.id, next);
          return { ...next };
        },
        updateMany: async (args: {
          where: {
            id: string;
            isAvailable?: boolean;
            version?: number;
            stock?: { gte: number };
          };
          data: {
            stock?: { decrement?: number };
            version?: { increment?: number };
          };
        }) => {
          await lockIfInTx(`product:${args.where.id}`);
          const product = this.products.get(args.where.id);
          if (!product) {
            return { count: 0 };
          }
          if (
            args.where.isAvailable !== undefined &&
            product.isAvailable !== args.where.isAvailable
          ) {
            return { count: 0 };
          }
          if (args.where.version !== undefined && product.version !== args.where.version) {
            return { count: 0 };
          }
          if (args.where.stock?.gte !== undefined && product.stock < args.where.stock.gte) {
            return { count: 0 };
          }

          const prev = { ...product };
          recordUndo(() => {
            this.products.set(prev.id, prev);
          });
          const next: StoredProduct = {
            ...product,
            stock: product.stock - (args.data.stock?.decrement ?? 0),
            version: product.version + (args.data.version?.increment ?? 0),
            updatedAt: new Date(),
          };
          this.products.set(next.id, next);
          return { count: 1 };
        },
      },
      topping: {
        findMany: async (args: {
          where: { id: { in: string[] }; isAvailable?: boolean };
        }) => {
          await this.yieldTick();
          return Array.from(this.toppings.values())
            .filter(
              (topping) =>
                args.where.id.in.includes(topping.id) &&
                (args.where.isAvailable === undefined ||
                  topping.isAvailable === args.where.isAvailable),
            )
            .map((topping) => ({ ...topping }));
        },
      },
      voucher: {
        findUnique: async (args: { where: { code: string } }) => {
          await this.yieldTick();
          const voucher = this.vouchers.get(args.where.code);
          return voucher ? { ...voucher } : null;
        },
      },
      user: {
        findUnique: async (args: {
          where: { id: string };
          select?: { loyaltyPoints?: boolean };
        }) => {
          await this.yieldTick();
          const user = this.users.get(args.where.id);
          if (!user) {
            return null;
          }
          if (args.select?.loyaltyPoints) {
            return { loyaltyPoints: user.loyaltyPoints };
          }
          return { ...user };
        },
        update: async (args: {
          where: { id: string };
          data: { loyaltyPoints: { increment: number } };
          select?: { loyaltyPoints?: boolean };
        }) => {
          await lockIfInTx(`user:${args.where.id}`);
          const user = this.users.get(args.where.id);
          if (!user) {
            throw new Error(`User ${args.where.id} not found`);
          }
          const prev = { ...user };
          recordUndo(() => {
            this.users.set(prev.id, prev);
          });
          const next: StoredUser = {
            ...user,
            loyaltyPoints: user.loyaltyPoints + args.data.loyaltyPoints.increment,
            updatedAt: new Date(),
          };
          this.users.set(next.id, next);
          if (args.select?.loyaltyPoints) {
            return { loyaltyPoints: next.loyaltyPoints };
          }
          return { ...next };
        },
      },
      order: {
        create: async (args: {
          data: {
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
          await this.yieldTick();
          const orderId = this.nextId('order');
          const now = new Date();
          const order: StoredOrder = {
            id: orderId,
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
          this.orders.set(orderId, order);
          for (const item of args.data.items.create) {
            this.orderItems.push({
              id: this.nextId('item'),
              orderId,
              productId: item.productId,
              productName: item.productName,
              sizeName: item.sizeName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,
              toppings: item.toppings as Prisma.JsonValue,
              createdAt: now,
            });
          }
          return hydrateOrder(order);
        },
        findMany: async (args: { where: { userId: string } }) => {
          await this.yieldTick();
          return Array.from(this.orders.values())
            .filter((order) => order.userId === args.where.userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map(hydrateOrder);
        },
        findUnique: async (args: { where: { id: string } }) => {
          await this.yieldTick();
          const order = this.orders.get(args.where.id);
          return order ? hydrateOrder(order) : null;
        },
        findUniqueOrThrow: async (args: { where: { id: string } }) => {
          const order = this.orders.get(args.where.id);
          if (!order) {
            throw new Error(`Order ${args.where.id} not found`);
          }
          return hydrateOrder(order);
        },
        updateMany: async (args: {
          where: { id: string; status: OrderStatus };
          data: {
            status?: OrderStatus;
            paymentStatus?: PaymentStatus;
            paymentMethod?: string;
            idempotencyKey?: string;
          };
        }) => {
          await lockIfInTx(`order:${args.where.id}`);
          const order = this.orders.get(args.where.id);
          if (!order || order.status !== args.where.status) {
            return { count: 0 };
          }
          const prev = { ...order };
          recordUndo(() => {
            this.orders.set(prev.id, prev);
          });
          const next: StoredOrder = {
            ...order,
            status: args.data.status ?? order.status,
            paymentStatus: args.data.paymentStatus ?? order.paymentStatus,
            paymentMethod: args.data.paymentMethod ?? order.paymentMethod,
            idempotencyKey: args.data.idempotencyKey ?? order.idempotencyKey,
            updatedAt: new Date(),
          };
          this.orders.set(next.id, next);
          return { count: 1 };
        },
      },
      payment: {
        findUnique: async (args: {
          where: { idempotencyKey: string };
          include?: { order?: { include?: { user?: { select?: { loyaltyPoints?: boolean } } } } };
        }) => {
          await this.yieldTick();
          const matched = Array.from(this.payments.values()).find(
            (payment) => payment.idempotencyKey === args.where.idempotencyKey,
          );
          if (!matched) {
            return null;
          }
          const order = this.orders.get(matched.orderId);
          if (!order) {
            return null;
          }
          const owner = order.userId ? this.users.get(order.userId) : null;
          return {
            ...matched,
            order: {
              ...hydrateOrder(order),
              user: owner ? { loyaltyPoints: owner.loyaltyPoints } : null,
            },
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
          await lockIfInTx(`payment-key:${args.data.idempotencyKey}`);
          const duplicate = Array.from(this.payments.values()).find(
            (payment) => payment.idempotencyKey === args.data.idempotencyKey,
          );
          if (duplicate) {
            throw new Prisma.PrismaClientKnownRequestError(
              'Unique constraint failed on the fields: (`idempotencyKey`)',
              {
                code: 'P2002',
                clientVersion: '6.19.3',
                meta: { target: ['idempotencyKey'] },
              },
            );
          }
          const payment: StoredPayment = {
            id: this.nextId('payment'),
            orderId: args.data.orderId,
            idempotencyKey: args.data.idempotencyKey,
            amount: args.data.amount,
            method: args.data.method,
            status: args.data.status,
            transactionId: args.data.transactionId,
            paidAt: args.data.paidAt,
            createdAt: new Date(),
          };
          this.payments.set(payment.id, payment);
          recordUndo(() => {
            this.payments.delete(payment.id);
          });
          return { ...payment };
        },
      },
    };
  }

  readonly product = this.createClientSlice().product;
  readonly topping = this.createClientSlice().topping;
  readonly voucher = this.createClientSlice().voucher;
  readonly user = this.createClientSlice().user;
  readonly order = this.createClientSlice().order;
  readonly payment = this.createClientSlice().payment;

  async $transaction<T>(callback: (tx: ReturnType<InMemoryTransactionalPrisma['createClientSlice']>) => Promise<T>): Promise<T> {
    const heldLocks = new Map<string, () => void>();
    const undoStack: Array<() => void> = [];
    const txClient = this.createClientSlice({ heldLocks, undoStack });

    try {
      return await callback(txClient);
    } catch (error) {
      for (let i = undoStack.length - 1; i >= 0; i -= 1) {
        undoStack[i]();
      }
      throw error;
    } finally {
      for (const release of heldLocks.values()) {
        release();
      }
    }
  }
}

describe('Task 10 Integration Proofs (State Machine, Idempotency & Concurrency Optimistic Locking)', () => {
  let db: InMemoryTransactionalPrisma;
  let ordersService: OrdersService;
  let paymentsService: PaymentsService;

  const customers: SafeUser[] = Array.from({ length: 8 }, (_, idx) => ({
    id: `user-${idx + 1}`,
    email: `customer${idx + 1}@brewlite.vn`,
    fullName: `Khách hàng ${idx + 1}`,
    phone: `090000000${idx + 1}`,
    role: Role.CUSTOMER,
    loyaltyPoints: 0,
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
  }));

  const baristaUser: SafeUser = {
    id: 'user-barista',
    email: 'barista@brewlite.vn',
    fullName: 'Trần Pha Chế',
    phone: '0909876543',
    role: Role.STAFF,
    loyaltyPoints: 0,
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    db = new InMemoryTransactionalPrisma();
    for (const cust of customers) {
      db.users.set(cust.id, {
        ...cust,
        password: 'hash',
        updatedAt: new Date(),
      });
    }

    db.products.set('prod-coffee', {
      id: 'prod-coffee',
      name: 'Cà Phê Sữa Đá Sài Gòn',
      slug: 'ca-phe-sua-da-sai-gon',
      description: 'Cà phê phin đậm đà',
      basePrice: 35000,
      imageUrl: 'https://example.com/coffee.jpg',
      isAvailable: true,
      stock: 3,
      version: 1,
      categoryId: 'cat-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    db.products.set('prod-matcha', {
      id: 'prod-matcha',
      name: 'Matcha Đá Xay',
      slug: 'matcha-da-xay',
      description: 'Trà xanh Nhật',
      basePrice: 50000,
      imageUrl: 'https://example.com/matcha.jpg',
      isAvailable: true,
      stock: 2,
      version: 1,
      categoryId: 'cat-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    db.sizes.push(
      {
        id: 'size-coffee-m',
        name: 'Vừa (M)',
        code: 'M',
        extraPrice: 5000,
        isDefault: true,
        productId: 'prod-coffee',
      },
      {
        id: 'size-matcha-s',
        name: 'Nhỏ (S)',
        code: 'S',
        extraPrice: 0,
        isDefault: true,
        productId: 'prod-matcha',
      },
    );

    db.vouchers.set('BREWLITEFIRST', {
      id: 'voucher-1',
      code: 'BREWLITEFIRST',
      description: 'Giảm 20%',
      discountPercent: 20,
      maxDiscount: 30000,
      minOrderAmount: 30000,
      isActive: true,
      validUntil: null,
      createdAt: new Date(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        PaymentsService,
        VouchersService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  it('(a) enforces end-to-end State Machine transitions across payment retry, Barista fulfillment, and PAID cancellation stock restore', async () => {
    const order = await ordersService.createOrder(customers[0], {
      items: [{ productId: 'prod-coffee', sizeCode: 'M', quantity: 2 }],
      voucherCode: 'BREWLITEFIRST',
    });
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.totalAmount).toBe(80000);
    expect(order.finalAmount).toBe(64000);

    await expect(
      ordersService.updateOrderStatus(order.id, OrderStatus.COMPLETED, baristaUser),
    ).rejects.toThrow(BadRequestException);

    const failedPayment = await paymentsService.processPayment(
      customers[0],
      { orderId: order.id, method: 'CARD', simulateFailure: true },
      'state-fail-key-1',
    );
    expect(failedPayment.order.status).toBe(OrderStatus.PAYMENT_FAILED);
    expect(db.products.get('prod-coffee')?.stock).toBe(3);

    const paidPayment = await paymentsService.processPayment(
      customers[0],
      { orderId: order.id, method: 'WALLET', simulateFailure: false },
      'state-ok-key-2',
    );
    expect(paidPayment.order.status).toBe(OrderStatus.PAID);
    expect(db.products.get('prod-coffee')?.stock).toBe(1);
    expect(db.users.get(customers[0].id)?.loyaltyPoints).toBe(6);

    const preparingOrder = await ordersService.updateOrderStatus(
      order.id,
      OrderStatus.PREPARING,
      baristaUser,
    );
    expect(preparingOrder.status).toBe(OrderStatus.PREPARING);

    await expect(
      ordersService.updateOrderStatus(order.id, OrderStatus.CANCELLED, customers[0]),
    ).rejects.toThrow(BadRequestException);

    const readyOrder = await ordersService.updateOrderStatus(
      order.id,
      OrderStatus.READY,
      baristaUser,
    );
    const completedOrder = await ordersService.updateOrderStatus(
      readyOrder.id,
      OrderStatus.COMPLETED,
      baristaUser,
    );
    expect(completedOrder.status).toBe(OrderStatus.COMPLETED);

    await expect(
      ordersService.updateOrderStatus(order.id, OrderStatus.PAID, baristaUser),
    ).rejects.toThrow(BadRequestException);

    const secondOrder = await ordersService.createOrder(customers[1], {
      items: [{ productId: 'prod-matcha', quantity: 1 }],
    });
    await paymentsService.processPayment(
      customers[1],
      { orderId: secondOrder.id, method: 'WALLET' },
      'cancel-restore-key',
    );
    expect(db.products.get('prod-matcha')?.stock).toBe(1);

    const cancelledOrder = await ordersService.updateOrderStatus(
      secondOrder.id,
      OrderStatus.CANCELLED,
      customers[1],
    );
    expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED);
    expect(db.products.get('prod-matcha')?.stock).toBe(2);
    expect(db.products.get('prod-matcha')?.version).toBe(3);
  });

  it('(b) guarantees strict idempotency under both sequential and 5-way Promise.all replay with the same Idempotency-Key', async () => {
    const order = await ordersService.createOrder(customers[0], {
      items: [{ productId: 'prod-coffee', sizeCode: 'M', quantity: 2 }],
    });

    const parallelResults = await Promise.all(
      Array.from({ length: 5 }, () =>
        paymentsService.processPayment(
          customers[0],
          { orderId: order.id, method: 'WALLET' },
          'parallel-same-key-999',
        ),
      ),
    );

    const sequentialReplay = await paymentsService.processPayment(
      customers[0],
      { orderId: order.id, method: 'WALLET' },
      'parallel-same-key-999',
    );

    const uniquePaymentIds = new Set(parallelResults.map((r) => r.payment.id));
    expect(uniquePaymentIds.size).toBe(1);
    expect(sequentialReplay.idempotentReplay).toBe(true);
    expect(sequentialReplay.payment.id).toBe(parallelResults[0].payment.id);
    expect(parallelResults.filter((r) => !r.idempotentReplay)).toHaveLength(1);
    expect(db.payments.size).toBe(1);
    expect(db.products.get('prod-coffee')?.stock).toBe(1);
    expect(db.products.get('prod-coffee')?.version).toBe(2);
    expect(db.users.get(customers[0].id)?.loyaltyPoints).toBe(8);
  });

  it('(c) prevents overselling and negative stock when concurrent Promise.all orders exceed available inventory', async () => {
    const initialStock = 3;
    const pendingEntries = await Promise.all(
      customers.map(async (customer) => ({
        owner: customer,
        order: await ordersService.createOrder(customer, {
          items: [{ productId: 'prod-coffee', sizeCode: 'M', quantity: 1 }],
        }),
      })),
    );

    let remainingEntries = [...pendingEntries];
    const paidOrders: string[] = [];
    const conflictErrors: ConflictException[] = [];

    for (let wave = 0; wave < 4 && remainingEntries.length > 0; wave += 1) {
      const settlements = await Promise.allSettled(
        remainingEntries.map(({ order, owner }) =>
          paymentsService.processPayment(
            owner,
            { orderId: order.id, method: 'WALLET' },
            `wave-${wave}-order-${order.id}`,
          ),
        ),
      );

      const nextRetryQueue: typeof remainingEntries = [];
      settlements.forEach((outcome, idx) => {
        const entry = remainingEntries[idx];
        if (outcome.status === 'fulfilled') {
          paidOrders.push(outcome.value.order.id);
        } else {
          expect(outcome.reason).toBeInstanceOf(ConflictException);
          conflictErrors.push(outcome.reason as ConflictException);
          nextRetryQueue.push(entry);
        }
      });
      remainingEntries = nextRetryQueue;
    }

    const finalCoffee = db.products.get('prod-coffee');
    expect(paidOrders).toHaveLength(initialStock);
    expect(finalCoffee?.stock).toBe(0);
    expect(finalCoffee?.stock).toBeGreaterThanOrEqual(0);
    expect(finalCoffee?.version).toBe(1 + initialStock);
    expect(conflictErrors.length).toBeGreaterThan(0);
    expect(
      Array.from(db.payments.values()).filter((p) => p.status === PaymentStatus.PAID),
    ).toHaveLength(initialStock);
  });

  it('(c) rolls back earlier product stock decrements when a later item fails inside the same transaction', async () => {
    const currentCoffee = db.products.get('prod-coffee')!;
    db.products.set('prod-coffee', { ...currentCoffee, stock: 5, version: 1 });
    const currentMatcha = db.products.get('prod-matcha')!;
    db.products.set('prod-matcha', { ...currentMatcha, stock: 2, version: 1 });

    const twoItemOrder = await ordersService.createOrder(customers[0], {
      items: [
        { productId: 'prod-coffee', quantity: 2 },
        { productId: 'prod-matcha', quantity: 2 },
      ],
    });
    const stealingOrder = await ordersService.createOrder(customers[1], {
      items: [{ productId: 'prod-matcha', quantity: 1 }],
    });

    await paymentsService.processPayment(
      customers[1],
      { orderId: stealingOrder.id, method: 'WALLET' },
      'steal-matcha-first',
    );
    expect(db.products.get('prod-matcha')?.stock).toBe(1);

    await expect(
      paymentsService.processPayment(
        customers[0],
        { orderId: twoItemOrder.id, method: 'CARD' },
        'partial-rollback-key',
      ),
    ).rejects.toThrow(ConflictException);

    expect(db.products.get('prod-coffee')?.stock).toBe(5);
    expect(db.products.get('prod-coffee')?.version).toBe(1);
    expect(db.products.get('prod-matcha')?.stock).toBe(1);
    expect(db.orders.get(twoItemOrder.id)?.status).toBe(OrderStatus.PENDING);
    expect(db.payments.size).toBe(1);
  });

  it('(b/c) prevents double charging or double stock deduction when the same order is paid concurrently with different Idempotency-Keys', async () => {
    const order = await ordersService.createOrder(customers[0], {
      items: [{ productId: 'prod-coffee', sizeCode: 'M', quantity: 1 }],
    });

    const settled = await Promise.allSettled([
      paymentsService.processPayment(
        customers[0],
        { orderId: order.id, method: 'WALLET' },
        'double-tab-key-alpha',
      ),
      paymentsService.processPayment(
        customers[0],
        { orderId: order.id, method: 'CARD' },
        'double-tab-key-beta',
      ),
    ]);

    const fulfilled = settled.filter((outcome) => outcome.status === 'fulfilled');
    const rejected = settled.filter(
      (outcome): outcome is PromiseRejectedResult => outcome.status === 'rejected',
    );

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(ConflictException);
    expect(db.payments.size).toBe(1);
    expect(db.orders.get(order.id)?.status).toBe(OrderStatus.PAID);
    expect(db.products.get('prod-coffee')?.stock).toBe(2);
    expect(db.products.get('prod-coffee')?.version).toBe(2);
    expect(db.users.get(customers[0].id)?.loyaltyPoints).toBe(4);
  });
});
