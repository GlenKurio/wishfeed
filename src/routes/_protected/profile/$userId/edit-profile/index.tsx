import {
  createFileRoute,
  redirect,
  useRouteContext,
} from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/profile/$userId/edit-profile/",
)({
  beforeLoad: ({ context, params }) => {
    if (context.user.uid !== context.userProfile.uid) {
      throw redirect({
        to: "/profile/$userId",
        params: { userId: params.userId },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { userProfile } = useRouteContext({
    from: "/_protected/profile/$userId",
  });
  const { user } = useRouteContext({ from: "/_protected" });
  return (
    <>
      Edit profiel page: for user {user.displayName} and userProfile is:{" "}
      {userProfile.uid}
    </>
  );
  // const authUser = useAuth();
  // const { data } = useGetUserProfile({ userProfileId: authUser.uid });
  // const [previewUrl, setPreviewUrl] = useState<string | undefined>(
  //   data?.photoURL,
  // );
  // const form = useForm({
  //   defaultValues: {
  //     ...data,
  //   },
  //   validators: {
  //     onChange: updateUserProfileSchema,
  //   },
  //   onSubmit: ({ value }) => {},
  // });
  // const isLoading = false;
  // return (
  //   <div className="flex h-full w-full flex-col gap-8 lg:gap-8">
  //     {/* --- Image Upload Section --- */}
  //     <div className="flex flex-col gap-4">
  //       <div className="avatar">
  //         <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2">
  //           <img
  //             src={previewUrl || "https://ui-avatars.com/api/?name=User"}
  //             alt="Profile Preview"
  //             className="object-cover"
  //           />
  //         </div>
  //       </div>
  //       <form.Field
  //         name="photoURL"
  //         children={(field) => {
  //           const { errors } = field.state.meta;
  //           return (
  //             <div className="flex flex-col items-start">
  //               <label className="btn btn-sm btn-outline gap-2">
  //                 <IconPhoto className="size-4" />
  //                 Change Photo
  //                 <input
  //                   type="file"
  //                   className="hidden"
  //                   accept="image/*"
  //                   onChange={(e) => {
  //                     const file = e.target.files?.[0];
  //                     if (file) {
  //                       field.handleChange(file);
  //                       setPreviewUrl(URL.createObjectURL(file));
  //                     }
  //                   }}
  //                 />
  //               </label>
  //               {errors.length > 0 && (
  //                 <div className="text-error mt-1 text-xs">
  //                   {errors[0]?.message}
  //                 </div>
  //               )}
  //             </div>
  //           );
  //         }}
  //       />
  //     </div>
  //     {/* --- Display Name Field --- */}
  //     <form.Field
  //       name="displayName"
  //       children={(field) => {
  //         const { isTouched, errors } = field.state.meta;
  //         const hasError = isTouched && errors.length > 0;
  //         return (
  //           <div>
  //             <label className="label">
  //               <span className="label-text font-semibold">Display Name</span>
  //             </label>
  //             <label
  //               className={`input input-bordered flex items-center gap-2 ${
  //                 hasError ? "input-error" : ""
  //               }`}
  //             >
  //               <IconUser className="size-4 opacity-70" />
  //               <input
  //                 id={field.name}
  //                 name={field.name}
  //                 type="text"
  //                 value={field.state.value}
  //                 disabled={isLoading}
  //                 placeholder="Your Name"
  //                 onChange={(e) => field.handleChange(e.target.value)}
  //                 onBlur={field.handleBlur}
  //                 className="grow"
  //               />
  //             </label>
  //             {hasError && (
  //               <div className="text-error mt-1.5 ml-1 text-xs">
  //                 {errors[0]?.message}
  //               </div>
  //             )}
  //           </div>
  //         );
  //       }}
  //     />
  //     {/* --- Handle Field --- */}
  //     <form.Field
  //       name="handle"
  //       children={(field) => {
  //         const { isTouched, errors } = field.state.meta;
  //         const hasError = isTouched && errors.length > 0;
  //         return (
  //           <div>
  //             <label className="label">
  //               <span className="label-text font-semibold">Handle</span>
  //             </label>
  //             <label
  //               className={`input input-bordered flex items-center gap-2 ${
  //                 hasError ? "input-error" : ""
  //               }`}
  //             >
  //               <IconAt className="size-4 opacity-70" />
  //               <input
  //                 id={field.name}
  //                 name={field.name}
  //                 type="text"
  //                 value={field.state.value}
  //                 disabled={isLoading}
  //                 placeholder="username"
  //                 onChange={(e) => field.handleChange(e.target.value)}
  //                 onBlur={field.handleBlur}
  //                 className="grow"
  //               />
  //             </label>
  //             {hasError && (
  //               <div className="text-error mt-1.5 ml-1 text-xs">
  //                 {errors[0]?.message}
  //               </div>
  //             )}
  //           </div>
  //         );
  //       }}
  //     />
  //     {/* --- Actions --- */}
  //     <div className="flex gap-3 pt-4">
  //       <button
  //         type="button"
  //         // onClick={onCancel}
  //         disabled={isLoading}
  //         className="btn flex-1"
  //       >
  //         Cancel
  //       </button>
  //       <form.Subscribe
  //         selector={(state) => [state.canSubmit, state.isSubmitting]}
  //         children={([canSubmit, isSubmitting]) => (
  //           <button
  //             type="submit"
  //             className="btn btn-primary flex-1 gap-2"
  //             disabled={!canSubmit || isSubmitting || isLoading}
  //             onClick={() => form.handleSubmit()}
  //           >
  //             {isLoading ? (
  //               <span className="loading loading-spinner loading-sm"></span>
  //             ) : (
  //               <IconDeviceFloppy className="size-4" />
  //             )}
  //             Save Changes
  //           </button>
  //         )}
  //       />
  //     </div>
  //     {/* --- Loading Overlay (Matches your example) --- */}
  //     {isLoading && (
  //       <div className="absolute inset-0 z-50 flex min-h-screen items-center justify-center p-4 backdrop-blur-sm">
  //         <div className="card bg-base-300 border-neutral/5 w-full max-w-sm border p-8 shadow-2xl">
  //           <div className="flex flex-col items-center gap-4 text-center">
  //             <span className="loading loading-ring loading-lg text-primary"></span>
  //             <div>
  //               <h2 className="text-lg font-bold">Updating Profile...</h2>
  //               <p className="text-base-content/70 text-sm">Just a moment</p>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     )}
  //   </div>
}
