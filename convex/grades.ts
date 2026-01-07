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

export const deleteScore = mutation({
  args: {
    gradeId: v.id("componentGrades"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.gradeId);
  },
});

export const createOrUpdateGradeWithValidation = mutation({
  args: {
    studentId: v.id("students"),
    classSubjectId: v.id("classSubjects"),
    componentId: v.id("subjectComponents"),
    score: v.number(), // Score should be <= component weight
  },
  handler: async (ctx, args) => {
    // Get component to check its weight
    const component = await ctx.db.get(args.componentId);
    if (!component) {
      throw new Error("Component not found");
    }

    // Validate score doesn't exceed component weight
    if (args.score > component.weight) {
      throw new Error(`Score cannot exceed component weight of ${component.weight}`);
    }

    if (args.score < 0) {
      throw new Error("Score cannot be negative");
    }

    // Check if grade already exists
    const existingGrade = await ctx.db
      .query("componentGrades")
      .withIndex("by_student_classSubject", q =>
        q.eq("studentId", args.studentId).eq("classSubjectId", args.classSubjectId)
      )
      .filter(q => q.eq(q.field("componentId"), args.componentId))
      .first();

    if (existingGrade) {
      // Update existing grade
      await ctx.db.patch(existingGrade._id, { score: args.score });
      return { updated: true, id: existingGrade._id };
    } else {
      // Create new grade
      const gradeId = await ctx.db.insert("componentGrades", {
        studentId: args.studentId,
        classSubjectId: args.classSubjectId,
        componentId: args.componentId,
        score: args.score,
      });
      return { created: true, id: gradeId };
    }
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

  let totalScore = 0;
  let maxPossibleScore = 0;

  group.components.forEach(({ component, grade }) => {
    if (component) {
      // Component weight represents MAXIMUM points for this component
      const maxPoints = component.weight;
      
      // Student's score is points earned out of component weight
      const earnedPoints = Math.min(grade.score, maxPoints); // Cap at max points
      
      totalScore += earnedPoints;
      maxPossibleScore += maxPoints;
    }
  });
       group.average = maxPossibleScore > 0 
    ? Math.round((totalScore / maxPossibleScore) * 10000) / 100 // Keep 2 decimal places
    : 0;
});



    return {
      student,
      grades: Object.values(groupedGrades),
    };
  },
});
