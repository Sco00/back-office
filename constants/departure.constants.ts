import { DepartureStates } from "@/lib/types/api.types";

export const DEPARTURE_STATE_MAP: Record<
  DepartureStates,
  { label: string; cls: string }
> = {
  [DepartureStates.EN_ATTENTE]: {
    label: "En attente",
    cls: "bg-gray-500/20  text-gray-300  border-gray-500/30",
  },
  [DepartureStates.EN_TRANSIT]: {
    label: "En transit",
    cls: "bg-blue-500/20  text-blue-300  border-blue-500/30",
  },
  [DepartureStates.ARRIVE]: {
    label: "Arrivé",
    cls: "bg-green-500/20 text-green-300 border-green-500/30",
  },
};

export const DEPARTURE_STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "false", label: "Ouverts" },
  { value: "true", label: "Fermés" },
];
