import { IconBellRinging2 } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
export default function AppHeader() {
  const router = useRouter();

  const location = router.state.location;

  const renderHeader = () => {
    if (location.pathname.startsWith("/feed")) {
      return (
        <div className=" w-full p-4 flex items-center justify-between ">
          <figure>
            <img src="/logo-full.png" className="h-8" />
          </figure>
          <div>
            <IconBellRinging2 />
          </div>
        </div>
      );
    }
  };

  return <div className="">{renderHeader()}</div>;
}
