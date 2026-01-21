import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'gpbmt';

async function initDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);

    // Create collections
    const collections = [
      'users',
      'parishes',
      'subParishes',
      'families',
      'people',
      'funds',
      'transactions',
      'clergy',
      'assignments',
      'baptisms',
      'marriages',
      'funerals',
      'staff',
      'payroll',
      'auditLogs',
    ];

    for (const collection of collections) {
      const exists = await db.listCollections({ name: collection }).hasNext();
      if (!exists) {
        await db.createCollection(collection);
        console.log(`Created collection: ${collection}`);
      }
    }

    // Create indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('Created index on users.email');

    const parishesCollection = db.collection('parishes');
    await parishesCollection.createIndex({ parishCode: 1 }, { unique: true });
    console.log('Created index on parishes.parishCode');

    const subParishesCollection = db.collection('subParishes');
    await subParishesCollection.createIndex({ subParishCode: 1 }, { unique: true });
    console.log('Created index on subParishes.subParishCode');

    const familiesCollection = db.collection('families');
    await familiesCollection.createIndex({ familyCode: 1 }, { unique: true });
    console.log('Created index on families.familyCode');

    const fundsCollection = db.collection('funds');
    await fundsCollection.createIndex({ fundCode: 1 }, { unique: true });
    console.log('Created index on funds.fundCode');

    // Insert demo funds if not exists
    const fundCount = await fundsCollection.countDocuments();
    if (fundCount === 0) {
      const funds = [
        {
          fundCode: 'FUND_01',
          fundName: 'Quỹ Liên hiệp Truyền giáo',
          category: 'A',
          fiscalPeriod: 'yearly',
          recipientUnit: 'HĐGMVN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_02',
          fundName: 'Quỹ Thiếu nhi Truyền giáo',
          category: 'A',
          fiscalPeriod: 'yearly',
          recipientUnit: 'HĐGMVN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_03',
          fundName: 'Quỹ Lễ Thánh Phêrô và Phaolô',
          category: 'A',
          fiscalPeriod: 'yearly',
          recipientUnit: 'HĐGMVN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_04',
          fundName: 'Quỹ Truyền giáo',
          category: 'A',
          fiscalPeriod: 'yearly',
          recipientUnit: 'HĐGMVN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_05',
          fundName: 'Quỹ Giúp Đại Chủng viện',
          category: 'B',
          fiscalPeriod: 'yearly',
          recipientUnit: 'TGM BMT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_06',
          fundName: 'Quỹ Phòng thu Tòa Giám mục',
          category: 'B',
          fiscalPeriod: 'monthly',
          recipientUnit: 'TGM BMT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_07',
          fundName: 'Quỹ Tôn chân Chúa',
          category: 'B',
          fiscalPeriod: 'yearly',
          recipientUnit: 'TGM BMT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_08',
          fundName: 'Quỹ giúp Cha hưu',
          category: 'C',
          fiscalPeriod: 'yearly',
          recipientUnit: 'Nội bộ',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_09',
          fundName: 'Tiền xin lễ (Mass Stipends)',
          category: 'C',
          fiscalPeriod: 'yearly',
          recipientUnit: 'Nội bộ',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_10',
          fundName: 'Tiền rổ & Quyên góp',
          category: 'C',
          fiscalPeriod: 'yearly',
          recipientUnit: 'Nội bộ',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fundCode: 'FUND_11',
          fundName: 'Ân nhân & Tài trợ',
          category: 'C',
          fiscalPeriod: 'yearly',
          recipientUnit: 'Nội bộ',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await fundsCollection.insertMany(funds);
      console.log('Inserted demo funds');
    }

    // Insert demo admin user if not exists
    const userCount = await usersCollection.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      const adminUser = {
        email: 'admin@gpbmt.org',
        password: hashedPassword,
        fullName: 'Quản trị viên hệ thống',
        role: 'super_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await usersCollection.insertOne(adminUser as any);
      console.log('Inserted demo admin user (admin@gpbmt.org / demo123)');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initDatabase();
