# Video Demo

https://www.youtube.com/watch?v=DiCF_CC2JIM


# QuickCourt 🏸

A comprehensive sports facility booking platform built with Next.js, featuring advanced queue management, role-based access control, and real-time booking conflict resolution.

## 🌟 Features

### Core Functionality
- **🏢 Venue Discovery**: Browse and search sports facilities with advanced filtering
- **📅 Smart Booking**: Real-time availability checking with conflict resolution
- **💳 Payment Integration**: Fake payment gateway with multiple payment methods
- **🔄 Queue System**: Advanced booking queue for handling concurrent requests
- **👥 Role Management**: Secure role-based access control with admin approval
- **⭐ Review System**: Users can review facilities after completing bookings

### Advanced Features
- **⚡ Real-time Conflict Resolution**: Handles multiple users booking the same slot
- **🎯 Queue Management**: Automatic promotion when payments fail/timeout
- **📊 Analytics Dashboard**: Comprehensive stats for admins and facility owners
- **🔒 Secure Authentication**: Clerk-based authentication with multiple user roles
- **📱 Responsive Design**: Mobile-first design with modern UI components

## 🚀 Tech Stack

- **Frontend**: Next.js 15.4.6, React, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: SQLite with Prisma ORM
- **Authentication**: Clerk
- **UI Components**: shadcn/ui, Lucide Icons
- **State Management**: React Hooks, Server State
- **Notifications**: Sonner Toast

## 🏗️ Architecture

### User Roles
1. **👤 Regular User**: Browse venues, make bookings, manage profile
2. **🏢 Facility Owner**: Manage facilities, courts, and bookings
3. **👑 Administrator**: Platform oversight, user management, facility approval

### Database Schema
```prisma
User ← Booking → Court → Facility
User ← RoleRequest (Admin approval system)
User ← Review → Facility
Booking ← Queue Management Fields
```

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Git

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/sombit-k/quickcourt.git
cd quickcourt
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file with:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

4. **Database Setup**
```bash
# Initialize database
npx prisma generate
npx prisma db push

# Seed with sample data (optional)
npx prisma db seed
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎯 Key Features Deep Dive

### 1. Advanced Booking Queue System

**Problem Solved**: Multiple users attempting to book the same time slot simultaneously.

**Solution**: 
- First user gets immediate booking opportunity (10-minute payment window)
- Subsequent users automatically enter a priority queue
- Automatic promotion when payments fail/timeout
- Real-time queue position tracking

```javascript
// Example: Booking with Queue Logic
const result = await createBookingWithQueue({
  courtId: "court-123",
  bookingDate: "2025-08-15",
  startTime: "14:00",
  // ... other booking details
});

if (result.queueInfo.isInQueue) {
  // User is in queue - show position and estimated wait time
  console.log(`Queue position: ${result.queueInfo.queuePosition}`);
} else {
  // Direct booking - redirect to payment
  router.push('/payment');
}
```

### 2. Role Request System

**Problem Solved**: Secure role elevation without compromising security.

**Features**:
- Users can request facility owner privileges
- Admin approval required for role changes
- Complete audit trail with timestamps
- Rejection with mandatory feedback

**Flow**:
1. User submits role request with justification
2. Admin reviews request in dedicated dashboard
3. Approval/rejection with comments
4. Automatic role assignment upon approval

### 3. Comprehensive Admin Dashboard

**Features**:
- Platform-wide statistics and analytics
- User management with ban/unban capabilities
- Facility approval workflow
- Role request management
- Booking oversight and reporting

### 4. Review System

**Problem Solved**: Trust and quality assurance for facilities.

**Features**:
- Only users with completed bookings can review
- Comprehensive 5-star rating system with comments
- Anonymous review option
- Edit and delete own reviews
- Real-time facility rating updates
- Admin oversight and review management

**Flow**:
1. User completes a booking (status: CONFIRMED, payment: PAID)
2. After booking date passes, review option becomes available
3. User can write one review per facility
4. Reviews update facility's average rating automatically

### 5. Facility Management

**For Facility Owners**:
- Create and manage multiple facilities
- Configure courts with pricing and availability
- Approve/reject booking requests
- View earnings and analytics
- Manage operating hours and amenities

## 🛠️ Development

### Project Structure
```
quickcourt/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin-only pages
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── actions/               # Server actions
├── components/            # Reusable UI components
├── lib/                   # Utility libraries
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

### Key Components

**Authentication**
- Clerk integration for secure user management
- Role-based route protection
- User synchronization between Clerk and database

