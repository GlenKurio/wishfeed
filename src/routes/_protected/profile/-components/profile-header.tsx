export default function ProfileHeader({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner: boolean;
}) {
  return (
    <div className="mb-8 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
      <div className="avatar">
        <div className="w-24 rounded-full">
          <img src="https://img.daisyui.com/images/profile/demo/yellingwoman@192.webp" />
        </div>
      </div>
      <div className="bg-neutral text-neutral-content w-24 rounded-full">
        <span className="text-2xl">D</span>
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <h1 className="text-foreground mb-1 text-2xl font-semibold md:text-3xl">
            Alexandra Jensen
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            @alexjensen
          </p>
        </div>

        {/* Stats */}
        <div className="mb-4 flex gap-6">
          <div>
            <p className="text-foreground text-lg font-semibold md:text-xl">
              1,234
            </p>
            <p className="text-muted-foreground text-sm">Followers</p>
          </div>
          <div>
            <p className="text-foreground text-lg font-semibold md:text-xl">
              567
            </p>
            <p className="text-muted-foreground text-sm">Following</p>
          </div>
          <div>
            <p className="text-foreground text-lg font-semibold md:text-xl">
              89
            </p>
            <p className="text-muted-foreground text-sm">Posts</p>
          </div>
        </div>

        <button className="btn w-full md:w-auto">Edit Profile</button>
      </div>
    </div>
  );
}
