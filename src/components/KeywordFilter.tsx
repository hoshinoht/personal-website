import { keywords, Keyword } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

interface KeywordFilterProps {
  selectedKeywords: Keyword[];
  onToggle: (keyword: Keyword) => void;
  onClear: () => void;
}

const KeywordFilter = ({ selectedKeywords, onToggle, onClear }: KeywordFilterProps) => {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
          Filter by Interest
        </h3>
        {selectedKeywords.length > 0 && (
          <button
            onClick={onClear}
            className="ml-auto text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => {
          const isSelected = selectedKeywords.includes(keyword);
          return (
            <button
              key={keyword}
              onClick={() => onToggle(keyword)}
              className={cn(
                "px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200",
                isSelected
                  ? "bg-primary text-primary-foreground glow-subtle"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {keyword}
            </button>
          );
        })}
      </div>
      
      {selectedKeywords.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Showing experiences relevant to:{" "}
          <span className="text-primary">{selectedKeywords.join(", ")}</span>
        </p>
      )}
    </div>
  );
};

export default KeywordFilter;
