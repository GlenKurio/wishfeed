import { IconBellRinging2 } from "@tabler/icons-react";
import { Link, useMatches, useRouter } from "@tanstack/react-router";
export default function AppHeader() {
  const { pathname } = useMatches().at(-1)!;

  const renderHeader = () => {
    if (pathname.startsWith("/home")) {
      return (
        <div className="w-full p-2 flex items-center justify-between border-b border-neutral/20 bg-base-300 ">
          <figure>
            <img src="/logo-full.png" className="h-8" />
          </figure>
          <div
            className="tooltip tooltip-left tooltip-primary"
            data-tip="Notifications"
          >
            <Link
              to="/notifications"
              className="btn btn-ghost rounded-full p-2.5"
            >
              <IconBellRinging2 className="size-5" />
              <span className="sr-only">Explore</span>
            </Link>
          </div>
        </div>
      );
    }
  };

  return <>{renderHeader()}</>;
}
