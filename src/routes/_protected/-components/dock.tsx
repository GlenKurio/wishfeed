import { IconHome, IconSearch, IconUser } from "@tabler/icons-react";
import { Icons } from "../../../components/icons";
import { Link } from "@tanstack/react-router";

export default function Dock() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral/10 bg-background/95 backdrop-blur-md ">
      <div className="container mx-auto flex max-w-2xl items-center justify-around p-2">
        <div className="lg:tooltip tooltip-primary" data-tip="Feed">
          <Link to="/home" className="btn btn-ghost rounded-full p-2.5">
            <IconHome className="size-5" />
            <span className="sr-only">Feed</span>
          </Link>
        </div>
        <div className="lg:tooltip tooltip-primary" data-tip="Explore">
          <Link to="/search" className="btn btn-ghost rounded-full p-2.5">
            <IconSearch className="size-5" />
            <span className="sr-only">Explore</span>
          </Link>
        </div>

        <div className="lg:tooltip tooltip-primary" data-tip="Create wish">
          <button className="btn btn-ghost rounded-full p-1 flex items-center justify-center">
            <img src="/add-icon.svg" className="size-8 " />
            <span className="sr-only">Create wish</span>
          </button>
        </div>

        <div className="lg:tooltip tooltip-primary" data-tip="Wishlists">
          <Link to="/wishlists" className="btn btn-ghost rounded-full p-2.5">
            <Icons.wishlist className="size-5" />
            <span className="sr-only">Wishlists</span>
          </Link>
        </div>
        <div className="lg:tooltip tooltip-primary" data-tip="Profile">
          <Link to="/profile" className="btn btn-ghost rounded-full p-2.5">
            <IconUser className="size-5" />
            <span className="sr-only">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
