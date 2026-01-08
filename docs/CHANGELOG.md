# Changelog

All notable changes to the backend, database, and edge functions are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

*No unreleased changes*

---

## [1.2.0] - 2026-01-07

### Added
- **check-admin Edge Function** - Server-side admin role verification
  - Endpoint: `POST /functions/v1/check-admin`
  - Uses service role key to securely query user_roles table
  - Returns boolean `isAdmin` status
  - Prevents client-side admin status manipulation

### Changed
- **AuthContext** - Migrated admin checks from client-side to server-side
  - Now calls `check-admin` edge function instead of querying database directly
  - Added session caching (5-minute TTL) to reduce backend calls
  - Cache is cleared on sign out and invalidated on user change

### Security
- Admin role verification now happens entirely on the backend
- Client code only receives boolean result, no role data exposed

---

## [1.1.0] - 2026-01-06

### Added
- **submit-form Edge Function** - Secure form submission handler
  - Endpoint: `POST /functions/v1/submit-form`
  - Rate limiting: 5 requests per minute per IP per form type
  - Honeypot protection for bot detection
  - Input validation for all form types

### Changed
- Form submissions now go through edge function instead of direct database insert
- Added server-side validation for contact, career, and NowRise applications

---

## [1.0.0] - 2026-01-05

### Added
- **Database Tables**
  - `profiles` - User profile information
  - `user_roles` - Role-based access control (admin, editor, user)
  - `contact_requests` - Contact form submissions
  - `career_applications` - Job applications
  - `nowrise_applications` - NowRise Institute applications
  - `content_pages` - CMS content storage
  - `custom_forms` - Dynamic form builder definitions
  - `form_submissions` - Custom form submission data

- **Database Functions**
  - `has_role()` - Check if user has specific role (SECURITY DEFINER)
  - `update_updated_at_column()` - Auto-update timestamps trigger
  - `handle_new_user()` - Create profile on user signup

- **Enums**
  - `app_role` - admin, editor, user
  - `application_status` - pending, reviewing, approved, rejected

- **Row Level Security**
  - All tables have RLS enabled
  - Admin-only access for management operations
  - Public INSERT for form submissions
  - Owner-based access for profiles

- **Authentication**
  - Email/Password signup and login
  - Google OAuth integration
  - Auto-confirm email enabled
  - Profile auto-creation on signup

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 1.2.0 | 2026-01-07 | Server-side admin checks with caching |
| 1.1.0 | 2026-01-06 | Form submission edge function |
| 1.0.0 | 2026-01-05 | Initial database setup |

---

## How to Update This Changelog

When making backend changes, add an entry under `[Unreleased]` with:

```markdown
### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security-related changes
```

When releasing, move unreleased items to a new version section with the date.
