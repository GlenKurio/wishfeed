- Get posts:
  -- Improve the profile page design
  -- Display the lists and show the posts by wishlist
  -- Allow to create wishlists; Write a function to get the wishlists;
  -- When click on the post in profile open that list 'feed';
  -- On hover of the post in proifle show actions (same actions that in full feed post card).
  -- Create post actions: one for author, one for other users;
  -- Allow to open the page with followers and following with search;
  -- Make adit profile work;
  -- Display different actions on the proile page if visitor is not the profile owner;

  -- Add ui to get followers, following; Implement functionality to follow/unfollow;
  -- Get Feed posts for user from people user follows

- Finish post design:
  -- Like posts
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
