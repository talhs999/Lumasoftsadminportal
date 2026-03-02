interface FormInputProps {
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
}

export default function FormInput({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required,
    disabled,
    error,
    hint,
}: FormInputProps) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`input-field ${error ? "border-red-400 focus:ring-red-400" : ""}`}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
    );
}
