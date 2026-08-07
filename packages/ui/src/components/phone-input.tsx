import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import * as BaseUI from "@base-ui/react" // Adjust based on your explicit Base UI workspace import wrapper
// Add the named helper import like this:
import RPInput, { type Country, getCountryCallingCode } from "react-phone-number-input"
import flags from "react-phone-number-input/flags"


import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

type PhoneInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "onChange" | "value"
> & {
  value?: string
  onChange?: (value: string) => void
  defaultCountry?: Country
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, defaultCountry = "NG", ...props }, ref) => {
    return (
      <RPInput
        inputRef={ref} //  Correctly routes the HTMLInputElement ref straight to the actual input tag
        className={cn("flex gap-1 rounded-md shadow-sm", className)}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        placeholder={props.placeholder ?? "Enter phone number"}
        value={value}
        onChange={(v) => onChange?.(v || "")}
        defaultCountry={defaultCountry}
        {...props}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"

// 1. Core Native Input Styling Hook
const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    className={cn(
      "rounded-l-none rounded-r-md border-l-0 focus-visible:ring-1",
      className
    )}
    ref={ref}
    {...props}
  />
))
InputComponent.displayName = "InputComponent"

// 2. Base UI Country Selector Dropdown Engine
type CountrySelectProps = {
  disabled?: boolean
  value: Country
  onChange: (value: Country) => void
  options: { value: Country; label: string }[]
}

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = (country: Country) => {
    onChange(country)
  }

  return (
    <BaseUI.Popover.Root>
      <BaseUI.Popover.Trigger
        render={(props) => (
          <Button
            {...props} // Spreads Base UI event handlers & click parameters safely
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-12 flex gap-1 rounded-l-md rounded-r-none border-r bg-background px-3 focus-visible:ring-1"
          >
            <FlagComponent country={value} countryName={value} />
            <span className="text-sm font-medium text-muted-foreground">{`+${getCountryCallingCode(value)}`}</span>
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          </Button>
        )}
      />

      {/* Dropdown Layout wrapper using Base UI Portal mappings */}
      <BaseUI.Popover.Portal>
        <BaseUI.Popover.Positioner sideOffset={4} className="z-50">
          <BaseUI.Popover.Popup className="max-h-87.5 w-75 animate-in overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md duration-100 fade-in-50">
            <div className="space-y-0.5">
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      option.value === value && "bg-accent font-semibold"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FlagComponent
                        country={option.value}
                        countryName={option.label}
                      />
                      <span className="truncate">{option.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{`+${getCountryCallingCode(option.value)}`}</span>
                      {option.value === value && (
                        <Check className="ml-1 h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </BaseUI.Popover.Popup>
        </BaseUI.Popover.Positioner>
      </BaseUI.Popover.Portal>
    </BaseUI.Popover.Root>
  )
}

// 3. SVG Flag Resolver Render Target
const FlagComponent = ({
  country,
  countryName,
}: {
  country: Country
  countryName: string
}) => {
  const Flag = flags[country]
  return (
    <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm bg-muted">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <span className="text-[10px] font-bold">{country}</span>
      )}
    </span>
  )
}

export { PhoneInput }
