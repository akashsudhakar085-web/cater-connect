import { pgTable, foreignKey, uuid, text, numeric, boolean, timestamp, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const applicationStatus = pgEnum("application_status", ['PENDING', 'ACCEPTED', 'REJECTED'])
export const userRole = pgEnum("user_role", ['OWNER', 'WORKER'])


export const jobs = pgTable("jobs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ownerId: uuid("owner_id").notNull(),
	title: text().notNull(),
	description: text(),
	pay: numeric({ precision: 10, scale:  2 }).notNull(),
	category: text().notNull(),
	isEmergency: boolean("is_emergency").default(false).notNull(),
	status: text().default('OPEN').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "jobs_owner_id_users_id_fk"
		}),
]);

export const applications = pgTable("applications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobId: uuid("job_id").notNull(),
	workerId: uuid("worker_id").notNull(),
	status: applicationStatus().default('PENDING').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "applications_job_id_jobs_id_fk"
		}),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [users.id],
			name: "applications_worker_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	fullName: text("full_name"),
	role: userRole().default('WORKER').notNull(),
	phone: text(),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
