import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full px-4 py-3 border rounded-standard text-body text-hof font-sans transition-all duration-200'
  const normalStyles = 'border-foggy focus:border-rausch focus:outline-none focus:ring-2 focus:ring-rausch/20'
  const errorStyles = error ? 'border-rausch focus:ring-rausch/20' : ''

  return (
    <div className="w-full">
      {label && (
        <label className="block text-small font-medium text-hof mb-2">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${normalStyles} ${errorStyles} ${className}`}
        suppressHydrationWarning
        {...props}
      />
      {error && (
        <p className="mt-1 text-caption text-rausch">{error}</p>
      )}
    </div>
  )
}
