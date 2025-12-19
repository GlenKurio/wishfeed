import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/(gifts)/gifts")({
  component: RouteComponent,
});

function RouteComponent() {
  // const user = useAuth();

  return (
    <div className="">
      Hello "/_protected/(gifts)/gifts"!
      <div>Gifts (giving, receiving) Requests</div>
    </div>
  );
}
