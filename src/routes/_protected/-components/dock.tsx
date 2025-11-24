import { IconGift, IconHome, IconSearch, IconUser } from "@tabler/icons-react";
import { Link, useMatches } from "@tanstack/react-router";

const navLinks = [
  {
    to: "/home",
    icon: IconHome,
    label: "Feed",
    tooltip: "Feed",
  },
  {
    to: "/search",
    icon: IconSearch,
    label: "Explore",
    tooltip: "Explore",
  },
  {
    to: "/gifts",
    icon: IconGift,
    label: "Gifts",
    tooltip: "Gifts",
  },
  {
    to: "/profile",
    icon: IconUser,
    label: "Profile",
    tooltip: "Profile",
  },
];

export default function Dock() {
  const { pathname } = useMatches().at(-1)!;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral/10 bg-base-300 backdrop-blur-md ">
      <div className="container mx-auto flex max-w-2xl items-center justify-around p-2">
        {navLinks.slice(0, 2).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.to;
          return (
            <div
              key={link.to}
              className="lg:tooltip tooltip-primary"
              data-tip={link.tooltip}
            >
              <Link to={link.to} className="btn btn-ghost rounded-full p-2.5">
                <Icon className={`size-5 ${isActive ? "text-primary" : ""}`} />
                <span className="sr-only">{link.label}</span>
              </Link>
            </div>
          );
        })}

        {/* Create wish button stays in the middle */}
        <div className="lg:tooltip tooltip-primary" data-tip="Create wish">
          <Link
            to="/new-wish"
            className="btn btn-ghost rounded-full p-1 flex items-center justify-center"
          >
            {pathname === "/new-wish" ? (
              <img src="/add-icon-active.svg" className="size-8 " />
            ) : (
              <img src="/add-icon.svg" className="size-8 " />
            )}
            <span className="sr-only">Create wish</span>
          </Link>
        </div>

        {navLinks.slice(2).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.to;
          return (
            <div
              key={link.to}
              className="lg:tooltip tooltip-primary"
              data-tip={link.tooltip}
            >
              <Link to={link.to} className="btn btn-ghost rounded-full p-2.5">
                <Icon className={`size-5 ${isActive ? "text-primary" : ""}`} />
                <span className="sr-only">{link.label}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
