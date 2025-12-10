- Profile:

  -- On avatar update remove old avatar from storage;

  -- Add breadcrumbs and "Go back" buttons to pages(header?)

  -- Show info and allow actions based on user profile privacy settings;
  -- Display different actions on the proile page if visitor is not the profile owner; -- In post actions for owner allow to select wishlists to add post to;
  -- Add ui to get followers, following; Implement functionality to follow/unfollow;

  -- Allow to open the page with followers and following with search;

- Post:
  -- Posts in draft list on click have a 'Finish' cta. Clicking on which opens the create wish form with prefilled info for this wish so uer can finish it and post;
  -- On hover of the post in proifle show actions (same actions that in full feed post card).
  - Finish post design:
    -- Like posts (add ratelimit to it)
    -- Save post
    -- Finish all the todos in the component;
    -- Add actions to post (report, delete, edit, hide?)

  -- Get Feed posts for user from people user follows;

- Gifting:
  -- How 'gifting' will work?

- Notifications:
  -- Notifications feature

- Search:
  -- Search feature

- Auth:

  -- Improve magic link email design;

- Create wish (polish):

  -- Add create wish ui and functionality to frontend;
  -- Allow to paste the link by pressing cmd+v on create wish page;

- Replace the link with affiliated link:
  -- Register on most popular plaforms, brands websites and add their affiliate links to the function;
  -- State that app uses affiliate links; Show original url somewhere;

  -- Add firebase hosting and test how it works;
  -- Write simple scraper to get infro from the product page (using puppeteer, cheerio, and googleAI or openAI?); - Use Firecrawl!

  -- Allow to create post by simply pasting the link to the product page;
  -- Allow to share the product to the app from the product page website - Bookmarklet for desktop browser, Web Share Target API (PWA feature);
  -- Create first wisher in Firestore and fetch them into feed

# Finishing

- Make sure images are optimized, do not cause layout shifts, accessible or hidden from screen readers;

- Connect domain to Firbase and make initial deployment to Fiebase;

- On user register create user handle automatically? what if user handle is taken?
- When user reposts(adds the product from the feed to their account) how its done? is it just copiend and can be edited? Or product info is copied (image, link, title, price) and create wish opens with that info filled so user only adds the description and selects the wishlist?
