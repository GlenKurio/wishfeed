import { IconBellRinging2 } from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";
export default function AppHeader() {
  const router = useRouter();

  const location = router.state.location;

  const renderHeader = () => {
    if (location.pathname.startsWith("/feed")) {
      return (
        <div className="w-full p-2 flex items-center justify-between ">
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
