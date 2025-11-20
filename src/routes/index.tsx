import { createFileRoute } from "@tanstack/react-router";
import Header from "./-components/header";

export const Route = createFileRoute("/")({
  component: Index,
  // beforeLoad,
});

// type ResponseType = Awaited<ReturnType<typeof api.hi.me.$get>>;

function Index() {
  const handleClik = () => {
    return (
      <div className="toast toast-end">
        <div className="alert alert-info">
          <span>New mail arrived.</span>
        </div>
        <div className="alert alert-success">
          <span>Message sent successfully.</span>
        </div>
      </div>
    );
  };

  return (
    <main className="bg-base-200 min-h-screen font-family-sans">
      <Header />
      <h3 className="text-3xl font-thin">Welcome Home!</h3>
      <button className="btn btn-primary" onClick={handleClik}>
        Hello, ShadcnUI!
      </button>
    </main>
  );
}
