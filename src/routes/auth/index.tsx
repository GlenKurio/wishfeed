import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "./-components/login";
import z from "zod";
import RegisterFrom from "./-components/register";
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
      {tab === "register" ? <RegisterFrom /> : <LoginForm />}
    </section>
  );
}
