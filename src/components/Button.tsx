import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-standard transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    primary: 'bg-rausch text-white hover:bg-rausch-dark focus:ring-rausch',
    secondary: 'bg-hof text-white hover:bg-hof-dark focus:ring-hof',
    tertiary: 'bg-transparent text-rausch hover:bg-rausch/10 focus:ring-rausch',
  }

  const sizeStyles = {
    small: 'px-4 py-2 text-small',
    medium: 'px-6 py-3 text-body',
    large: 'px-8 py-4 text-body',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </button>
  )
}
