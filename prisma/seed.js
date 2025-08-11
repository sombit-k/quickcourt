const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const users = [
  {
    clerkId: 'user_001',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    role: 'USER',
    phone: '+91-9876543210',
    isVerified: true,
    lastLogin: new Date('2024-01-15T10:30:00Z')
  },
  {
    clerkId: 'user_002',
    email: 'priya.sharma@example.com',
    firstName: 'Priya',
    lastName: 'Sharma',
    fullName: 'Priya Sharma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    role: 'FACILITY_OWNER',
    phone: '+91-9876543211',
    isVerified: true,
    lastLogin: new Date('2024-01-16T09:15:00Z')
  },
  {
    clerkId: 'user_003',
    email: 'admin@quickcourt.com',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'ADMIN',
    phone: '+91-9876543212',
    isVerified: true,
    lastLogin: new Date('2024-01-16T11:45:00Z')
  },
  {
    clerkId: 'user_004',
    email: 'rahul.patel@example.com',
    firstName: 'Rahul',
    lastName: 'Patel',
    fullName: 'Rahul Patel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    role: 'FACILITY_OWNER',
    phone: '+91-9876543213',
    isVerified: true,
    lastLogin: new Date('2024-01-15T14:20:00Z')
  },
  {
    clerkId: 'user_005',
    email: 'sneha.singh@example.com',
    firstName: 'Sneha',
    lastName: 'Singh',
    fullName: 'Sneha Singh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
    role: 'USER',
    phone: '+91-9876543214',
    isVerified: true,
    lastLogin: new Date('2024-01-16T08:30:00Z')
  }
];

