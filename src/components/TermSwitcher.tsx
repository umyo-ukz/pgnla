import { Id } from "../../convex/_generated/dataModel";

export default function TermSwitcher({
    terms,
    activeTermId,
    onChange,
  }: {
    terms: Array<{ _id: Id<"terms">; name: string; isActive: boolean }> | undefined;
    activeTermId: string | null;
    onChange: (id: string) => void;
    className?: string;
    mobileOnly?: boolean;
  }) {
    if (!terms || terms.length === 0) return null;
  
    return (
      <select
        className="input w-56"
        value={activeTermId ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {terms.map(term => (
          <option key={term._id} value={term._id}>
            {term.name}
          </option>
        ))}
      </select>
    );
  }
  