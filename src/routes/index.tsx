import { createFileRoute } from "@tanstack/react-router";
import Header from "./-components/header";
import { toast } from "../components/toast/toast";

// import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  // beforeLoad,
});

// type ResponseType = Awaited<ReturnType<typeof api.hi.me.$get>>;

function Index() {
  const handleClik = () => {
    return toast.success({
      title: "This is a headless toast",
    });
  };

  return (
    <main className="bg-base-100 min-h-screen">
      <Header />
      <h3 className="text-3xl font-thin">Welcome Home!</h3>
      <button className="btn btn-primary font-bold" onClick={handleClik}>
        Hello, ShadcnUI!
      </button>
    </main>
  );
}
