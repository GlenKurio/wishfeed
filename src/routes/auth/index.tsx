import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import AuthForm from "./-components/auth-form";
export const Route = createFileRoute("/auth/")({
  validateSearch: z.object({
    tab: z.enum(["login", "register"]).optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { tab } = Route.useSearch();
  return (
    <section
      style={{
        backgroundImage:
          "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)",
        backgroundSize: "cover",
      }}
    >
      <AuthForm mode={tab} />
    </section>
  );
}
