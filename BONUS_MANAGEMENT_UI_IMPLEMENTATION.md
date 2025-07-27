# Bonus Management UI Implementation Documentation

## Overview

The Bonus Management UI provides administrators with a comprehensive interface to review, approve, reject, and manage tutor bonuses. It includes real-time statistics, filtering, bulk operations, and detailed bonus information.

## Implementation Details

### 1. Core Components

#### BonusManagement Component (`components/admin/BonusManagement.tsx`)
The main admin interface component with:
- **Statistics Cards**: Real-time bonus totals by status
- **Filtering & Search**: Filter by status, search by tutor name/email
- **Bonus List**: Detailed list with tutor info and actions
- **Bulk Operations**: Select and approve multiple bonuses
- **Detail Modal**: View complete bonus information
- **Rejection Modal**: Reject with reason tracking

#### useBonusManagement Hook (`lib/hooks/useBonusManagement.ts`)
Custom React hook managing:
- **Data Fetching**: Bonuses and statistics
- **State Management**: Filter, search, selection
- **Actions**: Approve, reject, bulk operations
- **Debounced Search**: Performance optimization
- **Error Handling**: Graceful failure recovery

### 2. Features

#### Statistics Dashboard
- **Pending Approval**: Count and total amount
- **Approved**: Awaiting payment
- **This Month**: Current month total
- **Last Month**: Previous month comparison

#### Bonus List Features
- **Tutor Information**: Name, email, tier
- **Bonus Details**: Type, amount, description
- **Status Indicators**: Visual status badges
- **Tier Display**: Shows multiplier effects
- **Timestamps**: Created/approved dates
- **Actions**: Approve, reject, view details

#### Filtering & Search
- **Status Filter**: All, Pending, Approved, Paid
- **Search**: By tutor name or email (debounced)
- **Sort**: By date or amount
- **Bulk Selection**: Select all pending

### 3. API Endpoints

#### GET `/api/admin/bonuses`
Lists all bonuses with filtering and statistics.

```typescript
// Query Parameters
{
  status?: 'pending' | 'approved' | 'paid' | 'cancelled',
  search?: string,
  sort?: 'date' | 'amount'
}

// Response
{
  bonuses: Array<{
    id: string,
    tutor_id: string,
    tutor_name: string,
    tutor_email: string,
    tutor_tier: string,
    bonus_type: string,
    amount: number,
    status: string,
    metadata: object,
    created_at: string,
    approved_at?: string,
    paid_at?: string
  }>,
  stats: {
    pendingCount: number,
    pendingTotal: number,
    approvedCount: number,
    approvedTotal: number,
    paidCount: number,
    paidTotal: number,
    thisMonthTotal: number,
    lastMonthTotal: number
  }
}
```

#### POST `/api/admin/bonuses`
Bulk operations on multiple bonuses.

```typescript
// Request
{
  action: 'approve' | 'reject' | 'pay',
  bonusIds: string[],
  reason?: string, // For rejections
  paymentReference?: string // For payments
}

// Response
{
  success: boolean,
  updated: number
}
```

#### PUT `/api/admin/bonuses/[id]`
Update individual bonus status or details.

```typescript
// Request
{
  status?: string,
  amount?: number,
  metadata?: object
}

// Response
{
  bonus: Bonus
}
```

### 4. User Interface Flow

#### Approval Workflow
1. Admin views pending bonuses
2. Reviews bonus details (amount, type, metadata)
3. Clicks approve or selects multiple for bulk approval
4. Bonus moves to approved status
5. Shows in approved section awaiting payment

#### Rejection Workflow
1. Admin clicks reject on bonus
2. Modal prompts for rejection reason
3. Reason recorded in metadata
4. Bonus marked as cancelled
5. Audit trail maintained

#### Bulk Operations
1. Filter to show pending bonuses
2. Use checkboxes or "Select All"
3. Click "Approve Selected (X)"
4. All selected bonuses approved
5. Selection cleared, list refreshed

### 5. Security

#### Authentication
- Requires authenticated user
- Validates admin role
- Returns 401/403 for unauthorized

#### Authorization
- Only admins can access endpoints
- Role checked on every request
- Actions logged with user ID

#### Audit Trail
- All updates tracked with timestamps
- User who performed action recorded
- Changes logged to audit table

### 6. UI Components Used

#### From UI Library
- `Card`: Container components
- `Button`: Action buttons
- `Badge`: Status indicators
- `Modal`: Detail and rejection dialogs

#### Icons (Lucide)
- `DollarSign`: Money indicators
- `Clock`: Pending status
- `CheckCircle`: Approved status
- `XCircle`: Rejection action
- `Eye`: View details
- `Search`: Search functionality
- `Filter`: Filter options

### 7. Performance Optimizations

#### Debounced Search
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

#### Selective Re-fetching
- Only refetch after mutations
- Cache results during session
- Limit query to 100 records

#### Optimistic Updates
- UI updates immediately
- Rollback on error
- Show loading states

### 8. Testing Approach

#### Component Testing
- Render with mock data
- Test user interactions
- Verify API calls
- Check error states

#### Integration Testing
- Full flow testing
- Multiple user scenarios
- Error handling
- Performance testing

### 9. Usage

#### Admin Access
1. Navigate to `/admin` dashboard
2. Click "Manage Bonuses" button
3. Or directly visit `/admin/bonuses`

#### Common Tasks
- **Review Pending**: Default view shows all bonuses
- **Approve Single**: Click approve on individual bonus
- **Bulk Approve**: Select multiple, click bulk approve
- **Search Tutor**: Use search bar for specific tutor
- **Filter Status**: Use status buttons to filter
- **View Details**: Click eye icon for full info

### 10. Error Handling

#### Network Errors
- Shows error message with retry button
- Maintains last known state
- Logs errors to console

#### Validation Errors
- Inline error messages
- Prevents invalid actions
- Clear error descriptions

#### Permission Errors
- Redirects to login if unauthenticated
- Shows "Admin access required" if not admin
- Graceful degradation

## Future Enhancements

1. **Export Functionality**
   - CSV export of filtered bonuses
   - PDF reports for accounting
   - Batch processing files

2. **Advanced Filtering**
   - Date range selection
   - Amount range filtering
   - Bonus type filtering
   - Tutor tier filtering

3. **Automation**
   - Auto-approve rules
   - Scheduled payments
   - Notification system

4. **Analytics**
   - Bonus trends over time
   - Tutor performance metrics
   - Cost analysis reports

5. **Workflow Improvements**
   - Multi-step approval process
   - Comments on bonuses
   - Partial approvals
   - Bonus adjustments

## Troubleshooting

### Common Issues

1. **Bonuses Not Loading**
   - Check network connection
   - Verify admin permissions
   - Check browser console

2. **Can't Approve Bonuses**
   - Ensure admin role
   - Check bonus status (must be pending)
   - Verify no network errors

3. **Search Not Working**
   - Wait for debounce (300ms)
   - Check exact spelling
   - Try partial matches

### Debug Commands

```sql
-- Check admin role
SELECT role FROM profiles WHERE id = 'USER_ID';

-- View bonus details
SELECT * FROM tutor_bonuses 
WHERE id = 'BONUS_ID';

-- Check bonus statistics
SELECT status, COUNT(*), SUM(amount) 
FROM tutor_bonuses 
GROUP BY status;
``` 