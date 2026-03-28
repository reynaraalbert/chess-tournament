# Chess Play Interface Implementation Plan

This plan details the steps to build the [play.html](file:///c:/Users/Asus/Documents/Chess%20Tour/play.html) page to match the specified requirements. The UI will have a glassmorphism theme consistent with the rest of the application.

## User Review Required
> [!IMPORTANT]
> To ensure the chess logic works perfectly (valid moves, checkmate detection), I plan to use standard libraries via CDNs:
> 1. **chess.js**: Handles all back-end game logic (move validation, check, checkmate, piece mapping).
> 2. **chessboard.js** (or a vanilla JS equivalent like cm-chessboard) & **jQuery**: For rendering the interactive board and handling drag-and-drop.
> 
> *Are you okay with including these via external CDNs (`<script src="..."></script>`), or do you prefer a strictly custom-built board from scratch (which takes significantly more code)?*

## Proposed Changes

### UI & Layout ([play.html](file:///c:/Users/Asus/Documents/Chess%20Tour/play.html))
The HTML structure will be divided into three main sections:
- **Top Center**: A fixed header showing the Match Time and Current Score differential.
- **Middle Section**:
  - **Left Area**: Player Profile for the Opponent (Avatar, Name, ELO).
  - **Center Area**: The actual Chessboard container.
  - **Right Area**: Player Profile for You (Avatar, Name, ELO).
- **Modals**: A hidden "Game Over" modal that appears on checkmate/stalemate with buttons for **Quit** and **Rematch**.

#### [MODIFY] [play.html](file:///c:/Users/Asus/Documents/Chess%20Tour/play.html)
Will add the entire HTML structure, integrating the CSS and JS files, and defining the layout using Flexbox/Grid for a responsive center-aligned board with side profiles.

### Styling ([style.css](file:///c:/Users/Asus/Documents/Chess%20Tour/style.css) updates or inline CSS in [play.html](file:///c:/Users/Asus/Documents/Chess%20Tour/play.html))
- Reuse existing variables (`--bg-dark`, `--primary`, `--glass-bg`).
- Add specific classes for `.chess-container`, `.profile-card` (Left/Right), `.score-time-board` (Top Center).
- Add styling for the Game Over glassmorphism modal overlay.

### Match Logic & Scoring (`<script>` in [play.html](file:///c:/Users/Asus/Documents/Chess%20Tour/play.html))
- **Initialization**: Set up the `Chess()` instance and the UI board.
- **Timer**: A countdown mechanism that ticks down every second, swapping between player turns.
- **Piece Capture logic**: 
  - Every time a move is made, check if a piece was captured.
  - Calculate score: Pawn (+1), Knight/Bishop (+3), Rook (+5), Queen (+9).
  - Update the "Score" UI dynamically.
- **Match End**:
  - Detect `in_checkmate()`, `in_stalemate()`, or Time Out.
  - Calculate final ELO modification based on base points (e.g., Win=+20, Loss=-20) plus/minus the captured piece score differential.
  - Show the Game Over Modal.

## Verification Plan
### Manual Verification
1. Open [play.html](file:///c:/Users/Asus/Documents/Chess%20Tour/play.html) in the browser.
2. Verify that the Opponent profile is on the Left, Chessboard in the Center, and Your profile on the Right.
3. Make moves on the board; verify that capturing a piece updates the Score correctly based on the piece type.
4. Let the timer run to test time-out or play to a checkmate to ensure the Game Over Modal appears with Quit/Rematch buttons.
5. Verify the ELO calculation accounts for captured pieces properly.
