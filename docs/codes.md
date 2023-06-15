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

###### Toolbox Pages

> - **121**: User navigated back to the 'Study' page from the 'Studies' page.
> - **122**: User navigated back to the 'Study Summary' page from the 'Studies' page.
> - **123**: User navigated back to the 'Studies' page from the 'New Study' page.
> - **124**: User navigated back to the 'Studies' page from the 'Study' page.
> - **125**: User navigated to the 'Study Question Info' page.
> - **126**: User navigated back to the 'Study Question' page from the 'Study Question Info' page.
> - **127**: User navigated back to the previous question.
> - **128**: User navigated back to the next question.
> - **145**: User navigated back to the 'Toolbox' page from the 'Studies' page.
> - **146**: User navigated back to the 'Toolbox' page from the 'Currency Converter' page.
> - **147**: User navigated back to the 'Toolbox' page from the 'Growth Calculator' page.

###### Search Page

> - **129**: User navigated to the 'Search Insights' page (clicked on a search result).
> - **130**: User navigated to the 'Search Insights' page (clicked on a recent search).
> - **131**: User navigated back to the 'Search' page from the 'Search Insights' page.  
> - **132**: User navigated to the 'New Study' page from the 'Search Insights' page.  

###### Profile Page

> - **133**: User navigated to the 'Settings' Page.
> - **134**: User navigated to the 'Frequently Asked Questions' Page.
> - **135**: User navigated to the 'Contact Us' Page.
> - **136**: User navigated to the 'Terms and Privacy Policy' Page.
> - **137**: User navigated back to the 'Profile' page from the 'Settings' page.
> - **138**: User navigated back to the 'Profile' page from the 'Frequently Asked Questions' page.
> - **139**: User navigated back to the 'Profile' page from the 'Contact Us' page.
> - **140**: User navigated back to the 'Profile' page from the 'Terms and Privacy Policy' page.

###### Tools Page

> - **141**: User navigated click on a Tool (includes tool name).
> - **142**: User navigated to the IN PROGRESS or COMPLETED studies tab.
> - **143**: User clicked on the "Swap Currencies" icon in the Currency Converter.
> - **144**: User navigates to a tool (includes tool name).

<br>

## Assets (400-599)
#### e.g. Stocks, Forex, Cash.

###### Search Page

> - **400**: User changed the 'Search Insights' chart range.

###### Holdings Page

> - **401**: User changed the 'Holding Insights' chart range.  

<br>

## Ads (600-700)

###### Search Page

> - **600**: A BANNER ad loaded.
> - **601**: A BANNER ad failed to load.
> - **602**: User clicked on a BANNER ad (opened full page ad).
> - **603**: User closed full page BANNER ad.
> - **604**: Opening REWARD Ad Modal.
> - **605**: closeRewardModal function is called.
> - **606**: A REWARD ad loaded.
> - **607**: A REWARD ad failed to load.
> - **608**: User dismissed a REWARD ad.
> - **609**: A REWARD ad failed to show - giving content access to user.
> - **610**: User finished watching a REWARD ad.
 
<br>

 ## Tools (700-1000)

###### Growth Calculator

> - **700**: Initial Value Changed.
> - **701**: Interest Rate Changed.
> - **702**: Contribution Changed.
> - **703**: Contribution Frequency Changed.
> - **704**: Calculation Type Changed.
> - **705**: User initiated a new calculation.
> - **706**: Not available in the provided code.
> - **707**: Payment Grows Per Payment Changed.
> - **708**: Fees Changed.
> - **709**: Annuity Type Changed.
> - **713**: Tool access has expired.
> - **714**: Tool access is valid.

###### Currency Converter

> - **710**: User converted from one currency to another.
> - **711**: User changed a value.
> - **712**: User clicked on the "Swap Currencies" icon.