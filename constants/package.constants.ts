import { PackageStates } from "@/lib/types/api.types";

export const PACKAGE_STATE_MAP: Record<
  PackageStates,
  { label: string; cls: string }
> = {
  EN_ATTENTE: {
    label: "En attente",
    cls: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  },
  EN_TRANSIT: {
    label: "En transit",
    cls: "bg-blue-500/20  text-blue-300  border border-blue-500/30",
  },
  ARRIVE: {
    label: "Arrivé",
    cls: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  },
  LIVRE: {
    label: "Livré",
    cls: "bg-green-500/20 text-green-300  border border-green-500/30",
  },
  RETOURNE: {
    label: "Retourné",
    cls: "bg-red-500/20   text-red-300   border border-red-500/30",
  },
};

export const PACKAGE_STATE_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: PackageStates.EN_ATTENTE, label: "En attente" },
  { value: PackageStates.EN_TRANSIT, label: "En transit" },
  { value: PackageStates.ARRIVE, label: "Arrivé" },
  { value: PackageStates.LIVRE, label: "Livré" },
  { value: PackageStates.RETOURNE, label: "Retourné" },
];