const facilities = [
  // Bangalore, Karnataka
  {
    name: 'Elite Badminton Center',
    description: 'Premium badminton facility with professional courts and world-class amenities',
    address: '123 Sports Complex, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560034',
    phone: '+91-9876543220',
    email: 'info@elitebadminton.com',
    website: 'https://elitebadminton.com',
    sportsTypes: JSON.stringify(['Badminton']),
    amenities: JSON.stringify(['Parking', 'Cafeteria', 'Locker Room', 'AC', 'Wi-Fi']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-22:00',
      tuesday: '06:00-22:00',
      wednesday: '06:00-22:00',
      thursday: '06:00-22:00',
      friday: '06:00-22:00',
      saturday: '06:00-23:00',
      sunday: '07:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.5,
    totalReviews: 156,
    isActive: true
  },
  {
    name: 'Pro Basketball Arena',
    description: 'State-of-the-art basketball facility with multiple courts and professional lighting',
    address: '456 Sports Avenue, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560038',
    phone: '+91-9876543221',
    email: 'contact@probasketball.com',
    website: 'https://probasketball.com',
    sportsTypes: JSON.stringify(['Basketball']),
    amenities: JSON.stringify(['Parking', 'Changing Room', 'Equipment Rental', 'Scoreboard']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500',
      'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '05:30-23:00',
      tuesday: '05:30-23:00',
      wednesday: '05:30-23:00',
      thursday: '05:30-23:00',
      friday: '05:30-23:00',
      saturday: '05:30-23:30',
      sunday: '06:00-22:00'
    }),
    status: 'APPROVED',
    rating: 4.7,
    totalReviews: 203,
    isActive: true
  },
  
  // Mumbai, Maharashtra
  {
    name: 'Mumbai Cricket Hub',
    description: 'Professional cricket ground with nets and practice facilities',
    address: '789 Marine Drive Sports Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400002',
    phone: '+91-9876543230',
    email: 'info@mumbaicricket.com',
    website: 'https://mumbaicricket.com',
    sportsTypes: JSON.stringify(['Cricket']),
    amenities: JSON.stringify(['Parking', 'Pavilion', 'Equipment Rental', 'Coaching', 'Cafeteria']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-21:00',
      tuesday: '06:00-21:00',
      wednesday: '06:00-21:00',
      thursday: '06:00-21:00',
      friday: '06:00-21:00',
      saturday: '05:30-22:00',
      sunday: '06:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.8,
    totalReviews: 312,
    isActive: true
  },
  {
    name: 'Powai Tennis Club',
    description: 'Premium tennis facility with clay and hard courts in Mumbai',
    address: '321 Powai Lake View, Hiranandani Gardens',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400076',
    phone: '+91-9876543231',
    email: 'bookings@powaitennis.com',
    website: 'https://powaitennis.com',
    sportsTypes: JSON.stringify(['Tennis']),
    amenities: JSON.stringify(['Parking', 'Pro Shop', 'Coaching', 'Clubhouse', 'Swimming Pool']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500',
      'https://images.unsplash.com/photo-1593766827228-8737b4534aa2?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-22:00',
      tuesday: '06:00-22:00',
      wednesday: '06:00-22:00',
      thursday: '06:00-22:00',
      friday: '06:00-22:00',
      saturday: '06:00-23:00',
      sunday: '07:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.6,
    totalReviews: 189,
    isActive: true
  },

  // Delhi
  {
    name: 'Delhi Football Academy',
    description: 'Modern football turf with FIFA-standard facilities in the capital',
    address: '456 Connaught Place Sports Center',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110001',
    phone: '+91-9876543240',
    email: 'info@delhifootball.com',
    website: 'https://delhifootball.com',
    sportsTypes: JSON.stringify(['Football']),
    amenities: JSON.stringify(['Parking', 'Floodlights', 'Changing Room', 'Coaching', 'Equipment Storage']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500',
      'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-23:00',
      tuesday: '06:00-23:00',
      wednesday: '06:00-23:00',
      thursday: '06:00-23:00',
      friday: '06:00-23:00',
      saturday: '06:00-24:00',
      sunday: '07:00-23:00'
    }),
    status: 'APPROVED',
    rating: 4.4,
    totalReviews: 267,
    isActive: true
  },
  {
    name: 'Capital Badminton Arena',
    description: 'Multi-court badminton facility with international standard courts',
    address: '789 Lajpat Nagar Sports Complex',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110024',
    phone: '+91-9876543241',
    email: 'play@capitalbadminton.com',
    website: 'https://capitalbadminton.com',
    sportsTypes: JSON.stringify(['Badminton']),
    amenities: JSON.stringify(['Parking', 'AC', 'Equipment Rental', 'Coaching', 'Cafeteria']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '05:30-22:30',
      tuesday: '05:30-22:30',
      wednesday: '05:30-22:30',
      thursday: '05:30-22:30',
      friday: '05:30-22:30',
      saturday: '05:30-23:00',
      sunday: '06:00-22:00'
    }),
    status: 'APPROVED',
    rating: 4.3,
    totalReviews: 198,
    isActive: true
  },

  // Chennai, Tamil Nadu
  {
    name: 'Chennai Swimming Academy',
    description: 'Olympic-size swimming pool with coaching and aqua fitness programs',
    address: '123 Marina Beach Road, Mylapore',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zipCode: '600004',
    phone: '+91-9876543250',
    email: 'swim@chennaiaquatics.com',
    website: 'https://chennaiaquatics.com',
    sportsTypes: JSON.stringify(['Swimming']),
    amenities: JSON.stringify(['Parking', 'Locker Room', 'Shower', 'Lifeguard', 'Pool Equipment', 'Coaching']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '05:00-22:00',
      tuesday: '05:00-22:00',
      wednesday: '05:00-22:00',
      thursday: '05:00-22:00',
      friday: '05:00-22:00',
      saturday: '05:00-23:00',
      sunday: '06:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.5,
    totalReviews: 234,
    isActive: true
  },
  {
    name: 'Anna Nagar Basketball Courts',
    description: 'Indoor and outdoor basketball courts with professional lighting',
    address: '456 Anna Nagar West, 2nd Avenue',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zipCode: '600040',
    phone: '+91-9876543251',
    email: 'hoops@annanagarcourts.com',
    website: 'https://annanagarcourts.com',
    sportsTypes: JSON.stringify(['Basketball']),
    amenities: JSON.stringify(['Parking', 'Equipment Rental', 'Scoreboard', 'Changing Room']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500',
      'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-22:00',
      tuesday: '06:00-22:00',
      wednesday: '06:00-22:00',
      thursday: '06:00-22:00',
      friday: '06:00-22:00',
      saturday: '06:00-23:00',
      sunday: '07:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.2,
    totalReviews: 156,
    isActive: true
  },

  // Hyderabad, Telangana
  {
    name: 'Hyderabad Table Tennis Center',
    description: 'Premium table tennis facility with international standard tables',
    address: '789 Banjara Hills, Road No. 12',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '500034',
    phone: '+91-9876543260',
    email: 'play@hyderabadtt.com',
    website: 'https://hyderabadtt.com',
    sportsTypes: JSON.stringify(['Table Tennis']),
    amenities: JSON.stringify(['Parking', 'AC', 'Equipment Rental', 'Coaching', 'Tournament Hall']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-23:00',
      tuesday: '06:00-23:00',
      wednesday: '06:00-23:00',
      thursday: '06:00-23:00',
      friday: '06:00-23:00',
      saturday: '06:00-24:00',
      sunday: '07:00-22:00'
    }),
    status: 'APPROVED',
    rating: 4.7,
    totalReviews: 189,
    isActive: true
  },
  {
    name: 'Gachibowli Squash Complex',
    description: 'Modern squash courts with glass walls and air conditioning',
    address: '321 Financial District, Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '500032',
    phone: '+91-9876543261',
    email: 'booking@gachibowlisquash.com',
    website: 'https://gachibowlisquash.com',
    sportsTypes: JSON.stringify(['Squash']),
    amenities: JSON.stringify(['Parking', 'AC', 'Equipment Rental', 'Shower', 'Viewing Gallery']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-22:00',
      tuesday: '06:00-22:00',
      wednesday: '06:00-22:00',
      thursday: '06:00-22:00',
      friday: '06:00-22:00',
      saturday: '06:00-23:00',
      sunday: '07:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.4,
    totalReviews: 145,
    isActive: true
  },

  // Pune, Maharashtra
  {
    name: 'Pune Volleyball Arena',
    description: 'Indoor volleyball courts with wooden flooring and professional nets',
    address: '456 FC Road, Shivajinagar',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411005',
    phone: '+91-9876543270',
    email: 'spike@punevolleyball.com',
    website: 'https://punevolleyball.com',
    sportsTypes: JSON.stringify(['Volleyball']),
    amenities: JSON.stringify(['Parking', 'Equipment Storage', 'Changing Room', 'Scoreboard']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-22:00',
      tuesday: '06:00-22:00',
      wednesday: '06:00-22:00',
      thursday: '06:00-22:00',
      friday: '06:00-22:00',
      saturday: '06:00-23:00',
      sunday: '07:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.3,
    totalReviews: 123,
    isActive: true
  },
  {
    name: 'Kothrud Boxing Gym',
    description: 'Professional boxing gym with Olympic rings and training equipment',
    address: '789 Kothrud Depot, Paud Road',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411038',
    phone: '+91-9876543271',
    email: 'fight@kothrudboxing.com',
    website: 'https://kothrudboxing.com',
    sportsTypes: JSON.stringify(['Boxing']),
    amenities: JSON.stringify(['Parking', 'Equipment Rental', 'Personal Training', 'Shower']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '05:00-22:00',
      tuesday: '05:00-22:00',
      wednesday: '05:00-22:00',
      thursday: '05:00-22:00',
      friday: '05:00-22:00',
      saturday: '05:00-23:00',
      sunday: '07:00-20:00'
    }),
    status: 'APPROVED',
    rating: 4.6,
    totalReviews: 178,
    isActive: true
  },

  // Kolkata, West Bengal
  {
    name: 'Kolkata Cricket Academy',
    description: 'Historic cricket ground with net practice and coaching facilities',
    address: '123 Eden Gardens Area, BBD Bagh',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700001',
    phone: '+91-9876543280',
    email: 'cricket@kolkatacricket.com',
    website: 'https://kolkatacricket.com',
    sportsTypes: JSON.stringify(['Cricket']),
    amenities: JSON.stringify(['Parking', 'Pavilion', 'Equipment Rental', 'Coaching', 'Museum']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-21:00',
      tuesday: '06:00-21:00',
      wednesday: '06:00-21:00',
      thursday: '06:00-21:00',
      friday: '06:00-21:00',
      saturday: '05:30-22:00',
      sunday: '06:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.8,
    totalReviews: 567,
    isActive: true
  },
  {
    name: 'Salt Lake Badminton Club',
    description: 'Modern badminton facility with multiple courts and air conditioning',
    address: '456 Salt Lake Sector V, Bidhannagar',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700091',
    phone: '+91-9876543281',
    email: 'shuttle@saltlakebadminton.com',
    website: 'https://saltlakebadminton.com',
    sportsTypes: JSON.stringify(['Badminton']),
    amenities: JSON.stringify(['Parking', 'AC', 'Equipment Rental', 'Coaching', 'Cafeteria']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '05:30-22:30',
      tuesday: '05:30-22:30',
      wednesday: '05:30-22:30',
      thursday: '05:30-22:30',
      friday: '05:30-22:30',
      saturday: '05:30-23:00',
      sunday: '06:00-22:00'
    }),
    status: 'APPROVED',
    rating: 4.4,
    totalReviews: 234,
    isActive: true
  },

  // Ahmedabad, Gujarat
  {
    name: 'Ahmedabad Tennis Academy',
    description: 'Premier tennis facility with clay courts and professional coaching',
    address: '789 SG Highway, Bodakdev',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zipCode: '380054',
    phone: '+91-9876543290',
    email: 'serve@ahmedabadtennis.com',
    website: 'https://ahmedabadtennis.com',
    sportsTypes: JSON.stringify(['Tennis']),
    amenities: JSON.stringify(['Parking', 'Pro Shop', 'Coaching', 'Clubhouse', 'Restaurant']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500',
      'https://images.unsplash.com/photo-1593766827228-8737b4534aa2?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '06:00-22:00',
      tuesday: '06:00-22:00',
      wednesday: '06:00-22:00',
      thursday: '06:00-22:00',
      friday: '06:00-22:00',
      saturday: '06:00-23:00',
      sunday: '07:00-21:00'
    }),
    status: 'APPROVED',
    rating: 4.7,
    totalReviews: 289,
    isActive: true
  },
  {
    name: 'Navrangpura Swimming Pool',
    description: 'Community swimming pool with lanes for competitive swimming',
    address: '321 Navrangpura, University Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zipCode: '380009',
    phone: '+91-9876543291',
    email: 'swim@navrangpurapool.com',
    website: 'https://navrangpurapool.com',
    sportsTypes: JSON.stringify(['Swimming']),
    amenities: JSON.stringify(['Parking', 'Locker Room', 'Shower', 'Lifeguard', 'Pool Equipment']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500'
    ]),
    operatingHours: JSON.stringify({
      monday: '05:00-21:00',
      tuesday: '05:00-21:00',
      wednesday: '05:00-21:00',
      thursday: '05:00-21:00',
      friday: '05:00-21:00',
      saturday: '05:00-22:00',
      sunday: '06:00-20:00'
    }),
    status: 'APPROVED',
    rating: 4.2,
    totalReviews: 167,
    isActive: true
  }
];

