import type { LeadStatus } from "./schema";
export type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  planId: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};
