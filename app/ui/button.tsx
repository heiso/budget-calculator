import { Link, type LinkProps } from '@remix-run/react'
import { type ButtonHTMLAttributes } from 'react'

const defaultClass =
  'rounded-md text-center disabled:pointer-events-none px-9 py-4 font-bold text-large disabled:opacity-50 select-none transition hover:scale-105 active:opacity-80'
const primaryClass = 'bg-pink-500 text-pink-100'
const secondaryClass = 'bg-transparent border'

type ButtonProps = (
  | (ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' })
  | (LinkProps & { as: 'link' })
) & { primary?: boolean }

export function Button({ primary, className, children, ...props }: ButtonProps) {
  if (props.as === 'link') {
    return (
      <Link
        className={`block ${defaultClass} ${primary ? primaryClass : secondaryClass} ${
          className ?? ''
        }`}
        {...props}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      className={`${defaultClass} ${primary ? primaryClass : secondaryClass} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