const courts = [
  // Elite Badminton Center courts (Bangalore)
  { name: 'Court 1', sportType: 'Badminton', pricePerHour: 500, description: 'Professional court with wooden flooring' },
  { name: 'Court 2', sportType: 'Badminton', pricePerHour: 500, description: 'Air-conditioned court with premium lighting' },
  { name: 'Court 3', sportType: 'Badminton', pricePerHour: 600, description: 'VIP court with premium amenities' },
  
  // Pro Basketball Arena courts (Bangalore)
  { name: 'Full Court A', sportType: 'Basketball', pricePerHour: 800, description: 'Full-size basketball court with professional hoops' },
  { name: 'Half Court B', sportType: 'Basketball', pricePerHour: 500, description: 'Half court perfect for practice sessions' },
  
  // Mumbai Cricket Hub courts
  { name: 'Main Ground', sportType: 'Cricket', pricePerHour: 2000, description: 'Full-size cricket ground with nets' },
  { name: 'Practice Net 1', sportType: 'Cricket', pricePerHour: 800, description: 'Professional practice nets' },
  { name: 'Practice Net 2', sportType: 'Cricket', pricePerHour: 800, description: 'Professional practice nets' },
  
  // Powai Tennis Club courts (Mumbai)
  { name: 'Clay Court 1', sportType: 'Tennis', pricePerHour: 800, description: 'Professional clay court surface' },
  { name: 'Hard Court 2', sportType: 'Tennis', pricePerHour: 700, description: 'All-weather hard court' },
  { name: 'Hard Court 3', sportType: 'Tennis', pricePerHour: 700, description: 'Championship hard court' },
  
  // Delhi Football Academy courts
  { name: 'Main Turf', sportType: 'Football', pricePerHour: 1500, description: 'FIFA-standard artificial turf with floodlights' },
  { name: 'Training Ground', sportType: 'Football', pricePerHour: 1000, description: 'Smaller turf for training sessions' },
  
  // Capital Badminton Arena courts (Delhi)
  { name: 'Court A', sportType: 'Badminton', pricePerHour: 600, description: 'International standard court' },
  { name: 'Court B', sportType: 'Badminton', pricePerHour: 600, description: 'International standard court' },
  { name: 'Court C', sportType: 'Badminton', pricePerHour: 550, description: 'Practice court with quality lighting' },
  
  // Chennai Swimming Academy courts
  { name: 'Olympic Pool', sportType: 'Swimming', pricePerHour: 500, description: '50m Olympic-size swimming pool' },
  { name: 'Training Pool', sportType: 'Swimming', pricePerHour: 350, description: '25m pool for training and lap swimming' },
  { name: 'Kids Pool', sportType: 'Swimming', pricePerHour: 300, description: 'Shallow pool for children and beginners' },
  
  // Anna Nagar Basketball Courts (Chennai)
  { name: 'Indoor Court 1', sportType: 'Basketball', pricePerHour: 700, description: 'Air-conditioned indoor court' },
  { name: 'Outdoor Court 2', sportType: 'Basketball', pricePerHour: 500, description: 'Outdoor court with floodlights' },
  
  // Hyderabad Table Tennis Center courts
  { name: 'Table 1', sportType: 'Table Tennis', pricePerHour: 300, description: 'International standard table' },
  { name: 'Table 2', sportType: 'Table Tennis', pricePerHour: 300, description: 'International standard table' },
  { name: 'Table 3', sportType: 'Table Tennis', pricePerHour: 300, description: 'International standard table' },
  { name: 'Table 4', sportType: 'Table Tennis', pricePerHour: 350, description: 'Premium table with professional lighting' },
  
  // Gachibowli Squash Complex courts (Hyderabad)
  { name: 'Glass Court 1', sportType: 'Squash', pricePerHour: 450, description: 'Glass-walled court with viewing gallery' },
  { name: 'Glass Court 2', sportType: 'Squash', pricePerHour: 450, description: 'Glass-walled court with viewing gallery' },
  { name: 'Standard Court 3', sportType: 'Squash', pricePerHour: 400, description: 'Standard squash court' },
  
  // Pune Volleyball Arena courts
  { name: 'Indoor Court 1', sportType: 'Volleyball', pricePerHour: 600, description: 'Professional indoor volleyball court' },
  { name: 'Indoor Court 2', sportType: 'Volleyball', pricePerHour: 600, description: 'Professional indoor volleyball court' },
  
  // Kothrud Boxing Gym courts (Pune)
  { name: 'Ring 1', sportType: 'Boxing', pricePerHour: 700, description: 'Professional boxing ring' },
  { name: 'Training Area', sportType: 'Boxing', pricePerHour: 500, description: 'Open training area with equipment' },
  
  // Kolkata Cricket Academy courts
  { name: 'Main Ground', sportType: 'Cricket', pricePerHour: 2500, description: 'Historic cricket ground' },
  { name: 'Practice Net 1', sportType: 'Cricket', pricePerHour: 900, description: 'Professional practice nets' },
  { name: 'Practice Net 2', sportType: 'Cricket', pricePerHour: 900, description: 'Professional practice nets' },
  { name: 'Practice Net 3', sportType: 'Cricket', pricePerHour: 900, description: 'Professional practice nets' },
  
  // Salt Lake Badminton Club courts (Kolkata)
  { name: 'Court 1', sportType: 'Badminton', pricePerHour: 450, description: 'Air-conditioned court with wooden flooring' },
  { name: 'Court 2', sportType: 'Badminton', pricePerHour: 450, description: 'Air-conditioned court with wooden flooring' },
  { name: 'Court 3', sportType: 'Badminton', pricePerHour: 450, description: 'Air-conditioned court with wooden flooring' },
  { name: 'Court 4', sportType: 'Badminton', pricePerHour: 500, description: 'Premium court with advanced lighting' },
  
  // Ahmedabad Tennis Academy courts
  { name: 'Clay Court 1', sportType: 'Tennis', pricePerHour: 750, description: 'Professional clay court surface' },
  { name: 'Clay Court 2', sportType: 'Tennis', pricePerHour: 750, description: 'Professional clay court surface' },
  { name: 'Hard Court 3', sportType: 'Tennis', pricePerHour: 650, description: 'All-weather hard court' },
  { name: 'Hard Court 4', sportType: 'Tennis', pricePerHour: 650, description: 'All-weather hard court' },
  
  // Navrangpura Swimming Pool courts (Ahmedabad)
  { name: 'Main Pool', sportType: 'Swimming', pricePerHour: 400, description: 'Community swimming pool with lanes' },
  { name: 'Training Pool', sportType: 'Swimming', pricePerHour: 300, description: 'Smaller pool for training' }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.analytics.deleteMany();
  await prisma.report.deleteMany();
  await prisma.blockedTimeSlot.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.court.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Seed users
  const createdUsers = [];
  for (let i = 0; i < users.length; i++) {
    const user = await prisma.user.create({
      data: users[i]
    });
    createdUsers.push(user);
    console.log(`👤 Created user: ${user.fullName}`);
  }

  // Seed facilities
  const createdFacilities = [];
  for (let i = 0; i < facilities.length; i++) {
    const facilityData = {
      ...facilities[i],
      ownerId: createdUsers[i % 2 === 0 ? 1 : 3].id // Alternate between facility owners
    };
    
    const facility = await prisma.facility.create({
      data: facilityData
    });
    createdFacilities.push(facility);
    console.log(`🏢 Created facility: ${facility.name}`);
  }

  // Seed courts
  const createdCourts = [];
  let courtIndex = 0;
  for (let facilityIndex = 0; facilityIndex < createdFacilities.length; facilityIndex++) {
    const facility = createdFacilities[facilityIndex];
    const courtsPerFacility = facilityIndex === 0 ? 3 : facilityIndex === 1 ? 2 : facilityIndex === 2 ? 3 : 1;
    
    for (let i = 0; i < courtsPerFacility; i++) {
      const court = await prisma.court.create({
        data: {
          ...courts[courtIndex],
          facilityId: facility.id
        }
      });
      createdCourts.push(court);
      console.log(`🏟️  Created court: ${court.name} at ${facility.name}`);
      courtIndex++;
    }
  }

  // Seed bookings
  const bookingsData = [
    {
      bookingDate: new Date('2024-01-20T00:00:00Z'),
      startTime: '10:00',
      endTime: '11:00',
      duration: 1,
      pricePerHour: 500,
      totalPrice: 500,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      notes: 'Regular badminton session - awaiting approval'
    },
    {
      bookingDate: new Date('2024-01-21T00:00:00Z'),
      startTime: '18:00',
      endTime: '20:00',
      duration: 2,
      pricePerHour: 800,
      totalPrice: 1600,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      notes: 'Basketball practice session - awaiting approval'
    },
    {
      bookingDate: new Date('2024-01-22T00:00:00Z'),
      startTime: '09:00',
      endTime: '10:00',
      duration: 1,
      pricePerHour: 600,
      totalPrice: 600,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      notes: 'Tennis coaching session'
    }
  ];

  for (let i = 0; i < bookingsData.length; i++) {
    const booking = await prisma.booking.create({
      data: {
        ...bookingsData[i],
        userId: createdUsers[i % 2].id,
        facilityId: createdFacilities[i].id,
        courtId: createdCourts[i].id
      }
    });
    console.log(`📅 Created booking for ${booking.bookingDate.toDateString()}`);
  }

  // Seed reviews
  const reviewsData = [
    { rating: 5, comment: 'Excellent badminton facility! Clean courts and great service.' },
    { rating: 4, comment: 'Good basketball court, could use better lighting in the evening.' },
    { rating: 5, comment: 'Amazing tennis academy with professional coaching staff.' },
    { rating: 4, comment: 'Great football turf, well maintained artificial grass.' },
    { rating: 4, comment: 'Clean swimming pool with good facilities.' }
  ];

  for (let i = 0; i < reviewsData.length; i++) {
    const review = await prisma.review.create({
      data: {
        ...reviewsData[i],
        userId: createdUsers[i % 2].id,
        facilityId: createdFacilities[i].id
      }
    });
    console.log(`⭐ Created review for ${createdFacilities[i].name}`);
  }

  // Seed blocked time slots
  const blockedSlots = [
    {
      date: new Date('2024-01-25T00:00:00Z'),
      startTime: '12:00',
      endTime: '14:00',
      reason: 'maintenance',
      description: 'Regular maintenance and cleaning'
    },
    {
      date: new Date('2024-01-26T00:00:00Z'),
      startTime: '09:00',
      endTime: '12:00',
      reason: 'private_event',
      description: 'Private tournament booking'
    }
  ];

  for (let i = 0; i < blockedSlots.length; i++) {
    const blockedSlot = await prisma.blockedTimeSlot.create({
      data: {
        ...blockedSlots[i],
        facilityId: createdFacilities[i].id,
        courtId: createdCourts[i].id
      }
    });
    console.log(`🚫 Created blocked slot for ${blockedSlot.date.toDateString()}`);
  }

  // Seed analytics
  const analyticsData = [
    {
      date: new Date('2024-01-15T00:00:00Z'),
      totalBookings: 45,
      totalRevenue: 22500,
      newUsers: 12,
      activeFacilities: 5,
      popularSports: JSON.stringify({ 'Badminton': 20, 'Basketball': 12, 'Tennis': 8, 'Football': 5 }),
      peakHours: JSON.stringify({ '18:00': 15, '19:00': 18, '20:00': 12, '10:00': 8 })
    },
    {
      date: new Date('2024-01-16T00:00:00Z'),
      totalBookings: 52,
      totalRevenue: 28600,
      newUsers: 8,
      activeFacilities: 5,
      popularSports: JSON.stringify({ 'Badminton': 22, 'Basketball': 15, 'Tennis': 10, 'Football': 5 }),
      peakHours: JSON.stringify({ '18:00': 20, '19:00': 16, '20:00': 10, '09:00': 6 })
    }
  ];

  for (const analytics of analyticsData) {
    const created = await prisma.analytics.create({
      data: analytics
    });
    console.log(`📊 Created analytics for ${created.date.toDateString()}`);
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`Created ${createdUsers.length} users, ${createdFacilities.length} facilities, ${createdCourts.length} courts`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
