import { useContext } from "react";
import { SpotlightContext } from "@/providers/modal-provider";

export function useModal() {
  const context = useContext(SpotlightContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
