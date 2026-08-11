import * as React from "react"
import { usePhoneInput, CountrySelector } from "react-international-phone"
import "react-international-phone/style.css"
import { cn } from "@workspace/ui/lib/utils"
import { Input } from "@workspace/ui/components/input"

type PhoneInputProps = Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  value?: string
  onChange?: (value: string) => void
  defaultCountry?: string
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, defaultCountry = "ng", ...props }, ref) => {
    
    // Headless logic engine
    const phoneInput = usePhoneInput({
      defaultCountry: defaultCountry.toLowerCase(),
      value: value || "",
      onChange: (data) => {
        onChange?.(data.phone)
      },
    })

    return (
      <div className={cn("flex items-center gap-1 w-full", className)}>
        {/* Clean, customizable flag selector button */}
        <CountrySelector
          // FIXES TS(2322): Drill into the object structure to extract the raw string code ("ng", "us")
          selectedCountry={phoneInput.country.iso2} 
          onSelect={(country) => phoneInput.setCountry(country.iso2)}
          renderButtonWrapper={({ children, rootProps }) => (
            <button
              {...rootProps}
              type="button"
              className="flex items-center justify-center border border-input bg-background rounded-md px-3 h-10 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {children}
            </button>
          )}
        />

        {/* 100% Standard Native Shadcn Input Component */}
        <Input
          {...props}
          ref={ref} // Forwards HTMLInputElement directly to React Hook Form safely
          type="tel"
          value={phoneInput.inputValue} // Use inputValue for formatted keyboard typing string display
          onChange={phoneInput.handlePhoneValueChange}
          placeholder={props.placeholder ?? "Enter phone number"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
