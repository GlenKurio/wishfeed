import { IconGift, IconHome, IconSearch, IconUser } from "@tabler/icons-react";
import { Link, useMatches } from "@tanstack/react-router";
import { useAuth } from "../../../hooks/use-auth";

export default function Dock() {
  const { pathname } = useMatches().at(-1)!;
  const user = useAuth();

  return (
    <nav className="border-neutral/10 bg-base-300 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-md">
      <div className="container mx-auto flex max-w-2xl items-center justify-around md:p-1">
        <div className="lg:tooltip tooltip-primary" data-tip={"Feed"}>
          <Link to={"/home"} className="btn btn-ghost rounded-full p-2.5">
            <IconHome
              className={`size-4 md:size-5 ${pathname === "/home" ? "text-primary" : ""}`}
            />
            <span className="sr-only">Home</span>
          </Link>
        </div>
        <div className="lg:tooltip tooltip-primary" data-tip={"Explore"}>
          <Link to={"/search"} className="btn btn-ghost rounded-full p-2.5">
            <IconSearch
              className={`size-4 md:size-5 ${pathname === "/explore" ? "text-primary" : ""}`}
            />
            <span className="sr-only">Explore</span>
          </Link>
        </div>

        {/* Create wish button stays in the middle */}
        <div className="lg:tooltip tooltip-primary" data-tip="Create wish">
          <Link
            to="/new-wish"
            className="btn btn-ghost flex items-center justify-center rounded-full p-1"
          >
            {pathname.includes("/new-wish") ? (
              <img src="/add-icon-active.svg" className="size-8" />
            ) : (
              <img src="/add-icon.svg" className="size-8" />
            )}
            <span className="sr-only">Create wish</span>
          </Link>
        </div>

        <div className="lg:tooltip tooltip-primary" data-tip={"Gifts"}>
          <Link to={"/gifts"} className="btn btn-ghost rounded-full p-2.5">
            <IconGift
              className={`size-4 md:size-5 ${pathname === "/gifts" ? "text-primary" : ""}`}
            />
            <span className="sr-only">Gifts</span>
          </Link>
        </div>
        <div className="lg:tooltip tooltip-primary" data-tip={"Profile"}>
          <Link
            to="/profile/$userId/$wishlist"
            params={{
              userId: user.uid,
              wishlist: "all",
            }}
            className="btn btn-ghost rounded-full p-2.5"
          >
            <IconUser
              className={`size-4 md:size-5 ${pathname.includes(`/profile/${user.uid}`) ? "text-primary" : ""}`}
            />
            <span className="sr-only">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
