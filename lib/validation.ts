import { z } from 'zod';

export const UserProfileSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  username: z.string().optional(),
  twitter_handle: z.string().optional(),
  discord_id: z.string().optional(),
  telegram_id: z.string().optional(),
  email: z.string().optional(),
  evm_address: z.string().optional(),
  svm_address: z.string().optional(),
});

export const AuthSchema = z.object({
  email: z.string().email(),
});

export const CategorySchema = z.object({
  category: z.string().min(3).max(100),
  isActive: z.boolean(),
});

export const ObjectiveSchema = z.object({
  taskObjective: z.string().min(3).max(300),
});

export const QuestSchema = z.object({
  name: z.string().min(3).max(300),
  description: z.string().min(3).max(3000),
  verificationMethod: z.string().min(3).max(3000),
  pointsValue: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  taskAction: z.string().optional(),
  taskSource: z.string().optional(),
  category: z.string().min(1),
  isActive: z.boolean(),
});

export const EventSchema = z.object({
  name: z.string().min(3),
  date: z.date().optional(),
  location: z.string().min(3),
  isFeatured: z.boolean().default(false),
});

export const WhaleUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  profession: z.string().min(1, 'Profession is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  imgUrl: z.string().optional(),
  roi: z.number().optional(),
  aum: z.number().optional(),
  contributingProjects: z.array(z.string()).optional(),
  followers: z
    .array(
      z.object({
        userId: z.string().optional(),
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .optional(),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

export const WhaleSchema = z.object({
  whaleID: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  profession: z.string().min(1, 'Profession is required'),
  description: z.string().min(1, 'Description is required'),
  imgUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

export const AdminWhaleCreationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  profession: z.string().min(1, 'Profession is required'),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  roi: z.string().optional(),
  aum: z.string().optional(),
});


export type WhaleUpdateValues = z.infer<typeof WhaleUpdateSchema>;
export type WhaleFormValues = z.infer<typeof WhaleSchema>;


export const VoteAmountSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Please enter an amount')
    .refine((val) => !isNaN(parseFloat(val)), {
      message: 'Please enter a valid number',
    })
    .refine((val) => parseFloat(val) > 0, {
      message: 'Amount must be greater than 0',
    }),
  balance: z.string().optional(),
}).refine(
  (data) => {
    if (!data.balance) return true; 
    const amount = parseFloat(data.amount);
    const balance = parseFloat(data.balance.replace(/,/g, ''));
    return !isNaN(balance) && amount <= balance;
  },
  {
    message: 'Insufficient balance',
    path: ['amount'],
  }
);

export type VoteAmountValues = z.infer<typeof VoteAmountSchema>;
