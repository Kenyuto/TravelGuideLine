# Tasks: 旅遊行程檢視網站（含登入驗證）

**Feature**: 001-itinerary-view  
**Branch**: 001-itinerary-view  
**Input**: Design documents from `/specs/001-itinerary-view/`

**Prerequisites**: 
- ✅ plan.md (implementation plan with technical stack)
- ✅ spec.md (5 user stories: P0 Login, P1 Itinerary, P2 Search/Filter, P2 Travel Info, P3 Deep Links)
- ✅ research.md (11 technical decisions)
- ✅ data-model.md (6 entities: AuthConfig, AuthItem, ItineraryDay, ItineraryItem, TravelInfo, InfoItem)
- ✅ contracts/google-sheet-csv.md (3 worksheets: 行程 GID 0, 旅遊資訊 GID 1, 登入設定 GID 2)
- ✅ contracts/frontend-api.md (4 Pinia stores, 5 components, 5 utilities, 4 error types)

**Tests**: Tests are included per Constitution requirements (unit + integration + E2E coverage)

**Organization**: Tasks grouped by user story for independent implementation and testing

---

## Format: `- [ ] [TID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US0, US1, US2, US3, US4)
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure (src/, tests/, public/, docs/)
- [ ] T002 Initialize Vue 3 + Vite 5.x + TypeScript 5.x project with dependencies from package.json
- [ ] T003 [P] Configure ESLint + Prettier for Vue 3 + TypeScript strict mode
- [ ] T004 [P] Configure Vitest 1.x for unit/integration tests in vitest.config.ts
- [ ] T005 [P] Configure Playwright 1.40+ for E2E tests in playwright.config.ts
- [ ] T006 [P] Setup Tailwind CSS 3.x with mobile-first configuration in tailwind.config.js
- [ ] T007 [P] Create .env.example with VITE_GOOGLE_SHEET_ID placeholder
- [ ] T008 [P] Setup Git pre-commit hooks (lint-staged + Husky) for code quality

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create TypeScript types in src/types/auth.ts (AuthConfig, AuthItem)
- [ ] T010 [P] Create TypeScript types in src/types/itinerary.ts (ItineraryDay, ItineraryItem)
- [ ] T011 [P] Create TypeScript types in src/types/travelInfo.ts (TravelInfo, InfoItem)
- [ ] T012 [P] Create TypeScript types in src/types/common.ts (4 error types: GoogleSheetError, InvalidPasswordError, PasswordExpiredError, ParsingError)
- [ ] T013 Implement googleSheetParser utility in src/utils/googleSheetParser.ts (3 functions: parseGoogleSheetCSV, getGoogleSheetCSVUrl, fetchGoogleSheetCSV with PapaParse 5.x)
- [ ] T014 [P] Implement dateHelper utility in src/utils/dateHelper.ts (4 functions: formatDate, parseDate, daysBetween, getToday)
- [ ] T015 [P] Implement authHelper utility in src/utils/authHelper.ts (4 functions: saveAuthState, loadAuthState, clearAuthState, isLoginValid with 7-day TTL)
- [ ] T016 Create Vue Router 4.x configuration in src/router/index.ts (Hash mode, 3 routes: /, /itinerary, /travel-info)
- [ ] T017 Create main App.vue with RouterView and global loading/error states
- [ ] T018 Create main.ts entry point with Pinia + Router + App mount

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 0 — 登入驗證 (Priority: P0) 🔒 Security Gate

**Goal**: Implement authentication gate with password validation from Google Sheet, 7-day login persistence, unlimited retry

**Independent Test**: 
- Direct access to / → show login page with password input
- Valid password (any from Google Sheet "登入設定") → enter /itinerary page
- Invalid password → error "密碼錯誤，請重新輸入" with unlimited retry
- Within 7 days → auto-login, direct to /itinerary
- After 7 days → login expired, show login page
- Google Sheet "登入設定" missing/empty → error "無法載入登入設定，請聯絡管理員"

### Implementation for User Story 0

