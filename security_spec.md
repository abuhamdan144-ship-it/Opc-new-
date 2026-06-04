# Security Specification and Audit Plan

This specification document outlines the security invariants, access control barriers, and hypothetical testing payloads ("The Dirty Dozen") to test physical access boundaries for the Oman Pakhtoon Community database.

## 1. Data Invariants & Access Models

### Members (`/members/{memberId}`)
- **Read**: Logged in users can view their own profiles. Public profiles may be readable depending on design, but sensitive membership details are isolated. Admins have absolute read access.
- **Create**: Guest/anonymous or verified users can submit a membership draft with role-status pinned to `pending`.
- **Update**: Only admins can process states (e.g. update `status` to `approved` / `rejected`). Users can update their basic profile but cannot change their own administrative status or roles.

### Emergency Reports (`/reports/{reportId}`)
- **Read**: Anyone can view emergency reports (to coordinate mutual-aid blood matching, rescue efforts), or limited to registered users and admins. We allow general read to facilitate emergency coordination, but write permissions are tightly guarded.
- **Create**: Authenticated users can log new reports. Report `id` must match document path and identifier.
- **Update / Delete**: Only administrative leaders or the owner can resolve/verify reports.

### Donations (`/donations/{donationId}`)
- **Read**: General public can read verified donations ledger to transparency auditing, but raw pending records can only be managed by admins.
- **Create**: Guest users can submit donation listings with status equal to `pending`.
- **Update**: Only admins can update status to `verified` or correct mistakes.

### News/Events (`/news/{newsId}`)
- **Read**: Universal read.
- **Write**: Exclusive to administrator roles.

### Elections (`/elections/{electionId}`)
- **Read**: Universal read.
- **Write/Vote**: Admins can edit elections. Authenticated users can update *only* candidate votes via an incremental or validated transaction.

### Advertisements (`/ads/{adId}`)
- **Read**: Universal read.
- **Write/Edit**: Admins only.

### Contact Messages (`/contact_msgs/{msgId}`)
- **Create**: Universal create (anyone can submit a message to the council).
- **Read / Write**: Master Admin only.

---

## 2. The "Dirty Dozen" Exploit Payloads (Negative Tests)

The following malicious payloads must be blocked and return `PERMISSION_DENIED` by our Firestore rules.

1. **Privilege Escalation on Signup**: Guest tries to register as a Pre-approved Admin user.
   - *Target Document*: `/members/attacker_uid`
   - *Payload*: `{"name": "Attacker", "status": "approved"}`
   - *Block Reason*: Normal registration must enforce `status == "pending"`.

2. **Admin Claim Spoofing**: Attempt to construct an administrative setting update by mimicking system keys.
   - *Target Document*: `/settings/announcement`
   - *Payload*: `{"announcement": "Fake news"}`
   - *Block Reason*: Admin check is verified on-chain against lookup or secure rules, and cannot be spoofed.

3. **Anarchy Voting**: Attempt to vote 50 times in an election loop.
   - *Target Document*: `/elections/elec-1`
   - *Payload*: `{"candidates": [{"id": "cand-1", "votes": 999}]}`
   - *Block Reason*: User cannot replace the candidates block or arbitrarily write elections without admin credentials.

4. **Sponsor Highjacking / Spoofing**: Commercial ad manipulation of payments.
   - *Target Document*: `/ads/ad-1`
   - *Payload*: `{"amountPaid": 0, "title": "Free Ad"}`
   - *Block Reason*: Commercial sponsors cannot rewrite sponsor billing details; only admins can edit ads.

5. **PII Harvesting / Cross-User Leak**: Non-admin user tries to read private contact helpdesk queries of other people.
   - *Target Document*: `/contact_msgs/msg-123`
   - *Method*: `GET`
   - *Block Reason*: Contact helpdesk logs are readable inside admin-only guards.

6. **Status Poisoning / Fake ID Stamp**: User updates their own profile to bypass labor validation check.
   - *Target Document*: `/members/user-1`
   - *Update Payload*: `{"status": "approved"}` (modifying exist structure)
   - *Block Reason*: Profile status fields can only be written by active admins.

7. **Arbitrary Big Payload Exhaustion (Wallet Denial)**: Inputting huge mock blobs as description.
   - *Target Document*: `/reports/rep-1`
   - *Payload*: `{"description": "A".repeat(500000)}`
   - *Block Reason*: Length validation guards on standard fields limit sizes.

8. **Orphaned Writes Attack**: Making a fake emergency report with zero valid `userId` reference.
   - *Target Document*: `/reports/rep-attacker`
   - *Payload*: `{"userId": "", "reporterName": "Ghost"}`
   - *Block Reason*: Enforce schema validity rules which match request identifier where appropriate.

9. **Foreign Resource Injection**: Overwriting general configuration layout values under simulated headers.
   - *Target Document*: `/settings/global`
   - *Payload*: `{"customTheme": "malicious-script"}`
   - *Block Reason*: Schema enforces strict keys and path isolation.

10. **Bypassing Server Timestamps with Hack Payload**: Injecting arbitrary future timestamps.
    - *Target Document*: `/contact_msgs/msg-1`
    - *Payload*: `{"createdAt": "2050-01-01"}`
    - *Block Reason*: Time elements must correspond to transaction logs or proper forms.

11. **Malicious ID injection in path parameters**: Creating a document layout with unsafe characters.
    - *Target Document*: `/members/admin..hack..test`
    - *Block Reason*: Id string validation matches `^[a-zA-Z0-9_\\-]+$`.

12. **Double Vote Double-Jeopardy**: Attempting to alter voting files without logging target in election schema.
    - *Target Document*: `/elections/elec-1`
    - *Payload*: `{"status": "closed"}`
    - *Block Reason*: Non-admins cannot close elections.
