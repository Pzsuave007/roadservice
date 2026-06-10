# Test Credentials — Ben's Road Service

## Admin Panel
- URL (preview): https://photo-to-sms.preview.emergentagent.com/admin
- URL (live): https://bensroadservice247.com/admin
- Username: `admin`
- Password: `bensroadservice2024`
- Auth type: HTTP Basic Auth (sent on every /api/admin/* request)

## Lead public link (no auth)
- Pattern: `/lead/{id}` (e.g. /lead/z9pms0MpuOk)
- Public, read-only, unguessable id from `secrets.token_urlsafe(8)`.