- [ ] T019 [P] [US0] Create AuthStore in src/stores/auth.ts (3 state: isAuthenticated/authTimestamp/passwordList, 3 getters: isLoginValid/validPasswords/remainingTime, 5 actions: loadAuthConfig/validatePassword/login/logout/restoreAuthState)
- [ ] T020 [P] [US0] Create LoginView page in src/views/LoginView.vue (page layout with title, description slot, password input, error display)
- [ ] T021 [P] [US0] Create LoginForm component in src/components/auth/LoginForm.vue (props: loading/error, emits: submit, slots: title/description)
- [ ] T022 [US0] Implement authentication router guard in src/router/index.ts (check isLoginValid, redirect to / with query param if not authenticated)
- [ ] T023 [US0] Implement deep link restoration guard in src/router/index.ts (restore redirect param after login)
- [ ] T024 [US0] Add login/logout functionality to LoginView (call AuthStore actions, handle errors, navigate to /itinerary on success)

### Tests for User Story 0

- [ ] T025 [P] [US0] Unit test for AuthStore in tests/unit/stores/auth.spec.ts (test loadAuthConfig, validatePassword, login/logout, isLoginValid 7-day expiry)
- [ ] T026 [P] [US0] Unit test for authHelper in tests/unit/utils/authHelper.spec.ts (test saveAuthState, loadAuthState, clearAuthState, 7-day TTL calculation)
- [ ] T027 [US0] Integration test for login flow in tests/integration/auth-flow.spec.ts (test full login journey: load config → validate → login → check LocalStorage → logout)
- [ ] T028 [US0] E2E test for login scenarios in tests/e2e/login.spec.ts (6 scenarios from spec.md: unauthenticated, valid password, invalid password, within 7 days, after 7 days, missing config)

**Checkpoint**: User Story 0 complete - Authentication gate functional, login page accessible, password validation working, 7-day persistence verified

---

## Phase 4: User Story 1 — 檢視每日行程 (Priority: P1) 🎯 MVP Core

**Goal**: Display daily itinerary with card-based UI, Emoji display, date navigation (left/right), RWD support

**Independent Test**: 
- Valid Google Sheet with 行程 data → display card-based itinerary with Emoji and key info
- Multi-day trip → swipe/tab navigation works, date switch <1s, content consistent
- Mobile & desktop → clear display with responsive layout

### Implementation for User Story 1

- [ ] T029 [P] [US1] Create ItineraryStore in src/stores/itinerary.ts (6 state: days/currentDate/searchQuery/completedItems/loading/error, 6 getters: currentDayItems/availableDates/filteredItems/tagStatistics/totalCost/completionPercentage, 8 actions: loadItinerary/switchDate/previousDay/nextDay/setSearchQuery/toggleComplete/clearCompletionState/restoreCompletionState)
- [ ] T030 [P] [US1] Create ItineraryView page in src/views/ItineraryView.vue (page layout with date navigation, day card list, loading/error states)
- [ ] T031 [P] [US1] Create ItineraryDayCard component in src/components/itinerary/ItineraryDayCard.vue (props: day/isActive, emits: click, display date header with total cost and completion stats)
- [ ] T032 [P] [US1] Create ItineraryItemCard component in src/components/itinerary/ItineraryItemCard.vue (props: item, emits: toggle-complete/open-map, slots: actions, display 12 fields with Emoji, category-specific fields)
- [ ] T033 [US1] Implement date navigation logic in ItineraryView (previousDay/nextDay buttons, keyboard arrows, touch swipe with hammerjs or native touch events)
- [ ] T034 [US1] Integrate Google Maps links in ItineraryItemCard (open in new tab on mobile, Google Maps app on native)
- [ ] T035 [US1] Add completion state toggle in ItineraryItemCard (checkbox with visual feedback: check icon + gray scale)
- [ ] T036 [US1] Restore completion state on ItineraryStore initialization (call restoreCompletionState from LocalStorage)

### Tests for User Story 1

