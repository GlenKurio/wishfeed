import { Link } from "@tanstack/react-router";

import { useRef } from "react";
import Avatar from "@/components/avatar";
import { useFollowUser } from "@/hooks/use-follow-user";
import type { UserProfile } from "@/lib/types";
import EditProfileModal from "./edit-profile";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

export default function ProfileHeader({
  userProfile,
  isOwner,
}: {
  userProfile: UserProfile;
  isOwner: boolean;
}) {
  const { isFollowing } = useFollowUser({ userId: userProfile.uid });
  const modalRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <div className="bg-background w-full pb-4">
        <div className="mx-auto">
          {/* Main profile section */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left side: Avatar + Info + Stats */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
              <div className="flex items-center gap-4">
                <Avatar src={userProfile.photoURL!} className="w-14 md:w-20" />
                <div className="shrink-0">
                  <h1 className="text-foreground text-2xl leading-tight font-bold">
                    {userProfile.displayName}
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg">
                    @{userProfile.handle}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 px-2">
                <div className="flex w-full items-center gap-6 md:gap-8">
                  <Link
                    to="/profile/$userId/followers"
                    params={{
                      userId: userProfile.uid,
                    }}
                    className="group transition-colors hover:opacity-80"
                  >
                    <div>
                      <p className="text-foreground text-lg font-bold md:text-xl">
                        {userProfile.followers.length || 0}
                      </p>
                      <p className="text-muted-foreground group-hover:text-foreground text-sm">
                        Followers
                      </p>
                    </div>
                  </Link>

                  <div className="bg-neutral/10 h-10 w-px" />

                  <Link
                    to="/profile/$userId/following"
                    params={{
                      userId: userProfile.uid,
                    }}
                  >
                    <p className="text-foreground text-lg font-bold md:text-xl">
                      {userProfile.following.length || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Following</p>
                  </Link>

                  <div className="bg-neutral/10 h-10 w-px" />

                  <Link
                    to="/profile/$userId/feed"
                    params={{
                      userId: userProfile.uid,
                    }}
                  >
                    <p className="text-foreground text-lg font-bold md:text-xl">
                      {userProfile.posts || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Posts</p>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex w-full gap-2 sm:w-auto sm:min-w-[200px]">
              {isOwner ? (
                <>
                  <button
                    onClick={() => {
                      modalRef.current?.showModal();
                    }}
                    className="btn btn-sm md:btn-md flex-1 sm:flex-none"
                  >
                    Edit Profile
                  </button>
                  <button className="btn btn-sm md:btn-md flex-1 sm:flex-none">
                    Settings
                  </button>
                </>
              ) : isFollowing ? (
                <button className="btn w-full sm:w-auto">Unfollow</button>
              ) : (
                <button className="btn w-full sm:w-auto">Follow</button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog>
        <form>
          <DialogTrigger asChild>
            <button className="btn">Open Dialog</button>
          </DialogTrigger>
          <EditProfileModal />
        </form>
      </Dialog>
    </>
  );
}
