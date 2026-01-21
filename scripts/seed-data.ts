import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'gpbmt';

// Helper to generate random date
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate ObjectId
function newId(): ObjectId {
  return new ObjectId();
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);

    // ============================================
    // 1. USERS - Người dùng
    // ============================================
    console.log('\n--- Seeding Users ---');
    const usersCollection = db.collection('users');
    await usersCollection.deleteMany({});

    const hashedPassword = await bcrypt.hash('demo123', 10);
    const users = [
      {
        _id: newId(),
        email: 'admin@gpbmt.org',
        password: hashedPassword,
        fullName: 'Quản trị viên Hệ thống',
        role: 'super_admin',
        status: 'active',
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        email: 'quanly@gpbmt.org',
        password: hashedPassword,
        fullName: 'Cha Giuse Nguyễn Văn Quản',
        role: 'cha_quan_ly',
        status: 'active',
        lastLogin: randomDate(new Date(2024, 0, 1), new Date()),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        email: 'ketoan@gpbmt.org',
        password: hashedPassword,
        fullName: 'Maria Trần Thị Kế',
        role: 'ke_toan',
        status: 'active',
        lastLogin: randomDate(new Date(2024, 0, 1), new Date()),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await usersCollection.insertMany(users);
    console.log(`Inserted ${users.length} users`);

    // ============================================
    // 2. PARISHES - Giáo xứ
    // ============================================
    console.log('\n--- Seeding Parishes ---');
    const parishesCollection = db.collection('parishes');
    await parishesCollection.deleteMany({});

    const parishIds: ObjectId[] = [];
    const parishes = [
      {
        _id: newId(),
        parishCode: 'GX001',
        parishName: 'Giáo xứ Chính Tòa',
        deaneryId: 'HAT01',
        deaneryName: 'Hạt Buôn Ma Thuột',
        patronSaint: 'Đức Mẹ Vô Nhiễm',
        address: '104 Phan Chu Trinh, TP. Buôn Ma Thuột',
        phone: '0262.3851234',
        email: 'chinhtoa@gpbmt.org',
        establishedDate: new Date('1954-03-19'),
        area: 5000,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        parishCode: 'GX002',
        parishName: 'Giáo xứ Thánh Tâm',
        deaneryId: 'HAT01',
        deaneryName: 'Hạt Buôn Ma Thuột',
        patronSaint: 'Thánh Tâm Chúa Giêsu',
        address: '45 Nguyễn Công Trứ, TP. Buôn Ma Thuột',
        phone: '0262.3852345',
        email: 'thanhtam@gpbmt.org',
        establishedDate: new Date('1962-06-15'),
        area: 3500,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        parishCode: 'GX003',
        parishName: 'Giáo xứ Vinh Sơn',
        deaneryId: 'HAT01',
        deaneryName: 'Hạt Buôn Ma Thuột',
        patronSaint: 'Thánh Vinh Sơn Phaolô',
        address: '78 Lê Duẩn, TP. Buôn Ma Thuột',
        phone: '0262.3853456',
        email: 'vinhson@gpbmt.org',
        establishedDate: new Date('1970-08-20'),
        area: 2800,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        parishCode: 'GX004',
        parishName: 'Giáo xứ Phúc Lộc',
        deaneryId: 'HAT02',
        deaneryName: 'Hạt Đắk Lắk',
        patronSaint: 'Đức Mẹ Hằng Cứu Giúp',
        address: 'Xã Ea Kao, Huyện Buôn Đôn',
        phone: '0262.3864567',
        email: 'phucloc@gpbmt.org',
        establishedDate: new Date('1985-12-25'),
        area: 4200,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        parishCode: 'GX005',
        parishName: 'Giáo xứ Châu Sơn',
        deaneryId: 'HAT02',
        deaneryName: 'Hạt Đắk Lắk',
        patronSaint: 'Thánh Giuse',
        address: 'Thị trấn Ea Drăng, Huyện Ea H\'leo',
        phone: '0262.3875678',
        email: 'chauson@gpbmt.org',
        establishedDate: new Date('1992-03-19'),
        area: 3100,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        parishCode: 'GX006',
        parishName: 'Giáo xứ Kim Phát',
        deaneryId: 'HAT03',
        deaneryName: 'Hạt Đắk Nông',
        patronSaint: 'Thánh Phanxicô Xaviê',
        address: 'Xã Đắk Nia, TX Gia Nghĩa, Đắk Nông',
        phone: '0261.3546789',
        email: 'kimphat@gpbmt.org',
        establishedDate: new Date('2000-10-04'),
        area: 2500,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    parishes.forEach(p => parishIds.push(p._id));
    await parishesCollection.insertMany(parishes);
    console.log(`Inserted ${parishes.length} parishes`);

    // ============================================
    // 3. SUB-PARISHES - Giáo họ
    // ============================================
    console.log('\n--- Seeding Sub-Parishes ---');
    const subParishesCollection = db.collection('subParishes');
    await subParishesCollection.deleteMany({});

    const subParishes = [
      {
        _id: newId(),
        subParishCode: 'GH001',
        subParishName: 'Giáo họ Thánh Phêrô',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        patronSaint: 'Thánh Phêrô Tông đồ',
        address: 'Khu phố 3, Phường Tân An',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        subParishCode: 'GH002',
        subParishName: 'Giáo họ Fatima',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        patronSaint: 'Đức Mẹ Fatima',
        address: 'Khu phố 5, Phường Thống Nhất',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        subParishCode: 'GH003',
        subParishName: 'Giáo họ Thánh Giuse',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        patronSaint: 'Thánh Giuse',
        address: 'Buôn Krông A',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        subParishCode: 'GH004',
        subParishName: 'Giáo họ Lộ Đức',
        parishId: parishIds[2].toString(),
        parishName: 'Giáo xứ Vinh Sơn',
        patronSaint: 'Đức Mẹ Lộ Đức',
        address: 'Thôn 4, Xã Hòa Thắng',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        subParishCode: 'GH005',
        subParishName: 'Giáo họ Mông Triệu',
        parishId: parishIds[3].toString(),
        parishName: 'Giáo xứ Phúc Lộc',
        patronSaint: 'Đức Mẹ Mông Triệu',
        address: 'Buôn Ea Kao',
        status: 'active',
        createdAt: new Date(),
      },
    ];

    await subParishesCollection.insertMany(subParishes);
    console.log(`Inserted ${subParishes.length} sub-parishes`);

    // ============================================
    // 4. FAMILIES - Gia đình
    // ============================================
    console.log('\n--- Seeding Families ---');
    const familiesCollection = db.collection('families');
    await familiesCollection.deleteMany({});

    const familyIds: ObjectId[] = [];
    const families = [
      {
        _id: newId(),
        familyCode: 'GD001',
        familyName: 'Nguyễn Văn An',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        address: '123 Phan Chu Trinh, TP. BMT',
        phone: '0905123456',
        registrationDate: new Date('2015-06-15'),
        memberCount: 5,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        familyCode: 'GD002',
        familyName: 'Trần Văn Bình',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        address: '456 Lê Duẩn, TP. BMT',
        phone: '0905234567',
        registrationDate: new Date('2010-03-20'),
        memberCount: 4,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        familyCode: 'GD003',
        familyName: 'Lê Văn Cường',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        address: '789 Nguyễn Công Trứ, TP. BMT',
        phone: '0905345678',
        registrationDate: new Date('2018-09-10'),
        memberCount: 6,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        familyCode: 'GD004',
        familyName: 'Phạm Văn Dũng',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        address: '321 Trần Phú, TP. BMT',
        phone: '0905456789',
        registrationDate: new Date('2012-12-25'),
        memberCount: 3,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        familyCode: 'GD005',
        familyName: 'Hoàng Văn Em',
        parishId: parishIds[2].toString(),
        parishName: 'Giáo xứ Vinh Sơn',
        address: '654 Hai Bà Trưng, TP. BMT',
        phone: '0905567890',
        registrationDate: new Date('2020-01-15'),
        memberCount: 4,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        familyCode: 'GD006',
        familyName: 'Võ Văn Phúc',
        parishId: parishIds[3].toString(),
        parishName: 'Giáo xứ Phúc Lộc',
        address: 'Thôn 2, Xã Ea Kao',
        phone: '0905678901',
        registrationDate: new Date('2005-06-01'),
        memberCount: 7,
        status: 'active',
        createdAt: new Date(),
      },
    ];

    families.forEach(f => familyIds.push(f._id));
    await familiesCollection.insertMany(families);
    console.log(`Inserted ${families.length} families`);

    // ============================================
    // 5. PEOPLE - Giáo dân
    // ============================================
    console.log('\n--- Seeding People ---');
    const peopleCollection = db.collection('people');
    await peopleCollection.deleteMany({});

    const people = [
      // Family 1
      {
        _id: newId(),
        saintName: 'Giuse',
        fullName: 'Nguyễn Văn An',
        gender: 'male',
        dob: new Date('1975-03-15'),
        familyId: familyIds[0].toString(),
        familyName: 'Nguyễn Văn An',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        relationToHead: 'Chủ hộ',
        phone: '0905123456',
        occupation: 'Công chức',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Maria',
        fullName: 'Trần Thị Bích',
        gender: 'female',
        dob: new Date('1978-07-22'),
        familyId: familyIds[0].toString(),
        familyName: 'Nguyễn Văn An',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        relationToHead: 'Vợ',
        phone: '0905123457',
        occupation: 'Giáo viên',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Phanxicô',
        fullName: 'Nguyễn Văn Minh',
        gender: 'male',
        dob: new Date('2005-12-03'),
        familyId: familyIds[0].toString(),
        familyName: 'Nguyễn Văn An',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        relationToHead: 'Con',
        occupation: 'Học sinh',
        status: 'active',
        createdAt: new Date(),
      },
      // Family 2
      {
        _id: newId(),
        saintName: 'Phêrô',
        fullName: 'Trần Văn Bình',
        gender: 'male',
        dob: new Date('1968-11-30'),
        familyId: familyIds[1].toString(),
        familyName: 'Trần Văn Bình',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        relationToHead: 'Chủ hộ',
        phone: '0905234567',
        occupation: 'Doanh nhân',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Anna',
        fullName: 'Lê Thị Cẩm',
        gender: 'female',
        dob: new Date('1972-05-18'),
        familyId: familyIds[1].toString(),
        familyName: 'Trần Văn Bình',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        relationToHead: 'Vợ',
        phone: '0905234568',
        occupation: 'Nội trợ',
        status: 'active',
        createdAt: new Date(),
      },
      // Family 3
      {
        _id: newId(),
        saintName: 'Gioan',
        fullName: 'Lê Văn Cường',
        gender: 'male',
        dob: new Date('1980-09-25'),
        familyId: familyIds[2].toString(),
        familyName: 'Lê Văn Cường',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        relationToHead: 'Chủ hộ',
        phone: '0905345678',
        occupation: 'Bác sĩ',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Têrêsa',
        fullName: 'Phạm Thị Dung',
        gender: 'female',
        dob: new Date('1983-02-14'),
        familyId: familyIds[2].toString(),
        familyName: 'Lê Văn Cường',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        relationToHead: 'Vợ',
        phone: '0905345679',
        occupation: 'Dược sĩ',
        status: 'active',
        createdAt: new Date(),
      },
    ];

    await peopleCollection.insertMany(people);
    console.log(`Inserted ${people.length} people`);

    // ============================================
    // 6. CLERGY - Linh mục
    // ============================================
    console.log('\n--- Seeding Clergy ---');
    const clergyCollection = db.collection('clergy');
    await clergyCollection.deleteMany({});

    const clergyIds: ObjectId[] = [];
    const clergy = [
      {
        _id: newId(),
        saintName: 'Giuse',
        fullName: 'Nguyễn Văn Linh',
        dob: new Date('1960-05-15'),
        birthplace: 'Nam Định',
        ordinationDate: new Date('1990-06-29'),
        trainingClass: 'Khóa 5 - ĐCV Sao Biển',
        currentAssignment: 'Cha xứ',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        phone: '0905111222',
        email: 'nguyenvanlinh@gpbmt.org',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Phêrô',
        fullName: 'Trần Minh Đức',
        dob: new Date('1965-12-25'),
        birthplace: 'Nghệ An',
        ordinationDate: new Date('1995-06-29'),
        trainingClass: 'Khóa 7 - ĐCV Sao Biển',
        currentAssignment: 'Cha xứ',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        phone: '0905222333',
        email: 'tranminhduc@gpbmt.org',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Phaolô',
        fullName: 'Lê Văn Hùng',
        dob: new Date('1970-08-20'),
        birthplace: 'Quảng Bình',
        ordinationDate: new Date('2000-06-29'),
        trainingClass: 'Khóa 10 - ĐCV Sao Biển',
        currentAssignment: 'Cha xứ',
        parishId: parishIds[2].toString(),
        parishName: 'Giáo xứ Vinh Sơn',
        phone: '0905333444',
        email: 'levanhung@gpbmt.org',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Gioan Baotixita',
        fullName: 'Phạm Công Thành',
        dob: new Date('1975-06-24'),
        birthplace: 'Đắk Lắk',
        ordinationDate: new Date('2005-06-29'),
        trainingClass: 'Khóa 12 - ĐCV Sao Biển',
        currentAssignment: 'Cha xứ',
        parishId: parishIds[3].toString(),
        parishName: 'Giáo xứ Phúc Lộc',
        phone: '0905444555',
        email: 'phamcongthanh@gpbmt.org',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Antôn',
        fullName: 'Hoàng Văn Khoa',
        dob: new Date('1980-01-17'),
        birthplace: 'Hà Tĩnh',
        ordinationDate: new Date('2010-06-29'),
        trainingClass: 'Khóa 15 - ĐCV Sao Biển',
        currentAssignment: 'Cha phó',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        phone: '0905555666',
        email: 'hoangvankhoa@gpbmt.org',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Đaminh',
        fullName: 'Võ Quang Minh',
        dob: new Date('1985-08-08'),
        birthplace: 'Bình Định',
        ordinationDate: new Date('2015-06-29'),
        trainingClass: 'Khóa 18 - ĐCV Sao Biển',
        currentAssignment: 'Cha phó',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        phone: '0905666777',
        email: 'voquangminh@gpbmt.org',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        saintName: 'Augustinô',
        fullName: 'Nguyễn Thanh Bình',
        dob: new Date('1945-10-10'),
        birthplace: 'Huế',
        ordinationDate: new Date('1975-06-29'),
        trainingClass: 'Khóa 2 - ĐCV Sao Biển',
        currentAssignment: 'Hưu dưỡng',
        phone: '0905777888',
        status: 'retired',
        createdAt: new Date(),
      },
    ];

    clergy.forEach(c => clergyIds.push(c._id));
    await clergyCollection.insertMany(clergy);
    console.log(`Inserted ${clergy.length} clergy`);

    // ============================================
    // 7. ASSIGNMENTS - Bổ nhiệm
    // ============================================
    console.log('\n--- Seeding Assignments ---');
    const assignmentsCollection = db.collection('assignments');
    await assignmentsCollection.deleteMany({});

    const assignments = [
      {
        _id: newId(),
        clergyId: clergyIds[0].toString(),
        clergyName: 'Cha Giuse Nguyễn Văn Linh',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        role: 'cha_xu',
        startDate: new Date('2020-08-15'),
        decreeNo: 'QD-2020-001',
        isCurrent: true,
        createdAt: new Date(),
      },
      {
        _id: newId(),
        clergyId: clergyIds[1].toString(),
        clergyName: 'Cha Phêrô Trần Minh Đức',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        role: 'cha_xu',
        startDate: new Date('2018-06-29'),
        decreeNo: 'QD-2018-005',
        isCurrent: true,
        createdAt: new Date(),
      },
      {
        _id: newId(),
        clergyId: clergyIds[2].toString(),
        clergyName: 'Cha Phaolô Lê Văn Hùng',
        parishId: parishIds[2].toString(),
        parishName: 'Giáo xứ Vinh Sơn',
        role: 'cha_xu',
        startDate: new Date('2019-01-01'),
        decreeNo: 'QD-2019-002',
        isCurrent: true,
        createdAt: new Date(),
      },
      {
        _id: newId(),
        clergyId: clergyIds[4].toString(),
        clergyName: 'Cha Antôn Hoàng Văn Khoa',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        role: 'cha_pho',
        startDate: new Date('2022-06-29'),
        decreeNo: 'QD-2022-010',
        isCurrent: true,
        createdAt: new Date(),
      },
    ];

    await assignmentsCollection.insertMany(assignments);
    console.log(`Inserted ${assignments.length} assignments`);

    // ============================================
    // 8. STAFF - Nhân viên
    // ============================================
    console.log('\n--- Seeding Staff ---');
    const staffCollection = db.collection('staff');
    await staffCollection.deleteMany({});

    const staffIds: ObjectId[] = [];
    const staffMembers = [
      {
        _id: newId(),
        staffCode: 'NV001',
        fullName: 'Nguyễn Thị Lan',
        gender: 'female',
        dob: new Date('1985-04-12'),
        idNumber: '048185012345',
        phone: '0909123456',
        email: 'ntlan@gpbmt.org',
        address: '25 Trần Phú, TP. BMT',
        position: 'Kế toán',
        department: 'Văn phòng TGM',
        hireDate: new Date('2015-03-01'),
        contractType: 'full_time',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        staffCode: 'NV002',
        fullName: 'Trần Văn Nam',
        gender: 'male',
        dob: new Date('1978-09-20'),
        idNumber: '048178098765',
        phone: '0909234567',
        address: '30 Lê Duẩn, TP. BMT',
        position: 'Bảo vệ',
        department: 'Văn phòng TGM',
        hireDate: new Date('2010-06-15'),
        contractType: 'full_time',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        staffCode: 'NV003',
        fullName: 'Lê Thị Hoa',
        gender: 'female',
        dob: new Date('1990-02-28'),
        idNumber: '048190054321',
        phone: '0909345678',
        email: 'lthoa@gpbmt.org',
        address: '45 Nguyễn Văn Cừ, TP. BMT',
        position: 'Văn phòng',
        department: 'Văn phòng TGM',
        hireDate: new Date('2020-09-01'),
        contractType: 'full_time',
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        staffCode: 'NV004',
        fullName: 'Phạm Văn Hải',
        gender: 'male',
        dob: new Date('1982-07-15'),
        idNumber: '048182067890',
        phone: '0909456789',
        address: '60 Hai Bà Trưng, TP. BMT',
        position: 'Tài xế',
        department: 'Văn phòng TGM',
        hireDate: new Date('2018-01-15'),
        contractType: 'full_time',
        status: 'active',
        createdAt: new Date(),
      },
    ];

    staffMembers.forEach(s => staffIds.push(s._id));
    await staffCollection.insertMany(staffMembers);
    console.log(`Inserted ${staffMembers.length} staff members`);

    // ============================================
    // 9. CONTRACTS - Hợp đồng
    // ============================================
    console.log('\n--- Seeding Contracts ---');
    const contractsCollection = db.collection('contracts');
    await contractsCollection.deleteMany({});

    const contracts = [
      {
        _id: newId(),
        contractNo: 'HD-2023-001',
        staffId: staffIds[0].toString(),
        staffName: 'Nguyễn Thị Lan',
        contractType: 'full_time',
        startDate: new Date('2023-03-01'),
        basicSalary: 12000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        contractNo: 'HD-2023-002',
        staffId: staffIds[1].toString(),
        staffName: 'Trần Văn Nam',
        contractType: 'full_time',
        startDate: new Date('2023-06-15'),
        basicSalary: 8000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        contractNo: 'HD-2024-001',
        staffId: staffIds[2].toString(),
        staffName: 'Lê Thị Hoa',
        contractType: 'fixed_term',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        basicSalary: 10000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        contractNo: 'HD-2023-003',
        staffId: staffIds[3].toString(),
        staffName: 'Phạm Văn Hải',
        contractType: 'full_time',
        startDate: new Date('2023-01-15'),
        basicSalary: 9000000,
        status: 'active',
        createdAt: new Date(),
      },
    ];

    await contractsCollection.insertMany(contracts);
    console.log(`Inserted ${contracts.length} contracts`);

    // ============================================
    // 10. PAYROLL - Bảng lương
    // ============================================
    console.log('\n--- Seeding Payroll ---');
    const payrollCollection = db.collection('payroll');
    await payrollCollection.deleteMany({});

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const period = `${String(currentMonth).padStart(2, '0')}/${currentYear}`;

    const payrolls = staffMembers.map((staff, index) => ({
      _id: newId(),
      staffId: staffIds[index].toString(),
      staffName: staff.fullName,
      staffCode: staff.staffCode,
      period: period,
      basicSalary: [12000000, 8000000, 10000000, 9000000][index],
      responsibilityAllowance: [2000000, 0, 1000000, 500000][index],
      mealAllowance: 500000,
      transportAllowance: 300000,
      advance: 0,
      deductions: 0,
      netSalary: [14800000, 8800000, 11800000, 10300000][index],
      status: 'approved',
      approvedBy: 'Cha Quản lý',
      createdAt: new Date(),
    }));

    await payrollCollection.insertMany(payrolls);
    console.log(`Inserted ${payrolls.length} payroll records`);

    // ============================================
    // 11. FUNDS - Quỹ (đã có trong init-db.ts)
    // ============================================
    console.log('\n--- Checking Funds ---');
    const fundsCollection = db.collection('funds');
    const fundCount = await fundsCollection.countDocuments();
    if (fundCount === 0) {
      const funds = [
        { fundCode: 'FUND_01', fundName: 'Quỹ Liên hiệp Truyền giáo', category: 'A', fiscalPeriod: 'yearly', recipientUnit: 'HĐGMVN', totalCollected: 150000000 },
        { fundCode: 'FUND_02', fundName: 'Quỹ Thiếu nhi Truyền giáo', category: 'A', fiscalPeriod: 'yearly', recipientUnit: 'HĐGMVN', totalCollected: 80000000 },
        { fundCode: 'FUND_03', fundName: 'Quỹ Lễ Thánh Phêrô và Phaolô', category: 'A', fiscalPeriod: 'yearly', recipientUnit: 'HĐGMVN', totalCollected: 120000000 },
        { fundCode: 'FUND_04', fundName: 'Quỹ Truyền giáo', category: 'A', fiscalPeriod: 'yearly', recipientUnit: 'HĐGMVN', totalCollected: 200000000 },
        { fundCode: 'FUND_05', fundName: 'Quỹ Giúp Đại Chủng viện', category: 'B', fiscalPeriod: 'yearly', recipientUnit: 'TGM BMT', totalCollected: 300000000 },
        { fundCode: 'FUND_06', fundName: 'Quỹ Phòng thu Tòa Giám mục', category: 'B', fiscalPeriod: 'monthly', recipientUnit: 'TGM BMT', totalCollected: 450000000 },
        { fundCode: 'FUND_07', fundName: 'Quỹ Tôn chân Chúa', category: 'B', fiscalPeriod: 'yearly', recipientUnit: 'TGM BMT', totalCollected: 50000000 },
        { fundCode: 'FUND_08', fundName: 'Quỹ giúp Cha hưu', category: 'C', fiscalPeriod: 'yearly', recipientUnit: 'Nội bộ', totalCollected: 100000000 },
        { fundCode: 'FUND_09', fundName: 'Tiền xin lễ (Mass Stipends)', category: 'C', fiscalPeriod: 'monthly', recipientUnit: 'Nội bộ', totalCollected: 180000000 },
        { fundCode: 'FUND_10', fundName: 'Tiền rổ & Quyên góp', category: 'C', fiscalPeriod: 'monthly', recipientUnit: 'Nội bộ', totalCollected: 250000000 },
        { fundCode: 'FUND_11', fundName: 'Ân nhân & Tài trợ', category: 'C', fiscalPeriod: 'yearly', recipientUnit: 'Nội bộ', totalCollected: 500000000 },
      ].map(f => ({ ...f, _id: newId(), createdAt: new Date(), updatedAt: new Date() }));

      await fundsCollection.insertMany(funds);
      console.log(`Inserted ${funds.length} funds`);
    } else {
      console.log(`Funds already exist (${fundCount} records)`);
    }

    // ============================================
    // 12. TRANSACTIONS - Giao dịch
    // ============================================
    console.log('\n--- Seeding Transactions ---');
    const transactionsCollection = db.collection('transactions');
    await transactionsCollection.deleteMany({});

    const transactions = [];
    for (let i = 0; i < 20; i++) {
      const parishIdx = i % parishes.length;
      const fundIdx = i % 11;
      transactions.push({
        _id: newId(),
        transactionId: `GD-2024-${String(i + 1).padStart(4, '0')}`,
        parishId: parishIds[parishIdx].toString(),
        parishName: parishes[parishIdx].parishName,
        fundId: `FUND_${String(fundIdx + 1).padStart(2, '0')}`,
        fundName: ['Quỹ Liên hiệp Truyền giáo', 'Quỹ Thiếu nhi Truyền giáo', 'Quỹ Lễ Thánh Phêrô và Phaolô', 'Quỹ Truyền giáo', 'Quỹ Giúp Đại Chủng viện', 'Quỹ Phòng thu Tòa Giám mục', 'Quỹ Tôn chân Chúa', 'Quỹ giúp Cha hưu', 'Tiền xin lễ', 'Tiền rổ & Quyên góp', 'Ân nhân & Tài trợ'][fundIdx],
        amount: Math.floor(Math.random() * 50000000) + 1000000,
        paymentMethod: i % 2 === 0 ? 'online' : 'offline',
        fiscalYear: 2024,
        fiscalPeriod: (i % 12) + 1,
        status: ['pending', 'verified', 'verified', 'verified'][i % 4],
        submittedBy: `user_${i % 3 + 1}`,
        submittedAt: randomDate(new Date(2024, 0, 1), new Date()),
        verifiedAt: i % 4 !== 0 ? randomDate(new Date(2024, 0, 1), new Date()) : undefined,
        createdAt: new Date(),
      });
    }

    await transactionsCollection.insertMany(transactions);
    console.log(`Inserted ${transactions.length} transactions`);

    // ============================================
    // 13. RECEIPTS - Phiếu thu
    // ============================================
    console.log('\n--- Seeding Receipts ---');
    const receiptsCollection = db.collection('receipts');
    await receiptsCollection.deleteMany({});

    const receipts = transactions.filter(t => t.status === 'verified').map((t, idx) => ({
      _id: newId(),
      receiptNo: `PT-2024-${String(idx + 1).padStart(4, '0')}`,
      transactionId: t.transactionId,
      parishName: t.parishName,
      fundName: t.fundName,
      amount: t.amount,
      issuedAt: t.verifiedAt || new Date(),
      issuedBy: 'Kế toán VP',
      status: 'issued',
      createdAt: new Date(),
    }));

    await receiptsCollection.insertMany(receipts);
    console.log(`Inserted ${receipts.length} receipts`);

    // ============================================
    // 14. ASSETS - Tài sản
    // ============================================
    console.log('\n--- Seeding Assets ---');
    const assetsCollection = db.collection('assets');
    await assetsCollection.deleteMany({});

    const assets = [
      {
        _id: newId(),
        assetCode: 'TS001',
        assetName: 'Nhà thờ Chính Tòa',
        assetType: 'building',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        location: '104 Phan Chu Trinh, TP. BMT',
        area: 2500,
        acquisitionDate: new Date('1960-01-01'),
        acquisitionValue: 0,
        currentValue: 50000000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        assetCode: 'TS002',
        assetName: 'Đất Giáo xứ Chính Tòa',
        assetType: 'land',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        location: '104 Phan Chu Trinh, TP. BMT',
        area: 5000,
        acquisitionDate: new Date('1954-01-01'),
        acquisitionValue: 0,
        currentValue: 100000000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        assetCode: 'TS003',
        assetName: 'Xe Toyota Fortuner',
        assetType: 'vehicle',
        parishId: parishIds[0].toString(),
        parishName: 'TGM',
        location: 'Văn phòng TGM',
        acquisitionDate: new Date('2020-06-15'),
        acquisitionValue: 1200000000,
        currentValue: 900000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        assetCode: 'TS004',
        assetName: 'Nhà thờ Thánh Tâm',
        assetType: 'building',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        location: '45 Nguyễn Công Trứ, TP. BMT',
        area: 1800,
        acquisitionDate: new Date('1962-06-15'),
        acquisitionValue: 0,
        currentValue: 30000000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        assetCode: 'TS005',
        assetName: 'Máy chiếu Epson',
        assetType: 'equipment',
        parishId: parishIds[0].toString(),
        parishName: 'TGM',
        location: 'Hội trường TGM',
        acquisitionDate: new Date('2023-03-01'),
        acquisitionValue: 35000000,
        currentValue: 28000000,
        status: 'active',
        createdAt: new Date(),
      },
    ];

    await assetsCollection.insertMany(assets);
    console.log(`Inserted ${assets.length} assets`);

    // ============================================
    // 15. PROJECTS - Công trình
    // ============================================
    console.log('\n--- Seeding Projects ---');
    const projectsCollection = db.collection('projects');
    await projectsCollection.deleteMany({});

    const projects = [
      {
        _id: newId(),
        projectName: 'Xây dựng Nhà giáo lý Giáo xứ Vinh Sơn',
        parishId: parishIds[2].toString(),
        parishName: 'Giáo xứ Vinh Sơn',
        projectType: 'construction',
        description: 'Xây dựng nhà giáo lý 2 tầng, diện tích 500m2',
        budget: 3500000000,
        actualCost: 2800000000,
        startDate: new Date('2023-06-01'),
        expectedEnd: new Date('2024-12-31'),
        permitStatus: 'approved',
        progress: 75,
        status: 'in_progress',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        projectName: 'Sửa chữa Nhà thờ Thánh Tâm',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        projectType: 'renovation',
        description: 'Sửa chữa mái nhà thờ và sơn lại tường',
        budget: 800000000,
        actualCost: 750000000,
        startDate: new Date('2024-01-15'),
        expectedEnd: new Date('2024-06-30'),
        actualEnd: new Date('2024-05-20'),
        permitStatus: 'approved',
        progress: 100,
        status: 'completed',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        projectName: 'Xây dựng Nhà xứ Phúc Lộc',
        parishId: parishIds[3].toString(),
        parishName: 'Giáo xứ Phúc Lộc',
        projectType: 'construction',
        description: 'Xây dựng nhà xứ mới 2 tầng',
        budget: 2500000000,
        startDate: new Date('2024-09-01'),
        expectedEnd: new Date('2025-12-31'),
        permitStatus: 'pending',
        progress: 0,
        status: 'planning',
        createdAt: new Date(),
      },
    ];

    await projectsCollection.insertMany(projects);
    console.log(`Inserted ${projects.length} projects`);

    // ============================================
    // 16. ASSOCIATIONS - Hội đoàn
    // ============================================
    console.log('\n--- Seeding Associations ---');
    const associationsCollection = db.collection('associations');
    await associationsCollection.deleteMany({});

    const associations = [
      {
        _id: newId(),
        name: 'Legio Mariae',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        patronSaint: 'Đức Mẹ Maria',
        establishedDate: new Date('1970-05-13'),
        leaderName: 'Maria Nguyễn Thị Hương',
        memberCount: 45,
        budget: 15000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        name: 'Hội Mân Côi',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        patronSaint: 'Đức Mẹ Mân Côi',
        establishedDate: new Date('1965-10-07'),
        leaderName: 'Anna Trần Thị Mai',
        memberCount: 80,
        budget: 20000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        name: 'Hội Các Bà Mẹ Công Giáo',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        patronSaint: 'Thánh Monica',
        establishedDate: new Date('1980-08-27'),
        leaderName: 'Têrêsa Lê Thị Lan',
        memberCount: 60,
        budget: 18000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        name: 'Thiếu Nhi Thánh Thể',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        patronSaint: 'Thánh Thể Chúa Giêsu',
        establishedDate: new Date('1990-06-15'),
        leaderName: 'Giuse Phạm Văn Tuấn',
        memberCount: 120,
        budget: 25000000,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        name: 'Ca đoàn Cécilia',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        patronSaint: 'Thánh Cécilia',
        establishedDate: new Date('1985-11-22'),
        leaderName: 'Phanxicô Hoàng Văn Sơn',
        memberCount: 35,
        budget: 12000000,
        status: 'active',
        createdAt: new Date(),
      },
    ];

    await associationsCollection.insertMany(associations);
    console.log(`Inserted ${associations.length} associations`);

    // ============================================
    // 17. REQUESTS - E-Office (Đơn từ)
    // ============================================
    console.log('\n--- Seeding Requests ---');
    const requestsCollection = db.collection('requests');
    await requestsCollection.deleteMany({});

    const requests = [
      {
        _id: newId(),
        requestId: 'YC-2024-001',
        requestType: 'certificate',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        submittedBy: users[2]._id.toString(),
        submitterName: 'Maria Trần Thị Kế',
        status: 'approved',
        workflowStep: 3,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        requestId: 'YC-2024-002',
        requestType: 'permission',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        submittedBy: users[2]._id.toString(),
        submitterName: 'Maria Trần Thị Kế',
        status: 'processing',
        workflowStep: 2,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        updatedAt: new Date(),
      },
      {
        _id: newId(),
        requestId: 'YC-2024-003',
        requestType: 'report',
        parishId: parishIds[2].toString(),
        parishName: 'Giáo xứ Vinh Sơn',
        submittedBy: users[2]._id.toString(),
        submitterName: 'Maria Trần Thị Kế',
        status: 'pending',
        workflowStep: 1,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        updatedAt: new Date(),
      },
    ];

    await requestsCollection.insertMany(requests);
    console.log(`Inserted ${requests.length} requests`);

    // ============================================
    // 18. BAPTISMS - Sổ Rửa tội
    // ============================================
    console.log('\n--- Seeding Baptisms ---');
    const baptismsCollection = db.collection('baptisms');
    await baptismsCollection.deleteMany({});

    const baptisms = [
      {
        _id: newId(),
        baptismName: 'Giuse',
        fullName: 'Nguyễn Văn Minh',
        dob: new Date('2005-12-03'),
        baptismDate: new Date('2006-01-15'),
        baptismPlace: 'Nhà thờ Chính Tòa',
        minister: 'Cha Giuse Nguyễn Văn Linh',
        godfather: 'Phêrô Trần Văn Nam',
        godmother: 'Maria Lê Thị Hoa',
        fatherName: 'Giuse Nguyễn Văn An',
        motherName: 'Maria Trần Thị Bích',
        registerBook: '15',
        registerNo: '245',
        parishId: parishIds[0].toString(),
        parishName: 'Giáo xứ Chính Tòa',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        baptismName: 'Maria',
        fullName: 'Trần Thị Hương',
        dob: new Date('2010-05-20'),
        baptismDate: new Date('2010-08-15'),
        baptismPlace: 'Nhà thờ Thánh Tâm',
        minister: 'Cha Phêrô Trần Minh Đức',
        godfather: 'Gioan Lê Văn Cường',
        godmother: 'Têrêsa Phạm Thị Dung',
        fatherName: 'Phêrô Trần Văn Bình',
        motherName: 'Anna Lê Thị Cẩm',
        registerBook: '08',
        registerNo: '123',
        parishId: parishIds[1].toString(),
        parishName: 'Giáo xứ Thánh Tâm',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        baptismName: 'Phanxicô',
        fullName: 'Lê Văn Tuấn',
        dob: new Date('2015-09-10'),
        baptismDate: new Date('2016-01-08'),
        baptismPlace: 'Nhà thờ Vinh Sơn',
        minister: 'Cha Phaolô Lê Văn Hùng',
        godfather: 'Giuse Hoàng Văn Em',
        godmother: 'Maria Võ Thị Lan',
        fatherName: 'Gioan Lê Văn Cường',
        motherName: 'Têrêsa Phạm Thị Dung',
        registerBook: '05',
        registerNo: '089',
        parishId: parishIds[2].toString(),
        parishName: 'Giáo xứ Vinh Sơn',
        createdAt: new Date(),
      },
    ];

    await baptismsCollection.insertMany(baptisms);
    console.log(`Inserted ${baptisms.length} baptism records`);

    // ============================================
    // 19. MARRIAGES - Sổ Hôn phối
    // ============================================
    console.log('\n--- Seeding Marriages ---');
    const marriagesCollection = db.collection('marriages');
    await marriagesCollection.deleteMany({});

    const marriages = [
      {
        _id: newId(),
        groomName: 'Giuse Nguyễn Văn An',
        groomParish: 'Giáo xứ Chính Tòa',
        brideName: 'Maria Trần Thị Bích',
        brideParish: 'Giáo xứ Thánh Tâm',
        marriageDate: new Date('2000-11-25'),
        marriagePlace: 'Nhà thờ Chính Tòa',
        minister: 'Cha Giuse Nguyễn Văn Linh',
        witness1: 'Phêrô Trần Văn Bình',
        witness2: 'Anna Lê Thị Cẩm',
        registerBook: '10',
        registerNo: '156',
        createdAt: new Date(),
      },
      {
        _id: newId(),
        groomName: 'Gioan Lê Văn Cường',
        groomParish: 'Giáo xứ Vinh Sơn',
        brideName: 'Têrêsa Phạm Thị Dung',
        brideParish: 'Giáo xứ Thánh Tâm',
        marriageDate: new Date('2008-06-14'),
        marriagePlace: 'Nhà thờ Thánh Tâm',
        minister: 'Cha Phêrô Trần Minh Đức',
        witness1: 'Giuse Nguyễn Văn An',
        witness2: 'Maria Trần Thị Bích',
        registerBook: '05',
        registerNo: '089',
        createdAt: new Date(),
      },
    ];

    await marriagesCollection.insertMany(marriages);
    console.log(`Inserted ${marriages.length} marriage records`);

    // ============================================
    // 20. AUDIT LOGS - Nhật ký hệ thống
    // ============================================
    console.log('\n--- Seeding Audit Logs ---');
    const auditLogsCollection = db.collection('auditLogs');
    await auditLogsCollection.deleteMany({});

    const auditLogs = [
      {
        _id: newId(),
        userId: users[0]._id.toString(),
        userName: 'Quản trị viên Hệ thống',
        action: 'login',
        module: 'auth',
        ipAddress: '192.168.1.100',
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
      {
        _id: newId(),
        userId: users[1]._id.toString(),
        userName: 'Cha Giuse Nguyễn Văn Quản',
        action: 'approve',
        module: 'finance',
        recordId: transactions[0]._id.toString(),
        ipAddress: '192.168.1.101',
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
      {
        _id: newId(),
        userId: users[2]._id.toString(),
        userName: 'Maria Trần Thị Kế',
        action: 'create',
        module: 'finance',
        recordId: transactions[5]._id.toString(),
        ipAddress: '192.168.1.102',
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
      {
        _id: newId(),
        userId: users[0]._id.toString(),
        userName: 'Quản trị viên Hệ thống',
        action: 'update',
        module: 'settings',
        ipAddress: '192.168.1.100',
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
    ];

    await auditLogsCollection.insertMany(auditLogs);
    console.log(`Inserted ${auditLogs.length} audit log entries`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n========================================');
    console.log('SEED DATA COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\nDemo accounts:');
    console.log('  - admin@gpbmt.org / demo123 (Super Admin)');
    console.log('  - quanly@gpbmt.org / demo123 (Cha Quản lý)');
    console.log('  - ketoan@gpbmt.org / demo123 (Kế toán)');
    console.log('\nData summary:');
    console.log(`  - ${users.length} users`);
    console.log(`  - ${parishes.length} parishes`);
    console.log(`  - ${subParishes.length} sub-parishes`);
    console.log(`  - ${families.length} families`);
    console.log(`  - ${people.length} people`);
    console.log(`  - ${clergy.length} clergy`);
    console.log(`  - ${assignments.length} assignments`);
    console.log(`  - ${staffMembers.length} staff members`);
    console.log(`  - ${contracts.length} contracts`);
    console.log(`  - ${payrolls.length} payroll records`);
    console.log(`  - 11 funds`);
    console.log(`  - ${transactions.length} transactions`);
    console.log(`  - ${receipts.length} receipts`);
    console.log(`  - ${assets.length} assets`);
    console.log(`  - ${projects.length} projects`);
    console.log(`  - ${associations.length} associations`);
    console.log(`  - ${requests.length} requests`);
    console.log(`  - ${baptisms.length} baptism records`);
    console.log(`  - ${marriages.length} marriage records`);
    console.log(`  - ${auditLogs.length} audit logs`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDatabase();