- [ ] T037 [P] [US1] Unit test for ItineraryStore in tests/unit/stores/itinerary.spec.ts (test loadItinerary, switchDate, previousDay/nextDay, filteredItems, totalCost, completionPercentage, toggleComplete)
- [ ] T038 [P] [US1] Unit test for dateHelper in tests/unit/utils/dateHelper.spec.ts (test formatDate, parseDate, daysBetween, getToday)
- [ ] T039 [P] [US1] Component test for ItineraryItemCard in tests/unit/components/ItineraryItemCard.spec.ts (test props rendering, emits toggle-complete/open-map, completion visual state)
- [ ] T040 [US1] Integration test for itinerary flow in tests/integration/itinerary-flow.spec.ts (test load Google Sheet → display cards → switch date → toggle complete → check LocalStorage)
- [ ] T041 [US1] E2E test for itinerary scenarios in tests/e2e/itinerary.spec.ts (test multi-day navigation, date switch <1s, completion state persistence, empty state display)

**Checkpoint**: User Story 1 complete - Daily itinerary view functional, date navigation working, completion state persistent, RWD verified

---

## Phase 5: User Story 2 — 搜尋／過濾行程 (Priority: P2)

**Goal**: Keyword search with 300ms debounce, category filter (景點/餐廳/交通/住宿), preserve date navigation

**Independent Test**: 
- Data loaded → keyword search "台北101" → show matching cards with preserved date navigation
- Category filter "餐廳" → show only restaurant cards
- Search + filter combined → show cards matching both criteria

### Implementation for User Story 2

- [ ] T042 [P] [US2] Create SearchBar component in src/components/itinerary/SearchBar.vue (props: modelValue/placeholder/clearable, emits: update:modelValue/search, 300ms debounce with lodash or native setTimeout)
- [ ] T043 [P] [US2] Implement searchHelper utility in src/utils/searchHelper.ts (3 functions: searchItineraryItems, matchesSearchQuery, getTagStatistics)
- [ ] T044 [US2] Add SearchBar to ItineraryView (bind to ItineraryStore.searchQuery, call setSearchQuery on input)
- [ ] T045 [US2] Add category filter buttons to ItineraryView (4 buttons: 景點/餐廳/交通/住宿, multi-select with toggle)
- [ ] T046 [US2] Implement filteredItems getter in ItineraryStore (combine searchQuery + category filter, apply to currentDayItems)

### Tests for User Story 2

- [ ] T047 [P] [US2] Unit test for searchHelper in tests/unit/utils/searchHelper.spec.ts (test searchItineraryItems with keyword, matchesSearchQuery with title/location/tags, getTagStatistics)
- [ ] T048 [P] [US2] Component test for SearchBar in tests/unit/components/SearchBar.spec.ts (test v-model binding, emit search on Enter, 300ms debounce, clearable button)
- [ ] T049 [US2] Integration test for search/filter flow in tests/integration/search-filter-flow.spec.ts (test keyword search → filter results → category filter → combined criteria → preserve date navigation)

**Checkpoint**: User Story 2 complete - Search and filter functional, 300ms debounce working, date navigation preserved

---

## Phase 6: User Story 4 — 檢視旅遊資訊 (Priority: P2)

**Goal**: Display travel info (packing list, notes, emergency contacts, budget) in separate tab, category filter, packing state persistence

**Independent Test**: 
- Click "旅遊資訊" tab → display category list and info cards
- Multiple categories → select "攜帶物品" → show only packing items
- Packing list item checked → visual mark (check icon + strikethrough) + state persisted to LocalStorage

### Implementation for User Story 4

