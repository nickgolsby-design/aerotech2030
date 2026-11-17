import { useFacilitator } from "../facilitator.js";

/** Renders its children only in facilitator mode. */
export default function FacilitatorNote({ children, as: Tag = "span" }) {
  const facilitator = useFacilitator();
  if (!facilitator) return null;
  return <Tag className="facilitator-note">{children}</Tag>;
}
