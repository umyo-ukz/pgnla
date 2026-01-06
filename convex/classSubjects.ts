import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByClassAndTerm = query({
    args: {
        gradeLevel: v.string(),
        termId: v.id("terms"),
    },
    handler: async (ctx, args) => {
        const classSubjects = await ctx.db
            .query("classSubjects")
            .withIndex("by_grade_term", q =>
                q.eq("gradeLevel", args.gradeLevel).eq("termId", args.termId)
            )

            .collect();

        return Promise.all(
            classSubjects.map(async cs => ({
                ...cs,
                subject: await ctx.db.get(cs.subjectId),
            }))
        );
    },
});

export const updateSubjectWeight = mutation({
    args: {
        classSubjectId: v.id("classSubjects"),
        weight: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.classSubjectId, {
            weight: args.weight,
        });
    },
});
