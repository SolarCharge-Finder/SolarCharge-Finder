Client: UI overhaul — responsive styles, sharing, and sell-energy modal

Summary:

- Consolidated and modernized global styles and design tokens; improved responsive behavior and animations.
- Updated navbar to support scroll state, accessibility, and cleaned CSS imports.
- Enhanced search results and station details with share functionality and better action layout.
- Added a Sell Energy CTA + modal form and related styles for the sell-request flow.
- Polished multiple pages (Home, Search, About, Terms, Privacy, StationDetails, User Dashboard) for consistent layout and theming.

Files changed (high level):

- client/src/components/Navbar/Navbar.css — moved styles, cleaned/condensed, kept compatibility comments.
- client/src/components/Navbar/Navbar.jsx — added scroll state, prop `forceSolid`, accessibility improvements.
- client/src/components/SearchBar/SearchResults.jsx — added share button, actions grouping, distance/render fixes.
- client/src/components/SellRequest/AddSellRequest.css — simplified, responsive-friendly form styles.
- client/src/components/map/LocationPickerMap.jsx — adjusted map container sizing and bounds.
- client/src/index.css — replaced older import, introduced design tokens and global utilities.
- client/src/pages/AboutUs.jsx — layout update to `info-page` styles and `Navbar forceSolid`.
- client/src/pages/Home.jsx — ensure `SellEnergySection` included and imports refined.
- client/src/pages/SearchPage.jsx — major layout/text refinements, header, results panel, added `Navbar forceSolid`.
- client/src/pages/StationDetails.jsx — added share action, `Navbar forceSolid`, layout improvements.
- client/src/pages/Terms.jsx — moved to `info-page` layout and `Navbar forceSolid`.
- client/src/pages/User/UserDashboard.jsx — added tabs, active tab state, many UI/structure improvements.
- client/src/pages/privacy.jsx — moved to `info-page` layout and `Navbar forceSolid`.
- client/src/styles/SearchPage.css — new/responsive search page styles and station card refinements.
- client/src/styles/StationDetails.css — refreshed station details styles, cards, gallery and share button.
- client/src/styles/components.css — rewritten/expanded component styles, navbar, hero, CTA, cards.
- client/src/styles/user-dashboard.css — new/updated panel and tab styles for dashboard.
- client/src/components/CallToAction/SellEnergySection.jsx — new Sell Energy CTA + modal and portal logic.

Notes:

- This commit groups layout, styling, and small behavior enhancements across the client app.
- If you want, I can: run the client build, run tests, or create a shorter conventional commit header for git.

Signed-off-by: Automated commit file generator
