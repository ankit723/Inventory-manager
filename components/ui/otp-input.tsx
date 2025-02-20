import { useState, useRef, KeyboardEvent } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  onComplete?: (otp: string) => void
  className?: string
}

const OTPInput = ({ length = 6, onComplete, className }: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Call onComplete when all digits are filled
    if (newOtp.every(digit => digit !== '') && onComplete) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className={cn('flex gap-2', className)}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          ref={(ref) => {
            if (ref) {
              inputRefs.current[index] = ref
            }
          }}
          className="w-10 h-10 text-center p-0"
        />
      ))}
    </div>
  )
}

export default OTPInput 