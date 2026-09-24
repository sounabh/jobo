

```text
                         USER
                          │
                          ▼
                  Visits /login or /signup
                          │
                          ▼
                    LoginPage
                  (Server Component)
                          │
              Reads URL parameters
              mode / next / error
                          │
                          ▼
                     AuthForm
                  (Client Component)
                          │
             ┌────────────┴────────────┐
             │                         │
          Sign In                   Sign Up
             │                         │
             ▼                         ▼
     signInWithEmail()          signUpWithEmail()
        Server Action              Server Action
             │                         │
             └────────────┬────────────┘
                          │
                          ▼
                    Supabase Auth
                          │
                    Authentication
                          │
                 ┌────────┴────────┐
                 │                 │
               Error             Success
                 │                 │
                 ▼                 ▼
               Toast        Session established
                                   │
                                   ▼
                              /dashboard
                                   │
                                   │
                       Browser requests /dashboard
                                   │
                                   ▼
                          + Supabase auth cookies
                                   │
                                   ▼
                              Next.js
                                   │
                                   ▼
                              proxy.ts
                                   │
                                   ▼
                         updateSession(request)
                                   │
                                   ▼
                      Supabase server client
                                   │
                                   ▼
                         supabase.auth
                           .getClaims()
                                   │
                         Is user authenticated?
                              /          \
                            NO            YES
                            │              │
                            ▼              ▼
                         /login        /dashboard
```

### What each part does

**`LoginPage`**

Reads URL parameters:

```text
/login?mode=signup&next=/dashboard
```

and passes them to:

```tsx
<AuthForm mode={mode} next={next} />
```

So `mode=signup` tells the form **which mode to initially open**.

---

**`AuthForm`**

This is the UI.

```text
Sign in / Sign up
Email
Password
Full name (signup)
GitHub
```

It uses:

```ts
useActionState(action, initialState)
```

and:

```tsx
<form action={formAction}>
```

When submitted, React automatically calls:

```ts
action(previousState, formData)
```

---

**Server Action**

For email login:

```ts
supabase.auth.signInWithPassword(...)
```

For signup:

```ts
supabase.auth.signUp(...)
```

These functions run **on the server**, not directly in the browser.

---

**Supabase Auth**

Supabase verifies the credentials and manages the authentication session.

After successful authentication, the browser has the Supabase authentication information/cookies needed for subsequent requests.

---

### Where does `proxy.ts` come in?

You **don't manually call it**.

Next.js automatically runs your `proxy.ts` for requests matching its configured `matcher`.

For example:

```text
Browser requests /dashboard
          ↓
Next.js checks proxy matcher
          ↓
proxy.ts runs
          ↓
updateSession(request)
          ↓
Supabase checks session/claims
```

Then your proxy logic decides:

```text
Valid authenticated session
        ↓
   Allow request
        ↓
   /dashboard


No valid session
        ↓
 Redirect
        ↓
   /login
```

### The easiest way to remember the entire architecture

> **LoginPage decides how the auth page should open → AuthForm collects credentials → Server Action sends them to Supabase → Supabase manages authentication/session → when the user later requests `/dashboard`, Next.js automatically runs `proxy.ts` → `updateSession()` checks the Supabase session → authenticated users continue, unauthenticated users go to `/login`.**
