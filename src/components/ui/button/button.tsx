import { Spinner } from '@/components/ui/spinner';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outline';
}

const baseClasses = `
  inline-flex items-center justify-center
  rounded-md
  text-sm font-medium
  transition-colors
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  h-10 px-4 py-2
`;

const variantClasses = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
};

export default function Button({
  text,
  isLoading,
  className,
  children,
  variant = 'default',
  ...props
}: ButtonProps) {
  const classes = className || `${baseClasses} ${variantClasses[variant]}`;

  return (
    <button type="button" className={classes} {...props}>
      {isLoading ? <Spinner /> : (children ?? text)}
    </button>
  );
}
