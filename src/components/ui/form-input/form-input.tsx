import React from 'react';
import {
  type FieldErrors,
  type FieldError,
  type UseFormRegister,
  type FieldValues,
  type Path,
} from 'react-hook-form';

export interface FormInputProps<T extends FieldValues = FieldValues> {
  id: string;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  errors?: FieldErrors<T>;
  register: UseFormRegister<T>;
  className?: string;
}

export default function FormInput<T extends FieldValues = FieldValues>({
  id,
  name,
  label,
  placeholder,
  type = 'text',
  errors,
  register,
  className = '',
}: FormInputProps<T>) {
  const error = errors?.[name] as FieldError | undefined;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500'
        } ${className}`}
        {...register(name)}
      />
      {error && error.message && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}
