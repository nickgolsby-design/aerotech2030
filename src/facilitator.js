import { createContext, useContext } from "react";

// Facilitator mode reveals hidden values (trust effects, critical evidence,
// answer quality, live scores). Enable it with ?facilitator=1 in the URL.
export function isFacilitatorMode(search = globalThis.location?.search ?? "") {
  return new URLSearchParams(search).get("facilitator") === "1";
}

export const FacilitatorContext = createContext(false);

export function useFacilitator() {
  return useContext(FacilitatorContext);
}