- [ ] T050 [P] [US4] Create TravelInfoStore in src/stores/travelInfo.ts (5 state: items/selectedCategory/packedItems/loading/error, 5 getters: categories/filteredItems/itemsByCategory/packingList/packingProgress, 5 actions: loadTravelInfo/filterByCategory/togglePacked/clearPackingState/restorePackingState)
- [ ] T051 [P] [US4] Create TravelInfoView page in src/views/TravelInfoView.vue (page layout with category filter, info card list, packing progress bar)
- [ ] T052 [P] [US4] Create TravelInfoCard component in src/components/travelInfo/TravelInfoCard.vue (props: item/showPackingCheckbox, emits: toggle-packed, display category-specific fields)
- [ ] T053 [US4] Add "旅遊資訊" route to Vue Router in src/router/index.ts (path: /travel-info, component: TravelInfoView)
- [ ] T054 [US4] Add tab navigation in App.vue or main layout (2 tabs: 行程/旅遊資訊, highlight active tab)
- [ ] T055 [US4] Implement category filter in TravelInfoView (buttons: 攜帶物品/注意事項/緊急聯絡/預算/其他, call filterByCategory)
- [ ] T056 [US4] Add packing checkbox to TravelInfoCard (show only for category="打包清單", toggle visual state + call togglePacked)
- [ ] T057 [US4] Restore packing state on TravelInfoStore initialization (call restorePackingState from LocalStorage)

### Tests for User Story 4

- [ ] T058 [P] [US4] Unit test for TravelInfoStore in tests/unit/stores/travelInfo.spec.ts (test loadTravelInfo, filterByCategory, togglePacked, packingProgress, itemsByCategory)
- [ ] T059 [P] [US4] Component test for TravelInfoCard in tests/unit/components/TravelInfoCard.spec.ts (test props rendering, emit toggle-packed, packing checkbox conditional display)
- [ ] T060 [US4] Integration test for travel info flow in tests/integration/travel-info-flow.spec.ts (test load Google Sheet → display categories → filter by category → toggle packed → check LocalStorage)

**Checkpoint**: User Story 4 complete - Travel info view functional, category filter working, packing state persistent

---

## Phase 7: User Story 3 — 分享與深連結 (Priority: P3)

**Goal**: Deep link support with URL params (?date=YYYY-MM-DD&item=<slug>), auto-navigate to specific date or item

**Independent Test**: 
- Open URL with ?date=2024-01-15 → page automatically switches to that date
- Open URL with ?item=taipei-101 → page finds item's date and switches + scrolls to item card
- Deep link with unauthenticated state → show login page first, then navigate after login

### Implementation for User Story 3

- [ ] T061 [P] [US3] Implement deepLinkHelper utility in src/utils/deepLinkHelper.ts (3 functions: getQueryParam, setQueryParams, generateDeepLink)
- [ ] T062 [US3] Add deep link handling to ItineraryView (onMounted: check URL params → call switchDate if date param exists → scroll to item if item param exists)
- [ ] T063 [US3] Preserve deep link params during login flow in authentication guard (store redirect URL with query params → restore after login success)
- [ ] T064 [US3] Add share button to ItineraryItemCard (copy deep link URL to clipboard, show toast "連結已複製")

### Tests for User Story 3

- [ ] T065 [P] [US3] Unit test for deepLinkHelper in tests/unit/utils/deepLinkHelper.spec.ts (test getQueryParam, setQueryParams without page refresh, generateDeepLink URL format)
- [ ] T066 [US3] Integration test for deep link flow in tests/integration/deep-link-flow.spec.ts (test URL with date param → auto switch date, URL with item param → find date + scroll to item)
- [ ] T067 [US3] E2E test for deep link scenarios in tests/e2e/deep-link.spec.ts (test direct access with deep link params, deep link with unauthenticated state → login → navigate)

**Checkpoint**: User Story 3 complete - Deep link functional, URL params working, share button enabled

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, PWA setup, performance optimization

