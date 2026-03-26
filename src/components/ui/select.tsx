import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ value, onValueChange, children }: any) => {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  )
}
const SelectTrigger = ({ children, className }: any) => <>{children}</>
const SelectValue = ({ placeholder }: any) => <option value="" disabled>{placeholder}</option>
const SelectContent = ({ children }: any) => <>{children}</>
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
