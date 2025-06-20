Frontend Design Documentation
User Withdrawal Interface

Withdrawal Form Page

Wallet selection dropdown (Account/Referral only)
Current wallet balance display
Amount input field with $10 minimum validation
Binance address input with format validation
Clear fee information display (if any)
Submit button with loading state


Wallet Transfer Interface

Simple transfer form: Trading → Account wallet
Available balance display for both wallets
Amount input with balance validation
Instant transfer confirmation


Withdrawal Status Page

Current withdrawal requests with status
Estimated processing time display
Withdrawal history table
Status indicators (Pending/Processing/Completed/Rejected)


User Dashboard Updates

Withdrawal request notifications
Quick access to withdrawal form
Recent withdrawal activity widget



Admin Dashboard Interface

Pending Withdrawals Section

Real-time pending requests counter
Detailed withdrawal request cards showing:

User information
Requested amount
Receiving address
Request timestamp
User's wallet balance




Withdrawal Management Interface

"Mark as Processing" button (when admin starts manual transaction)
"Mark as Completed" button with confirmation dialog
"Reject" button with reason input field
Copy-to-clipboard functionality for addresses
Notes section for admin comments


Withdrawal Analytics

Daily/weekly withdrawal volume
Processing time statistics
Rejection rate tracking
User withdrawal patterns



User Experience Flow

Withdrawal Request

User navigates to withdrawal page
Selects wallet type and enters details
Receives immediate confirmation with estimated timeline
Gets email confirmation


Transfer Process (if needed)

User sees trading wallet balance
Uses transfer feature to move funds to account wallet
Instant balance update


Status Tracking

User can check status anytime
Receives email updates on status changes
Clear messaging about processing timeline



Admin Experience Flow

Notification Receipt

Admin receives email with withdrawal details
Dashboard shows new pending request notification


Processing Workflow

Admin reviews request details
Marks as "processing" before going to Binance
Performs manual transaction on Binance app
Returns to dashboard to mark as completed
System automatically deducts from user's wallet


Record Keeping

All actions logged with timestamps
Admin can add notes for future reference
Complete audit trail maintained



Key Design Principles

Simplicity First

Minimal steps for users
Clear status messaging
Intuitive admin interface


Transparency

Clear processing timelines
Real-time status updates
Comprehensive history tracking


Security

Address validation
Balance verification
Admin-only completion authority


User Communication

Proactive email notifications
Clear error messaging
Expected timeline communication



This design keeps the system simple while maintaining security and providing a good user experience. The manual admin process ensures control while the frontend provides clear communication throughout the process.