- [ ] T068 [P] Create UIStore in src/stores/ui.ts (4 state: loading/error/isOffline/toasts, 2 getters: hasError/errorMessage, 5 actions: showError/clearError/setOffline/showToast/removeToast)
- [ ] T069 [P] Create Loading component in src/components/common/Loading.vue (spinner + loading text, use Tailwind for animation)
- [ ] T070 [P] Create ErrorMessage component in src/components/common/ErrorMessage.vue (props: error/retry, display error type + message + retry button)
- [ ] T071 [P] Create PWAPrompt component in src/components/common/PWAPrompt.vue (show banner for iOS A2HS, detect PWA installability)
- [ ] T072 [P] Setup PWA with vite-plugin-pwa in vite.config.ts (manifest.json: name/theme_color/icons, service worker with Workbox: NetworkFirst for Google Sheets CSV, CacheFirst for static assets)
- [ ] T073 [P] Add offline detection to App.vue (listen to online/offline events, call UIStore.setOffline, show offline banner)
- [ ] T074 [P] Add global error handling to App.vue (catch unhandled errors, call UIStore.showError with retry function)
- [ ] T075 [P] Optimize images with lazy loading in ItineraryItemCard (use native loading="lazy", add placeholder during load, fallback image on error)
- [ ] T076 [P] Add favicon and app icons to public/ (favicon.ico + manifest icons: 192x192, 512x512)
- [ ] T077 [P] Add meta tags to index.html (Open Graph: title/description/image, viewport for mobile, theme-color)
- [ ] T078 E2E test for offline mode in tests/e2e/offline.spec.ts (test PWA offline mode: cache data → go offline → browse itinerary → date navigation → search → show offline banner)
- [ ] T079 Setup Lighthouse CI in .github/workflows/lighthouse.yml (run on PR, check performance/accessibility/PWA scores: Performance ≥90, Accessibility ≥90, PWA ≥90)
- [ ] T080 [P] Performance optimization: virtual scrolling for long lists (use vue-virtual-scroller or native Intersection Observer for >100 items)
- [ ] T081 [P] Documentation: Update README.md with feature description, setup guide, deployment instructions
- [ ] T082 [P] Documentation: Create docs/ARCHITECTURE.md with store/component/utility structure diagram
- [ ] T083 [P] Run quickstart.md validation (verify all setup steps work, test sample Google Sheet, run dev server, run tests)

**Checkpoint**: All polish tasks complete - PWA enabled, offline mode working, performance optimized, documentation updated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - **BLOCKS all user stories**
- **User Story 0 (Phase 3)**: Depends on Foundational (Phase 2) completion - **BLOCKS all other user stories** (authentication gate)
- **User Story 1 (Phase 4)**: Depends on User Story 0 (Phase 3) completion - Can proceed after authentication works
- **User Story 2 (Phase 5)**: Depends on User Story 0 (Phase 3) completion - Can run in parallel with User Story 1 or 4
- **User Story 4 (Phase 6)**: Depends on User Story 0 (Phase 3) completion - Can run in parallel with User Story 1 or 2
- **User Story 3 (Phase 7)**: Depends on User Story 1 (Phase 4) completion - Needs routing structure from itinerary view
- **Polish (Phase 8)**: Depends on desired user stories completion - Can start after User Story 0 + 1 (MVP)

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← MUST COMPLETE BEFORE USER STORIES
    ↓
Phase 3 (US0 Login) ← MUST COMPLETE BEFORE OTHER USER STORIES
    ↓
    ├─→ Phase 4 (US1 Itinerary) ← MVP Core
    ├─→ Phase 5 (US2 Search/Filter) ← Can run parallel with US1 or US4
    └─→ Phase 6 (US4 Travel Info) ← Can run parallel with US1 or US2
         ↓
         Phase 7 (US3 Deep Links) ← Depends on US1 routing
              ↓
              Phase 8 (Polish) ← Affects all user stories
