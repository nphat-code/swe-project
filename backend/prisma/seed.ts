import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BrewLite database seeding...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.sizeOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.topping.deleteMany();
  await prisma.voucher.deleteMany();

  const toppingsData = [
    { name: 'Trân châu hoàng kim', price: 8000 },
    { name: 'Kem phô mai Macchiato', price: 12000 },
    { name: 'Thạch đào dòn', price: 8000 },
    { name: 'Hạt sen thơm bùi', price: 10000 },
    { name: 'Thạch cà phê sương sáo', price: 8000 },
    { name: 'Sốt caramel thủ công', price: 6000 },
  ];

  for (const top of toppingsData) {
    await prisma.topping.create({ data: top });
  }
  console.log(`✅ Seeded ${toppingsData.length} toppings`);

  const categoriesData = [
    {
      name: 'Cà phê Việt Nam',
      slug: 'ca-phe-viet',
      description: 'Hương vị cà phê truyền thống đậm đà, phin đậm phong vị Việt',
      displayOrder: 1,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Cà phê Pha Máy',
      slug: 'ca-phe-may',
      description: 'Chiết xuất từ hạt Arabica & Robusta rang chuẩn Espresso hiện đại',
      displayOrder: 2,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Trà & Trái Cây',
      slug: 'tra-trai-cay',
      description: 'Trà ủ lạnh thanh mát kết hợp trái cây nhiệt đới tươi mới mỗi ngày',
      displayOrder: 3,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Đá Xay & Thức Uống Đá',
      slug: 'da-xay',
      description: 'Mát lạnh sảng khoái với kem whipping mịn màng béo ngậy',
      displayOrder: 4,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = created.id;
  }
  console.log(`✅ Seeded ${categoriesData.length} categories`);

  const productsData = [
    {
      name: 'Cà Phê Sữa Đá Sài Gòn',
      slug: 'ca-phe-sua-da-sai-gon',
      description: 'Cà phê phin truyền thống hòa quyện cùng sữa đặc béo ngọt và đá lạnh mát lạnh sảng khoái.',
      basePrice: 32000,
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'ca-phe-viet',
    },
    {
      name: 'Bạc Xỉu 3 Tầng Đặc Biệt',
      slug: 'bac-xiu-3-tang-dac-biet',
      description: 'Nhiều sữa ít cà phê, béo thơm ngọt dịu với 3 tầng mắt đẹp mắt và hấp dẫn.',
      basePrice: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'ca-phe-viet',
    },
    {
      name: 'Cà Phê Muối Cố Đô',
      slug: 'ca-phe-muoi-co-do',
      description: 'Lớp kem mặn béo ngậy cân bằng hoàn hảo vị đắng đậm đà của cà phê Robusta hảo hạng.',
      basePrice: 39000,
      imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'ca-phe-viet',
    },
    {
      name: 'Cà Phê Đen Đá Phin',
      slug: 'ca-phe-den-da-phin',
      description: 'Robusta nguyên chất rang đậm, giữ trọn hậu vị đắng thơm nồng nàn đánh thức ngày mới.',
      basePrice: 29000,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'ca-phe-viet',
    },

    {
      name: 'Americano Đá Tươi Mát',
      slug: 'americano-da-tuoi-mat',
      description: 'Double shots Espresso pha loãng với nước tinh khiết, nhẹ nhàng và hương thơm thanh khiết.',
      basePrice: 38000,
      imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'ca-phe-may',
    },
    {
      name: 'Caffe Latte Nghệ Thuật',
      slug: 'caffe-latte-nghe-thuat',
      description: 'Espresso thơm lừng cùng lớp sữa tươi hấp mịn màng, phủ hình hoa văn Latte Art tinh tế.',
      basePrice: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'ca-phe-may',
    },
    {
      name: 'Caramel Macchiato Ngọt Ngào',
      slug: 'caramel-macchiato-ngot-ngao',
      description: 'Sự hòa quyện giữa sữa tươi thơm vani, cà phê Espresso và vệt sốt caramel phủ trên bề mặt.',
      basePrice: 49000,
      imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'ca-phe-may',
    },

    {
      name: 'Trà Đào Cam Sả Tươi',
      slug: 'tra-dao-cam-sa-tuoi',
      description: 'Nước cốt trà đen thanh dịu kết hợp miếng đào giòn ngọt và mùi thơm sả cam nồng nàn.',
      basePrice: 42000,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'tra-trai-cay',
    },
    {
      name: 'Trà Sen Vàng Hạt Sen Bùi',
      slug: 'tra-sen-vang-hat-sen-bui',
      description: 'Trà Oolong thanh tao kèm hạt sen tươi ninh nhừ bùi béo và củ năng giòn rụm thanh mát.',
      basePrice: 46000,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'tra-trai-cay',
    },
    {
      name: 'Trà Oolong Mãng Cầu Tươi',
      slug: 'tra-oolong-mang-cau-tuoi',
      description: 'Thịt mãng cầu xiêm tươi dầm chua ngọt hài hòa cùng vị trà Oolong đậm vị giải nhiệt.',
      basePrice: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'tra-trai-cay',
    },

    {
      name: 'Matcha Đá Xay Kem Whipping',
      slug: 'matcha-da-xay-kem-whipping',
      description: 'Bột trà xanh Uji Nhật Bản xay nhuyễn cùng sữa tươi và đá tuyết, phủ bông kem béo ngậy.',
      basePrice: 52000,
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'da-xay',
    },
    {
      name: 'Cà Phê Dừa Tuyết Đá Xay',
      slug: 'ca-phe-dua-tuyet-da-xay',
      description: 'Nước cốt dừa đá xay ngọt béo rót lên trên nền cà phê đen đậm chất gây nghiện.',
      basePrice: 49000,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'da-xay',
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        basePrice: item.basePrice,
        imageUrl: item.imageUrl,
        categoryId: createdCategories[item.categorySlug],
        stock: 150,
        version: 1,
        sizes: {
          create: [
            { name: 'Nhỏ (S)', code: 'S', extraPrice: 0, isDefault: true },
            { name: 'Vừa (M)', code: 'M', extraPrice: 6000, isDefault: false },
            { name: 'Lớn (L)', code: 'L', extraPrice: 10000, isDefault: false },
          ],
        },
      },
    });
  }
  console.log(`✅ Seeded ${productsData.length} products with sizes (S/M/L)`);

  const vouchersData = [
    {
      code: 'BREWLITEFIRST',
      description: 'Giảm 20% cho đơn hàng đầu tiên (Tối đa 30k)',
      discountPercent: 20,
      maxDiscount: 30000,
      minOrderAmount: 40000,
    },
    {
      code: 'COFFEELOVER',
      description: 'Giảm 10% cho tín đồ cà phê mọi đơn hàng',
      discountPercent: 10,
      maxDiscount: 25000,
      minOrderAmount: 50000,
    },
  ];

  for (const v of vouchersData) {
    await prisma.voucher.create({ data: v });
  }
  console.log(`✅ Seeded ${vouchersData.length} promotional vouchers`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
