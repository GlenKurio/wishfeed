import Avatar from "../../../../components/avatar";
import { useFollowUser } from "../../../../hooks/use-follow-user";
import type { UserProfile } from "../../../../lib/types";

export default function ProfileHeader({
  userProfile,
  isOwner,
}: {
  userProfile: UserProfile;
  isOwner: boolean;
}) {
  const { isFollowing } = useFollowUser({ userId: userProfile.uid });
  return (
    <div className="mb-8 flex flex-col items-start gap-4 md:flex-row">
      <Avatar src={userProfile.photoURL!} />
      <div className="avatar"></div>

      <div className="flex-1">
        <div className="mb-4">
          <h1 className="text-foreground mb-1 text-2xl font-semibold md:text-3xl">
            {userProfile.displayName}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            @{userProfile.handle}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-4 flex gap-6">
          <div>
            <p className="text-foreground text-lg font-semibold md:text-xl">
              {userProfile.followers.length | 0}
            </p>
            <p className="text-muted-foreground text-sm">Followers</p>
          </div>
          <div>
            <p className="text-foreground text-lg font-semibold md:text-xl">
              {userProfile.following.length | 0}
            </p>
            <p className="text-muted-foreground text-sm">Following</p>
          </div>
          <div>
            <p className="text-foreground text-lg font-semibold md:text-xl">
              {userProfile.posts | 0}
            </p>
            <p className="text-muted-foreground text-sm">Posts</p>
          </div>
        </div>
        {isOwner ? (
          <div className="flex">
            <button className="btn w-full md:w-auto">Edit Profile</button>
            <button className="btn w-full md:w-auto">Settings</button>
          </div>
        ) : isFollowing ? (
          <button className="btn btn-primary">Unfollow</button>
        ) : (
          <button className="btn btn-primary">Follow</button>
        )}
      </div>
    </div>
  );
}