```

### Within Each User Story

1. **Tests MUST be written FIRST** (write test → verify it fails → implement → verify it passes)
2. **Stores before components** (data layer before UI)
3. **Utilities before stores** (helper functions before state management)
4. **Core implementation before integration** (base features before cross-feature integration)
5. **Story complete before moving to next priority** (validate independently)

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel (T003-T008)

**Phase 2 (Foundational)**: All tasks marked [P] can run in parallel within groups:
- Types: T010, T011, T012 can run together
- Utilities: T014, T015 can run together

**User Story 0 (Login)**: 
- Implementation: T019, T020, T021 can run in parallel (store, view, component in different files)
- Tests: T025, T026 can run in parallel (different test files)

**User Story 1 (Itinerary)**:
- Implementation: T029, T030, T031, T032 can run in parallel (store, view, 2 components)
- Tests: T037, T038, T039 can run in parallel (different test files)

**User Story 2 (Search/Filter)**:
- Implementation: T042, T043 can run in parallel (component, utility)
- Tests: T047, T048 can run in parallel (different test files)

**User Story 4 (Travel Info)**:
- Implementation: T050, T051, T052 can run in parallel (store, view, component)
- Tests: T058, T059 can run in parallel (different test files)

**User Story 3 (Deep Links)**:
- Tests: T065 can run independently

**Phase 8 (Polish)**: Most tasks marked [P] can run in parallel (T068-T077, T080-T082)

**Multiple User Stories in Parallel** (if team capacity allows):
- After **US0 (Login)** completes: US1, US2, US4 can all start in parallel by different developers
- After **US1 (Itinerary)** completes: US3 can start

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable implementation tasks for User Story 1 together:
Task T029: "Create ItineraryStore in src/stores/itinerary.ts"
Task T030: "Create ItineraryView page in src/views/ItineraryView.vue"
Task T031: "Create ItineraryDayCard component in src/components/itinerary/ItineraryDayCard.vue"
Task T032: "Create ItineraryItemCard component in src/components/itinerary/ItineraryItemCard.vue"

# Then launch sequential integration tasks:
Task T033: "Implement date navigation logic in ItineraryView"
Task T034: "Integrate Google Maps links in ItineraryItemCard"
Task T035: "Add completion state toggle in ItineraryItemCard"
Task T036: "Restore completion state on ItineraryStore initialization"

# Launch all parallelizable test tasks for User Story 1 together:
Task T037: "Unit test for ItineraryStore in tests/unit/stores/itinerary.spec.ts"
Task T038: "Unit test for dateHelper in tests/unit/utils/dateHelper.spec.ts"
Task T039: "Component test for ItineraryItemCard in tests/unit/components/ItineraryItemCard.spec.ts"

# Then launch sequential integration/E2E tests:
Task T040: "Integration test for itinerary flow in tests/integration/itinerary-flow.spec.ts"
Task T041: "E2E test for itinerary scenarios in tests/e2e/itinerary.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 0 + 1 Only)

1. Complete **Phase 1: Setup** (T001-T008) → Project structure ready
2. Complete **Phase 2: Foundational** (T009-T018) → **CRITICAL GATE** → Types, utilities, router ready
3. Complete **Phase 3: User Story 0** (T019-T028) → Authentication gate functional
4. Complete **Phase 4: User Story 1** (T029-T041) → Daily itinerary view working
5. **STOP and VALIDATE**: Test independently → Login works + Itinerary displays + Date navigation + Completion toggle
6. **MVP DELIVERABLE**: Deploy to staging/production → Collect feedback

**MVP Scope**: 
- ✅ User Story 0 (Login): Password protection with 7-day persistence
- ✅ User Story 1 (Itinerary): Daily view with card UI, date navigation, completion tracking
- ❌ User Story 2 (Search/Filter): Optional for MVP
- ❌ User Story 4 (Travel Info): Optional for MVP
- ❌ User Story 3 (Deep Links): Optional for MVP

### Incremental Delivery (Recommended)

1. **Foundation** (Phase 1 + 2) → Setup + Core infrastructure → ~8 tasks
2. **MVP** (Phase 3 + 4) → Login + Itinerary → ~31 tasks → **First Deployment** 🚀
3. **Enhancement 1** (Phase 5) → Search/Filter → ~8 tasks → **Second Deployment** 🚀
4. **Enhancement 2** (Phase 6) → Travel Info → ~11 tasks → **Third Deployment** 🚀
5. **Enhancement 3** (Phase 7) → Deep Links → ~7 tasks → **Fourth Deployment** 🚀
6. **Polish** (Phase 8) → PWA + Offline + Performance → ~16 tasks → **Final Deployment** 🚀

Each deployment adds value without breaking previous features, allowing early user feedback and validation.

### Parallel Team Strategy

With multiple developers (recommended team size: 2-3):

1. **Together**: Complete Phase 1 (Setup) + Phase 2 (Foundational) → Foundation ready
2. **Together**: Complete Phase 3 (User Story 0 - Login) → Authentication gate working
3. **Parallel Split** (after US0 completes):
   - **Developer A**: Phase 4 (User Story 1 - Itinerary) → T029-T041
   - **Developer B**: Phase 5 (User Story 2 - Search/Filter) → T042-T049
   - **Developer C**: Phase 6 (User Story 4 - Travel Info) → T050-T060
4. **Developer A** (after US1 completes): Phase 7 (User Story 3 - Deep Links) → T061-T067
5. **Together**: Phase 8 (Polish) → PWA + offline + performance

**Timeline Estimate** (2-3 developers):
- Week 1: Setup + Foundational + Login (Phase 1-3)
- Week 2: Itinerary + Search/Filter + Travel Info (Phase 4-6, parallel)
- Week 3: Deep Links + Polish (Phase 7-8)
- Week 4: Testing + Refinement + Deployment

---

## Testing Strategy

### Test-Driven Development (TDD) Flow

For each user story:

1. **Write tests FIRST** (mark expected behavior)
2. **Verify tests FAIL** (no implementation yet)
3. **Implement minimum code** to pass tests
4. **Verify tests PASS** (implementation correct)
5. **Refactor** if needed (keep tests passing)

### Test Coverage Targets (per Constitution)

- **Unit Tests**: ≥80% coverage (stores, utilities, components)
- **Integration Tests**: All user journeys covered (auth flow, itinerary flow, search/filter flow, travel info flow, deep link flow)
- **E2E Tests**: All critical scenarios (login 6 scenarios, itinerary multi-day navigation, offline mode)

### Test Execution Order

1. **Unit tests** (fast feedback, run on every file save)
2. **Integration tests** (moderate speed, run on commit)
3. **E2E tests** (slow, run on PR + before deployment)

---

## Notes

- **[P] markers**: Indicate parallelizable tasks (different files, no dependency on incomplete tasks)
- **[Story] labels**: Map tasks to user stories for traceability (US0, US1, US2, US3, US4)
- **File paths**: All tasks include exact file paths for clarity
- **Checklist format**: `- [ ] [TID] [P?] [Story?] Description with file path` for tracking progress
- **Test-first approach**: Write tests before implementation per Constitution requirements
- **Independent user stories**: Each story (except US0 authentication gate) can be validated independently
- **Incremental delivery**: Deploy after each user story completion for early feedback
- **Constitution compliance**: 
  - ✅ **Simplicity**: Pure frontend, no backend complexity
  - ✅ **User Value First**: P0/P1 deliver core value (login + itinerary view)
  - ✅ **Pragmatic Performance**: Performance targets in Phase 8 (Lighthouse CI)
  - ✅ **Good Enough Security**: Friendly privacy mechanism, suitable for family/friends
  - ✅ **Testing**: Unit + integration + E2E coverage included
  - ✅ **Clarity & Honesty**: All design decisions documented in research.md

---

## Total Task Count

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 10 tasks (BLOCKING)
- **Phase 3 (US0 - Login)**: 10 tasks (BLOCKING)
- **Phase 4 (US1 - Itinerary)**: 13 tasks (MVP Core)
- **Phase 5 (US2 - Search/Filter)**: 8 tasks
- **Phase 6 (US4 - Travel Info)**: 11 tasks
- **Phase 7 (US3 - Deep Links)**: 7 tasks
- **Phase 8 (Polish)**: 16 tasks

**Total**: 83 tasks

**Parallel Opportunities**: 35+ tasks marked [P] (42% of total)

**MVP Deliverable**: 31 tasks (Phase 1-4: Setup + Foundational + Login + Itinerary)

**Estimated Timeline** (single developer): 4-6 weeks  
**Estimated Timeline** (2-3 developers, parallel execution): 3-4 weeks
