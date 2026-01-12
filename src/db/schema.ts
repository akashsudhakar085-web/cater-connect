import { pgTable, text, timestamp, boolean, pgEnum, decimal, uuid, integer } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['OWNER', 'WORKER']);
export const applicationStatusEnum = pgEnum('application_status', ['PENDING', 'ACCEPTED', 'REJECTED', 'STARTED', 'COMPLETED']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['FREE', 'PRO']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    fullName: text('full_name'),
    role: userRoleEnum('role').notNull().default('WORKER'),
    tier: subscriptionTierEnum('tier').notNull().default('FREE'),
    phone: text('phone'),
    avatarUrl: text('avatar_url'),
    // Worker Profile Fields
    serviceRole: text('service_role'), // e.g., "Master Chef"
    baseLocation: text('base_location'), // e.g., "Chennai"
    dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }), // Per Day Rate
    whatsappContact: text('whatsapp_contact'),
    // Referral & Pro Fields
    referralCode: text('referral_code').unique(), // e.g., "AKASH123"
    referralCount: integer('referral_count').default(0), // Track successful invites
    referredBy: text('referred_by'), // Who referred this user
    proExpiresAt: timestamp('pro_expires_at'), // Date when Pro subscription ends
    // Ratings
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
    ratingCount: integer('rating_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').references(() => users.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    pay: decimal('pay', { precision: 10, scale: 2 }).notNull(),
    category: text('category').notNull(),
    location: text('location').notNull().default('General'),
    isEmergency: boolean('is_emergency').default(false).notNull(),
    status: text('status').default('OPEN').notNull(), // OPEN, CLOSED, COMPLETED
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const applications = pgTable('applications', {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id').references(() => jobs.id).notNull(),
    workerId: uuid('worker_id').references(() => users.id).notNull(),
    status: applicationStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    link: text('link'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    senderId: uuid('sender_id').references(() => users.id).notNull(),
    receiverId: uuid('receiver_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ratings = pgTable('ratings', {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id').references(() => jobs.id).notNull(),
    raterId: uuid('rater_id').references(() => users.id).notNull(),
    ratedUserId: uuid('rated_user_id').references(() => users.id).notNull(),
    rating: integer('rating').notNull(), // 1-5
    review: text('review'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
