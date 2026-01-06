import { useQuery } from "convex/react";
import { api } from "./_generated/api";
import { useState, useEffect } from "react";

export function useActiveTerm() {
  const terms = useQuery(api.terms.listAll);
  const [activeTermId, setActiveTermId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTermId && terms && terms.length > 0) {
      const current = terms.find((t: { isActive: boolean }) => t.isActive) ?? terms[0];
      setActiveTermId(current._id);
    }
  }, [terms, activeTermId]);

  return {
    terms,
    activeTermId,
    setActiveTermId,
  };
}
