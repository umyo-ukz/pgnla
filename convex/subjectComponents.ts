import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByClassSubject = query({
  args: { classSubjectId: v.optional(v.id("classSubjects")) },
  handler: async (ctx, args) => {
    if (!args.classSubjectId) return [];
    return await ctx.db
      .query("subjectComponents")
      .withIndex("by_classSubject", q =>
        q.eq("classSubjectId", args.classSubjectId!)
      )
      .collect();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("subjectComponents")
      .collect();
  },
});

export const updateComponentWeight = mutation({
  args: {
    componentId: v.id("subjectComponents"),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.componentId, { weight: args.weight });
  },
});


export const seedComponentsForSubjectWithCustomTemplates = mutation({
  args: {
    subjectId: v.string(),
    gradeLevels: v.optional(v.array(v.string())), // Optional: filter by grade levels
    termIds: v.optional(v.array(v.id("terms"))), // Optional: filter by terms
    components: v.array(v.object({
      name: v.string(),
      weight: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Build query to find class subjects
    let query = ctx.db.query("classSubjects");
    
    // Filter by subjectId
    const classSubjects = await query
      .filter(q => q.eq(q.field("subjectId"), args.subjectId))
      .collect();

    // Apply additional filters if provided
    let filteredClassSubjects = classSubjects;
    
    if (args.gradeLevels && args.gradeLevels.length > 0) {
      filteredClassSubjects = filteredClassSubjects.filter(cs => 
        args.gradeLevels!.includes(cs.gradeLevel)
      );
    }
    
    if (args.termIds && args.termIds.length > 0) {
      filteredClassSubjects = filteredClassSubjects.filter(cs => 
        args.termIds!.includes(cs.termId)
      );
    }

    if (filteredClassSubjects.length === 0) {
      const filters = [];
      if (args.gradeLevels) filters.push(`grade levels: ${args.gradeLevels.join(", ")}`);
      if (args.termIds) filters.push(`terms: ${args.termIds.length} term(s)`);
      
      throw new Error(
        `No class subjects found for subject ID: ${args.subjectId}` +
        (filters.length > 0 ? ` with filters: ${filters.join(", ")}` : "")
      );
    }

    console.log(`Found ${filteredClassSubjects.length} class subjects matching criteria`);

    // Check if components already exist to avoid duplicates
    const existingComponents = await ctx.db
      .query("subjectComponents")
      .collect();

    const createdComponents = [];
    const skippedComponents = [];

    for (const classSubject of filteredClassSubjects) {
      console.log(`Processing class subject ${classSubject._id} (Grade ${classSubject.gradeLevel})`);
      
      for (const componentTemplate of args.components) {
        // Check if component already exists
        const alreadyExists = existingComponents.some(
          ec => ec.classSubjectId === classSubject._id && ec.name === componentTemplate.name
        );

        if (alreadyExists) {
          skippedComponents.push({
            classSubjectId: classSubject._id,
            name: componentTemplate.name,
            reason: "Component already exists",
          });
          continue;
        }

        const component = {
          classSubjectId: classSubject._id,
          name: componentTemplate.name,
          weight: componentTemplate.weight,
        };
        
        const componentId = await ctx.db.insert("subjectComponents", component);
        createdComponents.push({
          id: componentId,
          ...component,
          classSubject: {
            gradeLevel: classSubject.gradeLevel,
            termId: classSubject.termId,
          }
        });
      }
    }

    return {
      success: true,
      createdCount: createdComponents.length,
      skippedCount: skippedComponents.length,
      classSubjectsProcessed: filteredClassSubjects.length,
      createdComponents: createdComponents.map(c => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        classSubjectId: c.classSubjectId,
        gradeLevel: c.classSubject.gradeLevel,
      })),
      skippedComponents,
    };
  },
});

export const deleteComponentsByClassSubject = mutation({
  args: {
    classSubjectId: v.id("classSubjects"),
  },
  handler: async (ctx, args) => {
    const { classSubjectId } = args;

    // First, verify the class subject exists
    const classSubject = await ctx.db.get(classSubjectId);
    if (!classSubject) {
      throw new Error("Class subject not found");
    }

    // Get all components for this class subject using the index
    const components = await ctx.db
      .query("subjectComponents")
      .withIndex("by_classSubject", (q) =>
        q.eq("classSubjectId", classSubjectId)
      )
      .collect();

    if (components.length === 0) {
      return { 
        deletedCount: 0, 
        message: "No components found for this class subject",
        subjectName: classSubject.subjectId // You might want to fetch the actual subject name
      };
    }

    // Delete each component
    for (const component of components) {
      await ctx.db.delete(component._id);
    }

    return {
      deletedCount: components.length,
      message: `Successfully deleted ${components.length} components from class subject`,
      componentsDeleted: components.map(c => ({
        id: c._id,
        name: c.name,
        weight: c.weight
      }))
    };
  },
});

// Optional: Delete components by subject ID (across all class subjects for a subject)
export const deleteComponentsBySubjectId = mutation({
  args: {
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const { subjectId } = args;

    // First, get the subject to verify it exists
    const subject = await ctx.db.get(subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Get all class subjects for this subject
    const classSubjects = await ctx.db
      .query("classSubjects")
      .filter((q) => q.eq(q.field("subjectId"), subjectId))
      .collect();

    if (classSubjects.length === 0) {
      return { 
        deletedCount: 0, 
        message: "No class subjects found for this subject",
        subjectName: subject.name
      };
    }

    let totalComponentsDeleted = 0;
    const deletedComponents = [];

    // For each class subject, delete its components
    for (const classSubject of classSubjects) {
      const components = await ctx.db
        .query("subjectComponents")
        .withIndex("by_classSubject", (q) =>
          q.eq("classSubjectId", classSubject._id)
        )
        .collect();

      for (const component of components) {
        await ctx.db.delete(component._id);
        totalComponentsDeleted++;
        deletedComponents.push({
          id: component._id,
          name: component.name,
          weight: component.weight,
          classSubjectId: classSubject._id,
          gradeLevel: classSubject.gradeLevel
        });
      }
    }

    return {
      deletedCount: totalComponentsDeleted,
      message: `Deleted ${totalComponentsDeleted} components from ${classSubjects.length} class subjects for ${subject.name}`,
      subjectName: subject.name,
      classSubjectsAffected: classSubjects.length,
      deletedComponents: deletedComponents
    };
  },
});

// Helper: Get components count before deletion (for confirmation)
export const getComponentsCountByClassSubject = mutation({
  args: {
    classSubjectId: v.id("classSubjects"),
  },
  handler: async (ctx, args) => {
    const components = await ctx.db
      .query("subjectComponents")
      .withIndex("by_classSubject", (q) =>
        q.eq("classSubjectId", args.classSubjectId)
      )
      .collect();

    const classSubject = await ctx.db.get(args.classSubjectId);
    const subject = classSubject ? await ctx.db.get(classSubject.subjectId) : null;
    const term = classSubject ? await ctx.db.get(classSubject.termId) : null;

    return {
      count: components.length,
      classSubjectInfo: classSubject ? {
        id: classSubject._id,
        gradeLevel: classSubject.gradeLevel,
        weight: classSubject.weight
      } : null,
      subjectInfo: subject ? {
        name: subject.name
      } : null,
      termInfo: term ? {
        name: term.name
      } : null,
      components: components.map(c => ({
        id: c._id,
        name: c.name,
        weight: c.weight
      }))
    };
  },
});



