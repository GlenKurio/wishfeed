- Gifting:

  -- Finsih send e-gift from design; Create a mutation in gift actions hook(separate mutationOptions and firebase function)

  ***

  -- Create gift card design;

  -- Create Gifts page design:
  --- DIsplay main adress in the header of the page, show amount of addresses and allow to edit adresses;
  --- Create addresses page for adresses managementl
  --- create forms to create/update/delete adresses, set address as main;
  --- Include info about when and where addresses are being shared;
  -- Create a separate shipping adress subcollection for users in db;

- Post gift actions:

  --- improve dialog forms: show info on how to send the gift and add a link to gifts page where all info about the gift will be shown;  
  --- Send notifications on dialog actions;
  --- Add rate limiting to actions;

- Create gifts page;

- Posts in draft list on click have a 'Finish' cta. Clicking on which opens the create wish form with prefilled info for this wish so uer can finish it and post;

- Finish post design:
  -- Like posts works as "Wish it" which reposts the wish (add ratelimit to it)

  -- Finish all the todos in the component;
  -- Add actions to post (report, delete, edit, hide?)
  In post actions for owner allow to select wishlists to add post to;

-- Get Feed posts for user from people user follows;

- Search:
  -- Search feature

- Auth:

  -- Improve magic link email design;

- Create wish (polish):

  -- Add create wish ui and functionality to frontend;
  -- Allow to paste the link by pressing cmd+v on create wish page;
  -- Fix the price input; Add currency?

- Replace the link with affiliated link:
  -- Register on most popular plaforms, brands websites and add their affiliate links to the function;
  -- State that app uses affiliate links; Show original url somewhere;

  -- Add firebase hosting and test how it works;
  -- Write simple scraper to get infro from the product page (using puppeteer, cheerio, and googleAI or openAI?); - Use Firecrawl!

  -- Allow to create post by simply pasting the link to the product page;
  -- Allow to share the product to the app from the product page website - Bookmarklet for desktop browser, Web Share Target API (PWA feature);
  -- Create first wisher in Firestore and fetch them into feed

# Finishing

- Finish all todo; especially ones with keeping db data in sync;
- Remove notifications from db after some time; make usre notifications are not being abused by clicking like button or follow/unfollow; Add rate limiting to all db callable actions;

- Make sure images are optimized, do not cause layout shifts, accessible or hidden from screen readers;

- Connect domain to Firbase and make initial deployment to Fiebase;
  --- Connect github repo to firebase to deploy automatically on git push
- On user register create user handle automatically? what if user handle is taken?
- When user reposts(adds the product from the feed to their account) how its done? is it just copiend and can be edited? Or product info is copied (image, link, title, price) and create wish opens with that info filled so user only adds the description and selects the wishlist?
