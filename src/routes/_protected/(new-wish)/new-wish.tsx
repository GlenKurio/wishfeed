import { IconLink } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useScrapeProduct } from "../../../hooks/use-scrape-product";
import { useForm } from "@tanstack/react-form";
import z from "zod";

const createWishSchema = z.object({
  url: z.url().trim().min(1, { message: "Product URL is required." }).max(900, {
    message: "Product URL cannot be longer than 900 charachters.",
  }),
});

export const Route = createFileRoute("/_protected/(new-wish)/new-wish")({
  component: RouteComponent,
});
// TODO:
// 3 steps process:
// 1. Paste the link input or fill the form below; Click next
// 2. Preview, if link was pasted - show the loading ui while scraping, and fill out the preview with ability to edit. On edit open the page/overlay with form-like fields to allow edit, and save to go backl to preview; Preview has button "Publish" or wish for it! On wish for it we are publishing the wish and swapping the url to our affiliate link;
// 3. Success with return to home page?
function RouteComponent() {
  const { scrapeProduct, isPending } = useScrapeProduct();
  const form = useForm({
    defaultValues: {
      url: "",
    },

    validators: {
      onChange: createWishSchema,
    },

    onSubmit: ({ value }) => {
      scrapeProduct({ url: value.url });
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-8 lg:gap-4">
      <picture className="mx-auto mb-4 max-w-[150px] lg:mb-12 lg:max-w-[300px]">
        <img src="/create-wish/step-1.png" className="h-full w-full" />
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
      <div className="flex flex-col lg:gap-4">
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
                {isPending ? "Creating wish..." : "Create wish  🪄"}
              </button>
            );
          }}
        />
        <div className="divider text-neutral/70 my-2 text-xs">or</div>
        <Link to="/preview" className="btn">
          Create wish by hand
        </Link>
      </div>
    </div>
  );
}
