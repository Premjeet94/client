import * as React from "react"

export const Toaster = () => {
  return null;
}

export const toast = {
  success: (msg: string) => alert("Success: " + msg),
  error: (msg: string) => alert("Error: " + msg),
  info: (msg: string) => alert("Info: " + msg),
  warning: (msg: string) => alert("Warning: " + msg),
}
