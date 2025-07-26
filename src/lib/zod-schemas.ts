// path: src/lib/zod-schemas.ts

import { z } from 'zod';

// Enums
export const UserRoleSchema = z.enum(['ADMIN', 'USER']);
export const BillingPeriodSchema = z.enum(['MONTH', 'YEAR']);
export const UrgencySchema = z.enum(['IMMEDIATE', 'LT_3M', 'GT_3M']);
export const RequestStatusSchema = z.enum(['DRAFT', 'SUBMITTED', 'REVIEW', 'ACCEPTED', 'REFUSED']);
export const ProjectStatusSchema = z.enum(['STEP1', 'STEP2', 'STEP3', 'STEP4', 'DONE']);
export const NotificationTypeSchema = z.enum(['ALERT_CONTRACT', 'REQUEST', 'PROJECT_TASK', 'SYSTEM']);
export const EconomyTypeSchema = z.enum(['INACTIVE_LICENSE', 'REDUNDANCY', 'LOW_SATISFACTION', 'RENEWAL']);

// User
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema,
  companyId: z.string().uuid(),
  entityId: z.string().uuid().optional(),
  linkedinId: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// Software
export const SoftwareSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  version: z.string().optional(),
  category: z.string().optional(),
  externalRefId: z.string().optional(),
  createdAt: z.string().datetime(),
  usersCount: z.number().optional(),
  averageRating: z.number().optional(),
  reviewsCount: z.number().optional(),
});

export type Software = z.infer<typeof SoftwareSchema>;

// Contract
export const ContractSchema = z.object({
  id: z.string().uuid(),
  softwareId: z.string().uuid(),
  entityId: z.string().uuid().optional(),
  costAmount: z.number(),
  currency: z.string().default('EUR'),
  billingPeriod: BillingPeriodSchema,
  endDate: z.string().date(),
  noticeDays: z.number(),
  createdAt: z.string().datetime(),
});

export type Contract = z.infer<typeof ContractSchema>;

// Review
export const ReviewSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  softwareId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  strengths: z.string(),
  weaknesses: z.string(),
  improvement: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  user: UserSchema.optional(),
});

export type Review = z.infer<typeof ReviewSchema>;

// Request
export const RequestSchema = z.object({
  id: z.string().uuid(),
  requesterId: z.string().uuid(),
  softwareRef: z.string().optional(),
  softwareId: z.string().uuid().optional(),
  descriptionNeed: z.string().max(280),
  urgency: UrgencySchema,
  estBudget: z.number().optional(),
  status: RequestStatusSchema,
  votesCount: z.number().default(0),
  createdAt: z.string().datetime(),
  requester: UserSchema.optional(),
  hasUserVoted: z.boolean().optional(),
});

export type Request = z.infer<typeof RequestSchema>;

// Purchase Project
export const PurchaseProjectSchema = z.object({
  id: z.string().uuid(),
  requestId: z.string().uuid(),
  softwareId: z.string().uuid().optional(),
  status: ProjectStatusSchema,
  roiEstimate: z.string().optional(),
  risks: z.string().optional(),
  createdAt: z.string().datetime(),
  request: RequestSchema.optional(),
  software: SoftwareSchema.optional(),
});

export type PurchaseProject = z.infer<typeof PurchaseProjectSchema>;

// Task
export const TaskSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().date().optional(),
  done: z.boolean().default(false),
  assignee: UserSchema.optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Notification
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeSchema,
  payload: z.record(z.any()),
  readAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Economy Item
export const EconomyItemSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  softwareId: z.string().uuid(),
  type: EconomyTypeSchema,
  estimatedAmount: z.number(),
  software: SoftwareSchema.optional(),
});

export type EconomyItem = z.infer<typeof EconomyItemSchema>;

// Badge
export const BadgeSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  label: z.string(),
  description: z.string(),
});

export type Badge = z.infer<typeof BadgeSchema>;

// User Badge
export const UserBadgeSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
  earnedAt: z.string().datetime(),
  badge: BadgeSchema,
});

export type UserBadge = z.infer<typeof UserBadgeSchema>;

// API Response wrappers
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number().optional(),
    limit: z.number().optional(),
    nextCursor: z.string().optional(),
  });

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.boolean().default(true),
  });

// Dashboard specific schemas
export const DashboardCostsSchema = z.object({
  totalAnnual: z.number(),
  byEntity: z.array(z.object({
    entityId: z.string().uuid(),
    entityName: z.string(),
    amount: z.number(),
  })),
  byCategory: z.array(z.object({
    category: z.string(),
    amount: z.number(),
  })),
});

export type DashboardCosts = z.infer<typeof DashboardCostsSchema>;

export const ContractAlertSchema = z.object({
  id: z.string().uuid(),
  softwareName: z.string(),
  endDate: z.string().date(),
  daysRemaining: z.number(),
  costAmount: z.number(),
  currency: z.string(),
});

export type ContractAlert = z.infer<typeof ContractAlertSchema>;

// Import schemas
export const ImportBatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['DRAFT', 'IMPORTED']),
  mapping: z.record(z.string()).optional(),
  previewData: z.array(z.record(z.any())).optional(),
  errors: z.array(z.object({
    row: z.number(),
    field: z.string(),
    message: z.string(),
  })).optional(),
});

export type ImportBatch = z.infer<typeof ImportBatchSchema>;