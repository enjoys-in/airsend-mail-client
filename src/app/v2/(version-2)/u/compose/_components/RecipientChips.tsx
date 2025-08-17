import { X } from "lucide-react";

type Chip = {
  id: string;
  email: string;
  isValid: boolean;
};

type Props = {
  label: string; // "To", "Cc", "Bcc"
  chips: Chip[];
  inputValue: string;
  setInputValue: (val: string) => void;
  removeChip: (id: string, type: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, type: string) => void;
  handleBlur: (value: string, type: string) => void;
  type: "to" | "cc" | "bcc";
};

export default function RecipientChips({
  label,
  chips,
  inputValue,
  setInputValue,
  removeChip,
  handleKeyDown,
  handleBlur,
  type,
}: Props) {
  return (
    <div className="flex items-start gap-4">
      {/* Label */}
      <span className="text-xs text-gray-600 dark:text-gray-400 w-12 mt-2">
        {label}
      </span>

      <div className="flex-1">
        <div className="flex flex-wrap gap-2 p-2 border-0 border-b border-gray-300 dark:border-gray-700 min-h-[36px] focus-within:ring-0 focus-within:border-purple-500">
          {chips.map((chip) => (
            <div
              key={chip.id}
              className={`flex items-center text-xs font-medium overflow-hidden border 
                ${
                  chip.isValid
                    ? "bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200"
                    : "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                } rounded-full`}
            >
              {/* Avatar */}
              <div className="flex items-center">
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-[10px]
                    ${
                      chip.isValid
                        ? "bg-purple-500 dark:bg-purple-700"
                        : "bg-red-500 dark:bg-red-700"
                    }`}
                >
                  {chip.email.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Email text */}
              <span className="px-2 truncate text-xs">{chip.email}</span>

              {/* Remove button */}
              <button
                onClick={() => removeChip(chip.id, type)}
                className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 mr-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Input */}
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, type)}
            onBlur={(e) => handleBlur(e.target.value, type)}
            placeholder={chips.length === 0 ? `Enter ${label} recipients...` : ""}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-xs text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
}
