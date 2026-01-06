import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByStudentAndClassSubject = query({
  args: {
    studentId: v.id("students"),
    classSubjectId: v.id("classSubjects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("componentGrades")
      .withIndex("by_student_classSubject", q =>
        q.eq("studentId", args.studentId).eq("classSubjectId", args.classSubjectId)
      )
      .collect();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("componentGrades")
      .collect();
  },
});

export const updateScore = mutation({
  args: {
    gradeId: v.id("componentGrades"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gradeId, { score: args.score });
  },
});

export const create = mutation({
  args: {
    studentId: v.id("students"),
    classSubjectId: v.id("classSubjects"),
    componentId: v.id("subjectComponents"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("componentGrades", args);
  },
});

export const getStudentProfile = query({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return null;

    // Get all component grades for this student
    const componentGrades = await ctx.db
      .query("componentGrades")
      .withIndex("by_student_classSubject", q => q.eq("studentId", args.studentId))
      .collect();

    // Get all class subjects and their details
    const classSubjectIds = Array.from(new Set(componentGrades.map(g => g.classSubjectId)));
    
    const gradesWithDetails = await Promise.all(
      componentGrades.map(async (grade) => {
        const classSubject = await ctx.db.get(grade.classSubjectId);
        if (!classSubject) return null;

        const subject = await ctx.db.get(classSubject.subjectId);
        const component = await ctx.db.get(grade.componentId);
        const term = await ctx.db.get(classSubject.termId);

        return {
          ...grade,
          classSubject,
          subject,
          component,
          term,
        };
      })
    );

    // Group by subject and term
    const groupedGrades: Record<string, {
      subject: { _id: string; name: string } | null;
      term: { _id: string; name: string } | null;
      classSubject: { _id: string; gradeLevel: string; weight: number } | null;
      components: Array<{
        component: { _id: string; name: string; weight: number } | null;
        grade: { _id: string; score: number };
      }>;
      average: number;
    }> = {};

    gradesWithDetails.forEach((item) => {
      if (!item) return;
      
      const key = `${item.classSubject?.subjectId}_${item.classSubject?.termId}`;
      if (!groupedGrades[key]) {
        groupedGrades[key] = {
          subject: item.subject,
          term: item.term,
          classSubject: item.classSubject,
          components: [],
          average: 0,
        };
      }

      if (item.component) {
        groupedGrades[key].components.push({
          component: item.component,
          grade: { _id: item._id, score: item.score },
        });
      }
    });

    // Calculate averages for each subject
    Object.values(groupedGrades).forEach((group) => {
      if (group.components.length === 0) {
        group.average = 0;
        return;
      }

      let totalWeightedScore = 0;
      let totalWeight = 0;

      group.components.forEach(({ component, grade }) => {
        if (component) {
          const weight = component.weight || 0;
          totalWeightedScore += grade.score * weight;
          totalWeight += weight;
        }
      });

      group.average = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : 0;
    });

    return {
      student,
      grades: Object.values(groupedGrades),
    };
  },
});
