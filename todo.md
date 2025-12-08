- Profile:
  - Wishlists:

    -- Allow to create wishlists:
    -- Pass the selected wishlist into edit page;
    -- Edit wishlist;
    -- Delete wishlist;
    -- allow to add wishes from edit wishlist page; Open a dialog with all wishes list and allow to select; Make wishes a scrollable section with minis, click/tap on mini triggers removeWishFromList action, and triggers a dialog to confirm; Has add wish button as last mini; Edit list button opens the dialog with list to select/deselect wishes;
    -- Add the description of the wishlist to the mini in manage on hover and on the top of the feed with list title;

    -- Add a title on hover to the post mini;

  -- Posts in draft list on click have a 'Finish' cta. Clicking on which opens the create wish form with prefilled info for this wish so uer can finish it and post;
  -- Change $userId to handle;
  -- Add breadcrumbs and "Go back" actions to pages(header?)

  -- Display different actions on the proile page if visitor is not the profile owner; -- In post actions for owner allow to select wishlists to add post to;

  -- On hover of the post in proifle show actions (same actions that in full feed post card).
  -- Show info and allow actions based on user profile privacy settings;

  -- Create post actions: one for author, one for other users;

  -- Add ui to get followers, following; Implement functionality to follow/unfollow;

  -- Allow to open the page with followers and following with search;

  -- Get Feed posts for user from people user follows:
  -- Get user feed posts in loader/preload and also get user profiles for posts? Profile later can be reused from cache in profile page layout loader? SHould I load all the profiles from feed or better to keep some data in post in db and just update it using firebase function when user updates the profile?

- Finish post design:
  -- Like posts (add ratelimit to it)
  -- Save post
  -- Finish all the todos in the component;
  -- Add actions to post (report, delete, edit, hide?)

- Auth:

  -- Create a function to update posts when user updates the profile doc in firestore; (Name, handle, or avatar)
  -- Improve magic link email design;

- Create wish:

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

- How 'gifting' will work?

# Finishing

- Make sure images are optimized, do not cause layout shifts, accessible or hidden from screen readers;

- Connect domain to Firbase and make initial deployment to Fiebase;

- On user register create user handle automatically? what if user handle is taken?
- When user reposts(adds the product from the feed to their account) how its done? is it just copiend and can be edited? Or product info is copied (image, link, title, price) and create wish opens with that info filled so user only adds the description and selects the wishlist?
