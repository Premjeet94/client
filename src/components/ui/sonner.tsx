import * as React from "react"

export const Toaster = () => {
  return null;
}

export const toast = {
  success: (msg: string, options?: any) => alert("Success: " + msg),
  error: (msg: string, options?: any) => alert("Error: " + msg),
  info: (msg: string) => alert("Info: " + msg),
  warning: (msg: string) => alert("Warning: " + msg),
  loading: (msg: string) => {
    console.log("Loading: " + msg);
    return "loading-id-" + Math.random();
  }
}
