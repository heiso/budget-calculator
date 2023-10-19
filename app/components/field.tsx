import { conform, type FieldConfig } from '@conform-to/react'
import {
  forwardRef,
  useState,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Hint, type HintProps } from '../ui/hint.tsx'
import { Input } from '../ui/input.tsx'
import { Label } from '../ui/label.tsx'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  field: FieldConfig<unknown>
  type?: HTMLInputTypeAttribute
  icon?: ReactNode
  hint?: HintProps['hint']
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, field, type, icon, hint, ...props }, ref) => {
    return (
      <div>
        <Label>{label}</Label>
        <Input ref={ref} error={field.error} {...conform.input(field, { type })} {...props} />
        {icon}
        <Hint error={field.error} hint={hint} />
      </div>
    )
  },
)

Field.displayName = 'Field'

export { Field }

export function PasswordField({ label, field, type, ...props }: FieldProps) {
  const [show, setShow] = useState(false)

  return (
    <>
      <Label>{label}</Label>
      <Input
        autoComplete="current-password"
        {...conform.input(field, { type: show ? 'text' : 'password' })}
        {...props}
      />
      <div onClick={() => setShow(!show)}>{show ? 'hide' : 'show'}</div>
      <Hint error={field.error} />
    </>
  )
}
