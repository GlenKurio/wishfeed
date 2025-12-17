import NotificationsDropdown from "./notifications-dropdown";
export default function AppHeader() {
  // const { pathname } = useMatches().at(-1)!;

  const renderHeader = () => {
    return (
      <div className="border-neutral/20 bg-base-300 flex w-full items-center justify-between border-b md:p-1">
        <figure>
          <img src="/logo-full.png" className="h-8" />
        </figure>
        <NotificationsDropdown />
      </div>
    );
  };

  return <>{renderHeader()}</>;
}
