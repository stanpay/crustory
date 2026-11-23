import { redirect } from "next/navigation";

/** Online ordering is disabled — send users to contact. */
export default function OrderLookupPage() {
  redirect("/contact");
}
