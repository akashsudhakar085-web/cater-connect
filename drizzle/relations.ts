import { relations } from "drizzle-orm/relations";
import { users, jobs, applications } from "./schema";

export const jobsRelations = relations(jobs, ({one, many}) => ({
	user: one(users, {
		fields: [jobs.ownerId],
		references: [users.id]
	}),
	applications: many(applications),
}));

export const usersRelations = relations(users, ({many}) => ({
	jobs: many(jobs),
	applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({one}) => ({
	job: one(jobs, {
		fields: [applications.jobId],
		references: [jobs.id]
	}),
	user: one(users, {
		fields: [applications.workerId],
		references: [users.id]
	}),
}));