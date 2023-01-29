# Codes
###### (More importantly, what they mean!)
<br>

## Authentication (1-99)

###### /api/auth-login:

> - **1**: Successful email / password login. (Currently disabled 29/01/23)  
> - **2**: Failed email / password login (includes AWS error code).  
> - **3**: User had stored tokens and the accessToken was unexpired. Made no changes, returned tokens.   
> - **4**: User had stored tokens however, the accessToken was expired. Refreshed and returned tokens.

###### Auth Plugin:

> - **5**: User authenticated successfully and started a logged-in session.  

###### Login Page:

> - **6**: User clicked on an IDP sign in option.  
> - **7**: User clicked on the 'Sign in' button (email / password)  
> - **8**: User clicked on the 'Sign in' button (email / password), however, the form was invalid.  
> - **9**: User clicked on a link to the signup page.  
> - **10**: User clicked on a link to Terms and Conditions or Privacy Policy.

###### Signup Page:

> - **11**: User clicked on an IDP sign in option.  
> - **12**: User clicked on the 'Create account' button (email / password)  
> - **13**: User clicked on the 'Create account' button (email / password), however, the form was invalid.  
> - **14**: User clicked on a link to the login page.  
> - **15**: User clicked on a link to Terms and Conditions or Privacy Policy.

###### /api/auth-idp-login:

> - **16**: Successfully exchanged Authorization Code for auth tokens, however, no Stockwise userId was found for the user. Creating Stockwise user.
> - **17**: Failed to update AWS user with Stockwise userId.
> - **18**: Failed idp login.

###### Portfolios Overview Page:

> - **19**: IDP Authorization code found in the URL.
> - **20**: After logging in, the userId has not been added to state.  

<br>

## Navigation (100-399)

###### Navigation Bar

> - **100**: User clicked a nav bar button (message includes route name before and after). 

###### Portfolios Page

> - **101**: User navigated to a portfolio. 
> - **102**: User switched to a different tab (PORTFOLIOS or OVERVIEW).   
> - **103**: User navigated to the 'New Portfolio' page.  
> - **120**: User navigated back to the 'Portfolios' page from the 'New Portfolio' page.


###### Holdings Page

> - **104**: User navigated to a 'Holding'.
> - **105**: User switched to a different tab (HOLDINGS or OVERVIEW).
> - **106**: User navigated to the 'New Holding' page.
> - **107**: User navigated to the 'Edit Portfolio' page.
> - **112**: User navigated back to the 'Portfolios' Page.
> - **116**: User navigated back to the 'Holdings' page from the 'New Holding Selection' page.
> - **117**: User navigated back to the 'Holdings' page from the 'New Stock Holding' page.
> - **118**: User navigated back to the 'Holdings' page from the 'New Forex Holding' page.
> - **119**: User navigated back to the 'Holdings' page from the 'New Cash Holding' page.


###### Transactions Page

> - **108**: User navigated to a 'Transaction'.
> - **109**: User switched to a different tab (TRANSACTIONS or INSIGHTS or OVERVIEW).
> - **110**: User navigated to the 'New Transaction' page.
> - **111**: User navigated to the 'Edit Holding' page.
> - **113**: User navigated back to the 'Holdings' page.
> - **114**: User navigated back to the 'Transactions' page from the 'Edit Transaction' page.
> - **115**: User navigated back to the 'Transactions' page from the 'New Transaction' page.

###### Studies Page

> - **121**: User navigated back to the 'Study' page from the 'Studies' page.
> - **122**: User navigated back to the 'Study Summary' page from the 'Studies' page.
> - **123**: User navigated back to the 'Studies' page from the 'New Study' page.
> - **124**: User navigated back to the 'Studies' page from the 'Study' page.
> - **125**: User navigated to the 'Study Question Info' page.
> - **126**: User navigated back to the 'Study Question' page from the 'Study Question Info' page.
> - **127**: User navigated back to the previous question.
> - **128**: User navigated back to the next question.

