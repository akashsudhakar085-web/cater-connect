import { pgTable, text, timestamp, boolean, pgEnum, decimal, uuid } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['OWNER', 'WORKER']);
export const applicationStatusEnum = pgEnum('application_status', ['PENDING', 'ACCEPTED', 'REJECTED']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    fullName: text('full_name'),
    role: userRoleEnum('role').notNull().default('WORKER'),
    phone: text('phone'),
    avatarUrl: text('avatar_url'),
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
    status: text('status').default('OPEN').notNull(), // OPEN, CLOSED
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const applications = pgTable('applications', {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id').references(() => jobs.id).notNull(),
    workerId: uuid('worker_id').references(() => users.id).notNull(),
    status: applicationStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    link: text('link'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