**Database**
- Prisma ORM for type-safe database operations
- SQLite for development (easily switch to PostgreSQL/MySQL)
- Comprehensive relations and constraints

**UI/UX**
- shadcn/ui for consistent component library
- Tailwind CSS for responsive styling
- Mobile-first design approach

### Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma db seed   # Seed database

# Testing
npm run test         # Run tests (if configured)
```

## 🔧 Configuration

### Database Configuration
The application uses Prisma with SQLite by default. To switch to PostgreSQL:

1. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/quickcourt"
```

2. Update `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Clerk Authentication Setup

1. Create account at [Clerk.dev](https://clerk.dev)
2. Create new application
3. Copy API keys to `.env.local`
4. Configure sign-in/up URLs in Clerk dashboard

## 🎮 Usage Examples

### For Regular Users
1. **Browse Venues**: Filter by location, sport type, price range
2. **Make Booking**: Select court, date, time, and duration
3. **Handle Conflicts**: If slot taken, join queue automatically
4. **Complete Payment**: 10-minute window with multiple payment options
5. **Track Bookings**: View all bookings with status updates
6. **Write Reviews**: Rate and review facilities after completing bookings

### For Facility Owners
1. **Create Facility**: Add venue details, amenities, operating hours
2. **Manage Courts**: Configure court types, pricing, availability
3. **Handle Bookings**: Approve/reject booking requests
4. **View Analytics**: Track earnings, popular time slots, occupancy

### For Administrators
1. **Monitor Platform**: View global statistics and user activity
2. **Manage Users**: Ban/unban users, view booking history
3. **Approve Facilities**: Review and approve new venue registrations
4. **Handle Role Requests**: Approve/reject facility owner applications

## 🧪 Testing

### Testing the Queue System

Run the included test scripts to verify functionality:

```bash
# Test basic queue functionality
node test-queue.js

# Test hackathon edge case scenario
node test-hackathon-edge-case.js

# Test role request system
node test-role-requests.js
```

### Testing the Review System

Run the review system test to verify functionality:

```bash
# Test review system with current data
node test-review-system.js

# Create test completed bookings
node create-test-bookings.js

# Show facility IDs for testing
node show-facility-ids.js
```

### Manual Testing Scenarios

1. **Concurrent Booking Test**:
   - Open multiple browser tabs
   - Attempt to book same slot simultaneously
   - Verify queue system activates

2. **Payment Timeout Test**:
   - Start booking process
   - Let payment timer expire
   - Verify queue promotion works

3. **Role Request Test**:
   - Submit facility owner request as user
   - Review as admin
   - Verify role change upon approval

4. **Review System Test**:
   - Complete a booking (set status to CONFIRMED, payment to PAID)
   - Wait for booking date to pass or set past date
   - Visit facility page and write review
   - Verify review appears and updates facility rating

## 🚦 API Endpoints

### Authentication
- `POST /api/user/sync` - Synchronize user data with Clerk

### Bookings
- `GET /api/facility/bookings` - Get facility bookings
- `POST /api/booking/create` - Create new booking
- `PUT /api/booking/approve` - Approve booking (facility owners)

### Reviews
- `POST /api/review/create` - Create new review
- `PUT /api/review/update` - Update existing review
- `DELETE /api/review/delete` - Delete review
- `GET /api/review/facility/[id]` - Get facility reviews

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management data
- `POST /api/admin/facility/approve` - Approve facility

## 🔍 Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Reset database
npx prisma db push --force-reset
npx prisma generate
```

**2. Clerk Authentication Issues**
- Verify API keys in `.env.local`
- Check Clerk dashboard configuration
- Ensure redirect URLs match

**3. Queue System Not Working**
- Check database queue fields exist
- Verify booking actions import correctly
- Test with clean database state

**4. Role Request System Issues**
- Ensure RoleRequest table exists
- Check admin role permissions
- Verify action imports

**5. Review System Issues**
- Check users have completed bookings (CONFIRMED + PAID)
- Verify booking dates are in the past
- Ensure no duplicate reviews per user-facility
- Check facility rating updates correctly

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test queue system thoroughly
- Update documentation for new features
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the excellent framework
- **Clerk** for seamless authentication
- **Prisma** for type-safe database operations
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for responsive styling

## 📞 Support

For support and questions:
- 📧 Email: sombit2005@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/sombit-k/quickcourt/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/sombit-k/quickcourt/discussions)

---

**QuickCourt** - Built with ❤️ for seamless sports facility booking

*Perfect for hackathons, portfolio projects, and real-world applications*
