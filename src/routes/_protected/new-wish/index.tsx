import { IconEdit, IconLink, IconWand } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import z from "zod";
import { useScrapeWish } from "../../../hooks/use-scrape-wish";
import { loadScrapedWish } from "../../../lib/scraped-wish-storage";

const createWishSchema = z.object({
  url: z.url().trim().min(1, { message: "Product URL is required." }).max(900, {
    message: "Product URL cannot be longer than 900 charachters.",
  }),
});

// TODO: check if we have a product in the local storage and rdirect user to finsih that post. User can discard (delete) the product from step 2 and return here to scrape new one.
export const Route = createFileRoute("/_protected/new-wish/")({
  beforeLoad: () => {
    const persisted = loadScrapedWish();
    if (persisted) {
      throw redirect({
        to: "/new-wish/preview",
      });
    }
  },
  component: RouteComponent,
});
// TODO:
// 3 steps process:
// 1. Paste the link input or fill the form below; Click next
// 2. Preview, if link was pasted - show the loading ui while scraping, and fill out the preview with ability to edit. On edit open the page/overlay with form-like fields to allow edit, and save to go backl to preview; Preview has button "Publish" or wish for it! On wish for it we are publishing the wish and swapping the url to our affiliate link;
// 3. Success with return to home page?
function RouteComponent() {
  const { scrapeWish, isPending } = useScrapeWish();
  const form = useForm({
    defaultValues: {
      url: "",
    },

    validators: {
      onChange: createWishSchema,
    },

    onSubmit: ({ value }) => {
      scrapeWish({ url: value.url });
    },
  });
  // TODO: while pending show the loading overlay before redirecting to next step;

  return (
    <div className="flex h-full w-full flex-col gap-8 lg:gap-8">
      <picture className="mx-auto max-w-[200px] lg:mb-10 lg:max-w-[300px]">
        <img
          src="/create-wish/step-1.png"
          className="aspect-auto h-full w-full"
          width="300"
          height="400"
          alt="Step 1"
        />
      </picture>
      <form.Field
        name="url"
        children={(field) => {
          const { isTouched, errors } = field.state.meta;
          const hasValue = !!field.state.value;
          const hasError = isTouched && errors.length > 0;

          // Determine the message only if the field has been touched
          const message = isTouched
            ? hasValue
              ? errors[0]?.message
              : errors[1]?.message
            : null;

          return (
            <div>
              <label
                className={`input input-bordered border-base-content w-full ${hasError ? "input-error border-error" : ""}`}
              >
                <IconLink
                  width="20"
                  height="20"
                  className={hasError ? "text-error" : ""}
                />
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  disabled={isPending}
                  value={field.state.value}
                  placeholder="https://your-product-link.com"
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={hasError}
                  required
                  className={hasError ? "placeholder:text-error/50" : ""}
                />
              </label>
              {message && (
                <div className="text-error mt-1.5 ml-1.5 text-xs">
                  {message}
                </div>
              )}
            </div>
          );
        }}
      />
      <div className="flex flex-col lg:gap-2">
        <form.Subscribe
          selector={(state) => [
            state.canSubmit,
            state.isTouched,
            state.isDefaultValue,
          ]}
          children={([canSubmit, isTouched, isDefaultValue]) => {
            const disabledSubmit = !canSubmit || !isTouched || isDefaultValue;

            return (
              <button
                type="submit"
                className="btn btn-block btn-primary h-10 text-[14px] font-semibold"
                disabled={isPending || disabledSubmit}
                onClick={() => form.handleSubmit()}
              >
                Create wish <IconWand className="size-4" />
              </button>
            );
          }}
        />
        <div className="divider text-neutral/70 my-2 text-xs">or</div>
        <Link to="/new-wish/preview" className="btn">
          Create wish by hand <IconEdit className="size-4" />
        </Link>
      </div>

      {isPending && (
        <div className="absolute inset-0 flex min-h-screen items-center justify-center p-4 backdrop-blur-xl">
          <div className="card bg-base-300 border-neutral/5 w-full max-w-md border p-12 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <picture className="max-w-[250px]">
                <img
                  src="/create-wish/scrape.png"
                  alt="Love letter with wings"
                  className="animate-pulse"
                />
              </picture>

              <h1 className="mb-2 text-2xl font-bold">
                Getting information about your wish...
              </h1>
              <p className="text-base-content/70 text-sm">Please wait</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
