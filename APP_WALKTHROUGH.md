# EduCityChain Application - Complete User Flow Guide

This document provides a comprehensive step-by-step walkthrough of all functionalities in the EduCityChain application.

---

## Table of Contents
1. [Initial Setup & Wallet Connection](#1-initial-setup--wallet-connection)
2. [Getting Test SUI Tokens (Faucet)](#2-getting-test-sui-tokens-faucet)
3. [Creating Your Profile](#3-creating-your-profile)
4. [Browsing and Enrolling in Courses](#4-browsing-and-enrolling-in-courses)
5. [Voting on Proposals](#5-voting-on-proposals)
6. [Admin Functions - Creating Courses](#6-admin-functions---creating-courses)
7. [Admin Functions - Creating Proposals](#7-admin-functions---creating-proposals)
8. [Viewing Your Profile & Achievements](#8-viewing-your-profile--achievements)

---

## 1. Initial Setup & Wallet Connection

### Step 1.1: Access the Application
- Open your browser and navigate to the application URL (typically `http://localhost:3000` for local development)
- You'll see the **EduCityChain** header at the top

### Step 1.2: Connect Your Wallet
**On Desktop:**
- Look for the **"Connect Wallet"** button in the top-right corner of the header
- Click the button
- A wallet selection modal will appear
- Select your preferred Sui wallet (e.g., Sui Wallet, Ethos Wallet)
- Approve the connection in your wallet extension
- Your wallet address will appear as a badge in the header (e.g., `0x1234…5678`)

**On Mobile:**
- Tap the hamburger menu (☰) icon in the top-left corner
- In the sidebar menu, find the **"Connect Wallet"** button
- Tap it and follow the wallet connection prompts

### Step 1.3: Verify Connection
- After connecting, you should see:
  - Your wallet address displayed (shortened format)
  - The network badge showing the current network (e.g., "testnet", "devnet", "localnet")
  - A **"Get Test SUI"** button (if on testnet/devnet/localnet)

---

## 2. Getting Test SUI Tokens (Faucet)

**Note:** You need SUI tokens to pay for transaction gas fees. If your balance is below 0.1 SUI, you'll see a yellow alert warning you about low gas balance.

### Step 2.1: Check Your Balance
- The application automatically checks your wallet balance
- If balance is low (< 0.1 SUI), a yellow alert will appear at the top of the dashboard

### Step 2.2: Request Test SUI Tokens

**On Desktop:**
- Click the **"Get Test SUI"** button in the header (top-right)
- Your wallet address will be automatically copied to your clipboard

**On Mobile:**
- Tap the hamburger menu (☰)
- Tap the **"Faucet"** button in the sidebar

### Step 2.3: Complete Faucet Request

**For Testnet:**
- The app will attempt to use the Sui testnet faucet API automatically
- If successful, you'll see a green notification: "Test SUI tokens have been requested. They should arrive shortly."
- If the API fails, you'll receive instructions:
  - Your address has been copied
  - Join Sui Discord (https://discord.gg/sui)
  - Use the `!faucet <your-address>` command in the #testnet-faucet channel

**For Devnet:**
- Your address is copied automatically
- Join Sui Discord and use `!faucet <your-address>` in #devnet-faucet channel
- A notification will provide the Discord link

**For Localnet:**
- Your address is copied automatically
- Open your terminal
- Run: `sui client faucet`
- A notification will remind you of this command

### Step 2.4: Verify Tokens Received
- Wait a few moments for tokens to arrive
- Refresh the page or navigate to see if the low balance alert disappears
- Your balance should now be sufficient for transactions

---

## 3. Creating Your Profile

**Important:** You must create a Profile before you can enroll in courses or vote on proposals. The Profile is an on-chain object that tracks your learning and civic achievements.

### Step 3.1: Navigate to Profile Panel
**Option A - Using Navigation Menu:**
- Click the **"Profile"** link in the left sidebar (desktop) or hamburger menu (mobile)
- Or navigate directly to `/dashboard?tab=profile`

**Option B - From Courses or Proposals:**
- If you try to enroll in a course or vote without a profile, you'll see a yellow notification prompting you to create one
- You can also create a profile from the Courses or Proposals panels using the "Create Profile" button

### Step 3.2: Create Your Profile
- On the Profile panel, you'll see:
  - A title: **"Profile"**
  - Description: "Owned object that tracks your learning + civic achievements."
  - Your wallet address displayed
  - A **"Create Profile"** button

- Click the **"Create Profile"** button
- Your wallet will prompt you to approve the transaction
- Approve the transaction in your wallet
- Wait for confirmation (usually a few seconds)

### Step 3.3: Verify Profile Creation
- After successful creation, you'll see a green notification: "Profile created" with the transaction digest
- The Profile panel will refresh automatically
- You'll now see your profile details:
  - **Education points:** 0 (initially)
  - **Civic points:** 0 (initially)
  - **Completed courses:** — (empty initially)
  - **Voted proposals:** — (empty initially)
  - **Profile object id:** A long hexadecimal ID (your unique profile identifier)

### Step 3.4: Refresh Profile Data (Optional)
- Click the **"Refresh"** button to manually reload your profile data from the blockchain
- This is useful if you've completed actions elsewhere or want to verify the latest state

---

## 4. Browsing and Enrolling in Courses

### Step 4.1: Navigate to Courses Panel
- Click the **"Courses"** link in the left sidebar (desktop) or hamburger menu (mobile)
- Or navigate to `/dashboard?tab=courses`
- You'll see the Courses panel with a list of available courses

### Step 4.2: Search for Courses (Optional)
- At the top of the courses list, you'll find a search input field
- Type keywords to filter courses by title
- Example: Type "blockchain" to find courses with "blockchain" in the title
- The list updates in real-time as you type

### Step 4.3: Browse Available Courses
- Courses are displayed in a grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Each course card shows:
  - **Course Title** (or "Course #X" if no title)
  - **Course ID badge** (e.g., #1, #2)
  - **Content URI** (link to course materials - IPFS/Arweave/HTTPS)
  - **Status badge:** "Not completed" (gray) or "Completed" (green)
  - **Enroll button** (or "Done" if already completed)

### Step 4.4: Enroll in a Course

**Prerequisites:**
- You must have a Profile created (see Section 3)
- You must have sufficient SUI for gas fees

**Enrollment Steps:**
1. Find a course you want to enroll in
2. Click the **"Enroll"** button on the course card
3. Your wallet will prompt you to approve the transaction
4. Approve the transaction
5. Wait for confirmation

**After Enrollment:**
- You'll see a green notification: "Enrolled" with the transaction digest
- Your **Education points** will increase by 1 (check your Profile)
- The course status badge will remain "Not completed" until a teacher marks it as complete
- The "Enroll" button will change to "Done" and become disabled

**Note:** Enrollment is a one-time action per course. You cannot enroll twice in the same course.

### Step 4.5: View Course Completion Status
- Courses you've enrolled in will show "Not completed" until marked complete by a teacher
- Completed courses will show:
  - Green "Completed" badge
  - "Done" button (disabled)
  - Listed in your Profile's "Completed courses" section

### Step 4.6: Create Profile from Courses Panel (If Needed)
- If you don't have a profile yet, you'll see a **"Create Profile"** button at the top of the Courses panel
- Click it to create your profile (same process as Section 3)
- After creating, you can proceed with enrollment

---

## 5. Voting on Proposals

### Step 5.1: Navigate to Proposals Panel
- Click the **"Proposals"** link in the left sidebar (desktop) or hamburger menu (mobile)
- Or navigate to `/dashboard?tab=proposals`
- You'll see the Proposals panel with a list of available proposals

### Step 5.2: Search for Proposals (Optional)
- At the top of the proposals list, you'll find a search input field
- Type keywords to filter proposals by title
- Example: Type "budget" to find proposals with "budget" in the title
- The list updates in real-time as you type

### Step 5.3: Browse Available Proposals
- Proposals are displayed in a grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Each proposal card shows:
  - **Proposal Title** (or "Proposal #X" if no title)
  - **Proposal ID badge** (e.g., #1, #2)
  - **Description** (if available)
  - **Budget** amount
  - **Vote status badge:** "Not voted" (gray) or "Voted" (green)
  - **Voting progress bar** showing Yes/No percentage
  - **Vote counts:** "Yes X / No Y"
  - **Vote buttons:** "No" (light) and "Yes" (filled)

### Step 5.4: Vote on a Proposal

**Prerequisites:**
- You must have a Profile created (see Section 3)
- You must have sufficient SUI for gas fees
- The proposal must be in "Open" status (not finalized)

**Voting Steps:**
1. Read the proposal details (title, description, budget)
2. Review the current vote counts and progress bar
3. Decide whether to vote **"Yes"** or **"No"**
4. Click the appropriate button:
   - **"No"** button (light gray) - to vote against
   - **"Yes"** button (filled blue) - to vote in favor
5. Your wallet will prompt you to approve the transaction
6. Approve the transaction
7. Wait for confirmation

**After Voting:**
- You'll see a green notification: "Vote submitted" with the transaction digest
- Your **Civic points** will increase by 1 (check your Profile)
- The proposal card will update:
  - Status badge changes to green "Voted"
  - Vote buttons become disabled
  - Vote counts update (Yes/No numbers increase)
  - Progress bar updates to reflect new percentages
- The proposal ID will appear in your Profile's "Voted proposals" section

**Important Notes:**
- You can only vote once per proposal (anti-duplicate voting enforced on-chain)
- After voting, you cannot change your vote
- Voting is final once the transaction is confirmed

### Step 5.5: View Voting Results
- Each proposal card shows:
  - **Progress bar:** Visual representation of Yes votes percentage
  - **Vote counts:** "Yes X / No Y" showing exact numbers
  - **Budget:** The proposed budget amount
- Proposals remain open until an admin finalizes them

### Step 5.6: Create Profile from Proposals Panel (If Needed)
- If you don't have a profile yet, you'll see a **"Create Profile"** button at the top of the Proposals panel
- Click it to create your profile (same process as Section 3)
- After creating, you can proceed with voting

---

## 6. Admin Functions - Creating Courses

**Note:** Admin functions require special capability objects (TeacherCap, AdminCap) owned by your wallet. These are typically distributed during contract deployment or by administrators.

### Step 6.1: Navigate to Admin Panel
- Click the **"Admin"** link in the left sidebar (desktop) or hamburger menu (mobile)
- Or navigate to `/dashboard?tab=admin`
- You'll see the Admin panel

### Step 6.2: Check Your Capabilities
- At the top of the Admin panel, you'll see an alert box showing:
  - **TeacherCap:** Your TeacherCap object ID (or "—" if you don't have one)
  - **AdminCap:** Your AdminCap object ID (or "—" if you don't have one)
- **To create courses:** You need a TeacherCap
- **To create proposals:** You need an AdminCap

### Step 6.3: Create a Course

**Prerequisites:**
- You must own a TeacherCap object
- You must have sufficient SUI for gas fees
- CourseCatalog shared object must be configured

**Course Creation Steps:**
1. Scroll to the **"Create course"** card
2. Fill in the form fields:
   - **Title field:** Enter a descriptive course title
     - Example: "Introduction to Blockchain Technology"
     - Example: "Smart Contract Development 101"
   - **Content URI field:** Enter a link to course materials
     - Can be IPFS: `ipfs://QmXxxx...`
     - Can be Arweave: `ar://xxxxx`
     - Can be HTTPS: `https://example.com/course-content`
     - Description text explains: "A link to the course module: IPFS / Arweave / HTTPS"
3. Click the **"Create course"** button
4. Your wallet will prompt you to approve the transaction
5. Approve the transaction
6. Wait for confirmation

**After Course Creation:**
- You'll see a green notification: "Course created" with the transaction digest
- The course will appear in the Courses panel (may require a refresh)
- A new CourseCreated event is emitted on-chain
- The course gets a unique course ID assigned automatically

**Error Handling:**
- If you don't have TeacherCap: Yellow notification "Missing TeacherCap - This wallet has no TeacherCap."
- If transaction fails: Red notification with error message
- If configuration is missing: Error notification explaining what's missing

### Step 6.4: Verify Course Creation
- Navigate to the Courses panel
- Your newly created course should appear in the list
- It will show:
  - The title you provided
  - The content URI you provided
  - A unique course ID
  - "Not completed" status (until students enroll and complete it)

---

## 7. Admin Functions - Creating Proposals

### Step 7.1: Navigate to Admin Panel
- Click the **"Admin"** link in the left sidebar
- Or navigate to `/dashboard?tab=admin`

### Step 7.2: Verify AdminCap
- Check the capabilities alert at the top
- Ensure you have an AdminCap object ID displayed (not "—")

### Step 7.3: Create a Proposal

**Prerequisites:**
- You must own an AdminCap object
- You must have sufficient SUI for gas fees
- ProposalRegistry shared object must be configured

**Proposal Creation Steps:**
1. Scroll to the **"Create proposal"** card
2. Fill in the form fields:
   - **Title field:** Enter a descriptive proposal title
     - Example: "Community Garden Initiative"
     - Example: "Public Library Expansion Budget"
   - **Description field:** Enter detailed proposal description
     - This is a multi-line textarea (minimum 3 rows)
     - Example: "This proposal aims to establish a community garden in the downtown area, providing fresh produce and educational opportunities for residents."
     - Be thorough and clear about the proposal's goals
   - **Budget field:** Enter a numeric budget amount
     - Default value: 100
     - Use the number input to adjust (minimum: 0)
     - Example: 5000 (for a $5000 budget)
     - Example: 10000 (for a $10000 budget)
3. Click the **"Create proposal"** button
4. Your wallet will prompt you to approve the transaction
5. Approve the transaction
6. Wait for confirmation

**After Proposal Creation:**
- You'll see a green notification: "Proposal created" with the transaction digest
- The proposal will appear in the Proposals panel (may require a refresh)
- A new ProposalCreated event is emitted on-chain
- The proposal gets a unique proposal ID assigned automatically
- Initial vote counts: Yes: 0, No: 0
- Status: Open (ready for voting)

### Step 7.4: Verify Proposal Creation
- Navigate to the Proposals panel
- Your newly created proposal should appear in the list
- It will show:
  - The title you provided
  - The description you provided
  - The budget amount you specified
  - Proposal ID badge
  - "Not voted" status for all users
  - Empty progress bar (0% Yes votes)
  - Vote counts: "Yes 0 / No 0"

### Step 7.5: Finalize a Proposal (Admin Only)
**Note:** The finalize functionality is available on-chain but may not be exposed in the UI. Admins can finalize proposals to close voting and see final results.

---

## 8. Viewing Your Profile & Achievements

### Step 8.1: Navigate to Profile Panel
- Click the **"Profile"** link in the left sidebar
- Or navigate to `/dashboard?tab=profile`

### Step 8.2: View Profile Information
Your profile displays the following information:

**Wallet Address:**
- Shows your connected wallet address in shortened format (e.g., `0x1234…5678`)

**Education Points:**
- Tracks your learning achievements
- Increases by 1 each time you enroll in a course
- Displayed as a large number in a card

**Civic Points:**
- Tracks your civic participation
- Increases by 1 each time you vote on a proposal
- Displayed as a large number in a card

**Completed Courses:**
- Lists all course IDs you've completed
- Format: "1, 3, 5" (comma-separated course IDs)
- Shows "—" if you haven't completed any courses
- Courses are marked complete by teachers (not automatically)

**Voted Proposals:**
- Lists all proposal IDs you've voted on
- Format: "1, 2, 4" (comma-separated proposal IDs)
- Shows "—" if you haven't voted on any proposals

**Profile Object ID:**
- Your unique profile identifier on-chain
- A long hexadecimal string (e.g., `0xabcdef123456...`)
- This is the object ID used in transactions

### Step 8.3: Refresh Profile Data
- Click the **"Refresh"** button to reload your profile from the blockchain
- Useful after completing actions to see updated points and lists
- Shows a loading state while fetching

### Step 8.4: Understanding Points System
- **Education Points:** Earned through course enrollment (1 point per enrollment)
- **Civic Points:** Earned through proposal voting (1 point per vote)
- Points are stored on-chain and cannot be manipulated
- Points accumulate over time as you participate

---

## Additional Features & Tips

### Navigation
- **Desktop:** Use the left sidebar for navigation between sections
- **Mobile:** Use the hamburger menu (☰) to access navigation and wallet controls
- **URL Navigation:** You can navigate directly using URLs:
  - `/dashboard?tab=courses`
  - `/dashboard?tab=proposals`
  - `/dashboard?tab=profile`
  - `/dashboard?tab=admin`

### Wallet Management
- **Copy Address:** Click on your wallet address badge, then select "Copy address" from the dropdown menu
- **Disconnect:** Click on your wallet address badge, then select "Disconnect" (red option)
- **Network Display:** Current network is shown as a badge in the header

### Notifications
- The app uses toast notifications for:
  - Transaction success (green)
  - Transaction errors (red)
  - Warnings (yellow)
  - Information (blue)
- Notifications appear in the top-right corner (desktop) or top-center (mobile)

### Data Sources
- The app can fetch data from:
  - **Backend API** (if configured): Faster, indexed data
  - **Blockchain directly**: Fallback if backend is unavailable
- The data source is indicated at the bottom of Courses and Proposals panels

### Error Handling
- **Low Gas Balance:** Yellow alert appears if balance < 0.1 SUI
- **Missing Profile:** Yellow notification when trying to enroll/vote without a profile
- **Missing Capabilities:** Yellow notification when trying admin functions without required caps
- **Transaction Failures:** Red notification with error message
- **Configuration Errors:** Red alerts explaining missing environment variables

### Best Practices
1. **Always check your gas balance** before performing transactions
2. **Create your Profile first** before enrolling or voting
3. **Read proposal details carefully** before voting (votes are final)
4. **Use descriptive titles and descriptions** when creating courses/proposals
5. **Refresh your profile** periodically to see latest achievements
6. **Keep your wallet connected** throughout your session for best experience

---

## Summary Flow Diagram

```
1. Connect Wallet → 2. Get Test SUI → 3. Create Profile
                                              ↓
                    4. Browse Courses → Enroll → Earn Education Points
                                              ↓
                    5. Browse Proposals → Vote → Earn Civic Points
                                              ↓
                    6. View Profile → See Points & Achievements

Admin Flow:
Admin Panel → Check Capabilities → Create Courses/Proposals → Verify Creation
```

---

## Troubleshooting

**Problem:** Cannot connect wallet
- **Solution:** Ensure wallet extension is installed and unlocked

**Problem:** Low gas balance alert
- **Solution:** Use the "Get Test SUI" button or follow faucet instructions

**Problem:** "Create Profile" button is disabled
- **Solution:** Ensure wallet is connected and you have sufficient SUI

**Problem:** Cannot enroll in courses
- **Solution:** Create your Profile first (Section 3)

**Problem:** Cannot vote on proposals
- **Solution:** Create your Profile first (Section 3)

**Problem:** Cannot create courses
- **Solution:** Ensure you own a TeacherCap object

**Problem:** Cannot create proposals
- **Solution:** Ensure you own an AdminCap object

**Problem:** Transactions failing
- **Solution:** Check gas balance, network connection, and ensure all required objects are configured

---

**End of Walkthrough**

