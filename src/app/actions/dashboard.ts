import { db } from "@/db";
import { leads as leadsTable } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";
import { type Lead } from "@/lib/leads/types";

export async function getLeads(from: Date, to: Date): Promise<Lead[]> {
  try {
    const fetchedLeads = await db
      .select()
      .from(leadsTable)
      .where(
        and(gte(leadsTable.createdAt, from), lte(leadsTable.createdAt, to))
      )
      .orderBy(leadsTable.createdAt);

    return fetchedLeads.map((lead) => {
      let parsedTags = null;
      if (lead.tags) {
        try {
          parsedTags = JSON.parse(lead.tags);
        } catch (e) {
          parsedTags = lead.tags;
        }
      }

      return {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        jobTitle: lead.jobTitle,
        status: lead.status,
        priority: lead.priority || "medium",
        value: lead.value ? String(lead.value) : null,
        tags: parsedTags,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        position: lead.position,
      } as Lead;
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to fetch leads");
  }
}
