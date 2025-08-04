- header (voice record -> helpline): frontend

- search products by name or number (larger screen), search products (name)

- add multiple product (product name, location, dept required), give all the input fields, when enter one character in input field then create the next rows ✅

- product name < 3 (validation) ✅

- when user not logged in, the site should be viewable (no edit delete button, should be visible), if tries creating updating anything in the site, then ask for login

- user remark (delete icon for only that particular user)

- image (delete icon only for that particular user)

- add to home screen in mobile view (pwa)

- edit button in product information page (should be visible only to the user who created the product)

- product display page

- create multiple products ✅

- bulk qr download testing (product_code) ✅

- quantity by default will be 0 ✅

- product list ✅

- mobile responsiveness (hide qr download and bulk create in mobile view) ✅

- header section redesign for larger screen ✅

- search implement ✅

- update ✅ (name, quantity, belong to department, cover image and location )

- after search result, it should be redirecting to that particular page

**Testing Bugs**

- [x] first time open website if refres default camera is open
- [ ] Scroll is not work properly ---1
- [x] after login not any option to going home page
- [x] What is the work of helf desk at header
- [x] Product images is not deleted
- [ ] Multiple images not uploads in product image -- only allow to upload one image
- [ ] The filter ribbon should be hidden if not showing any button in mobile screen -- 2
- [ ] The "X" button in the search bar is appering outside the search box when its open -- 1
- [ ] Pagination should not be visible if only one page of products -- 3
- [ ] There should be a minimum height for the product_container, also the overflow-y should be hidden for less data -- 3
- [x] Bulk create api response - 413 Content Too Large -- 1
- [x] Image deletion failed while deleting product images in mobile devices -- 1
- [ ] The mobile footer for Scan QR and Add Product should be hidden when a modal is opened -- 1
- [ ] The "edit" & "Delete" buttons are collapsing with the reviews -- 1
- [ ] there should not be an edit button for voice reviews -- 1
- [ ] Not able to scroll the textarea for edit section of review -- 1
- [ ] Even though the "bulk-create" call is failed the toast says - "Saving the products will take some time" -- 3
- [ ] The Card Design breaks for long words like "Hardgoods_Display" -- 2
- [ ] edit/ api responed with - 413 Content Too Large -- 1
- [ ] There is no button to go to scan qr page from the desktop mode -- 2
- [ ] Username should be checked in lowercase for login -- 1
- [ ] The Add Product button should be hidden when user is not logged in -- 1
- [ ] What is the purpose of Cancel button when there are "Delete" and "Save" buttons to finalize the voice reviews -- 1 - remove the delete button.
