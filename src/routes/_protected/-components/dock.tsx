import { IconHome, IconPlus, IconSearch, IconUser } from "@tabler/icons-react";
import { Icons } from "../../../components/icons";

export default function Dock() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md ">
      <div className="container mx-auto flex max-w-2xl items-center justify-around p-4">
        <button className="btn btn-ghost rounded-full p-2.5">
          <IconHome className="size-5" />
          <span className="sr-only">Home</span>
        </button>

        <button className="text-muted-foreground hover:text-foreground">
          <IconSearch className="size-5" />
          <span className="sr-only">Explore</span>
        </button>

        <button className="btn btn-ghost rounded-full p-1">
          <img src="/add-icon.svg" className="size-12 " />
          <span className="sr-only">Add wish</span>
        </button>

        <button className="text-muted-foreground hover:text-foreground">
          <Icons.wishlist className="size-5" />
          <span className="sr-only">Notifications</span>
        </button>

        <button className="text-muted-foreground hover:text-foreground">
          <IconUser className="size-5" />
          <span className="sr-only">Profile</span>
        </button>
      </div>
    </nav>
  );
}
