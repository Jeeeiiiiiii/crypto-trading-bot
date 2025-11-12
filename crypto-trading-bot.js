 /**
 * High-Frequency Scalping Trading Bot (Simulated)
 * For Educational/Simulation Purposes Only.
 *
 * This script is designed to be injected into a web trading platform's browser console.
 * It creates a draggable UI overlay, monitors price changes, implements a tick-scalping
 * strategy, and tracks simulated trading performance.
 *
 * Target Platform (Example): https://app.webull.com/stocks (Ethereum chart)
 *
 * Features:
 * - Draggable, semi-transparent UI overlay with terminal aesthetic.
 * - Displays current price, bot status, position info, P&L stats, trade history.
 * - START, STOP, CLOSE POSITION buttons.
 * - Monitors price changes using MutationObserver on a specified XPath.
 * - Simulates tick scalping based on momentum.
 * - Supports simulated long and short positions.
 * - Auto-exits positions on profit target, stop loss, or time limit.
 * - Tracks total P&L, win rate, and number of trades.
 * - Maintains price history and calculates basic 1-minute OHLC (for display/logging).
 * - Console logging for debugging.
 *
 * Usage:
 * 1. Navigate to the target web trading platform (e.g., Webull ETH chart).
 * 2. Open your browser's developer console (F12 or Cmd+Option+I).
 * 3. Paste this entire script into the console and press Enter.
 * 4. The UI overlay should appear. Click 'START' to activate the bot.
 */

(function() {
    // --- Configuration ---
    const TARGET_PRICE_XPATH = '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]';
    const MOMENTUM_SHORT_AVG_PERIOD = 5;  // Shorter average period for momentum
    const MOMENTUM_LONG_AVG_PERIOD = 20;  // Longer average period for momentum
    const MOMENTUM_THRESHOLD = 0.00005; // Sensitivity for entering trades (e.g., 0.005% price change)
    const PROFIT_TARGET_PERCENT = 0.0008; // 0.08% profit target (e.g., for $1000, $0.8 profit)
    const STOP_LOSS_PERCENT = 0.0004;    // 0.04% initial fixed stop loss
    const TRAILING_STOP_PERCENT = 0.0002; // 0.02% trailing stop step
    const POSITION_TIME_LIMIT_MS = 60 * 1000; // Max 60 seconds per trade to enforce high-frequency
    const PRICE_HISTORY_MAX_SIZE = 100;  // Max number of price ticks to store
    const OHLC_UPDATE_INTERVAL_MS = 60 * 1000; // Update OHLC every 1 minute
    const BOT_QUANTITY = 1; // Simulated quantity for each trade (e.g., 1 ETH)

    // --- Global State Variables ---
    let botStatus = 'STOPPED'; // 'STOPPED', 'RUNNING', 'POSITION_OPEN'
    let currentPrice = 0;
    let priceHistory = []; // Stores raw price ticks
    let ohlcData = [];     // Stores 1-minute OHLC bars [{open, high, low, close, timestamp}]

    let position = null; // { type: 'LONG'/'SHORT', entryPrice, entryTime, quantity, initialStopLoss, trailingStopValue }

    let totalPnl = 0;
    let numTrades = 0;
    let numWins = 0;
    let tradeLog = []; // Stores objects: { timestamp, type, entryPrice, exitPrice, pnl, status }

    let priceObserver = null; // MutationObserver instance
    let ohlcInterval = null;  // Interval for OHLC calculation

    let overlayElement = null; // Reference to the UI overlay div

    // --- UI Overlay Elements (references will be populated after creation) ---
    let currentPriceDisplay, botStatusDisplay, positionInfoDisplay,
        pnlStatsDisplay, tradeLogDisplay, startButton, stopButton, closeButton;

    // --- Utility Functions ---

    /**
     * Parses a price string (e.g., "$1,234.56") into a float.
     * @param {string} priceStr - The price string from the DOM.
     * @returns {number} The parsed price as a float, or 0 if parsing fails.
     */
    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        try {
            // Remove currency symbols, commas, and trim whitespace
            return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        } catch (e) {
            console.error('Error parsing price string:', priceStr, e);
            return 0;
        }
    }

    /**
     * Calculates momentum based on recent and older price averages.
     * A positive momentum suggests an upward trend, negative for downward.
     * @param {Array<number>} history - Array of recent price ticks.
     * @returns {number} The momentum value.
     */
    function calculateMomentum(history) {
        if (history.length < MOMENTUM_LONG_AVG_PERIOD) {
            return 0; // Not enough data for meaningful momentum calculation
        }

        const shortAvg = history.slice(-MOMENTUM_SHORT_AVG_PERIOD).reduce((sum, p) => sum + p, 0) / MOMENTUM_SHORT_AVG_PERIOD;
        const longAvg = history.slice(-MOMENTUM_LONG_AVG_PERIOD).reduce((sum, p) => sum + p, 0) / MOMENTUM_LONG_AVG_PERIOD;

        return (shortAvg - longAvg) / longAvg; // Relative difference
    }

    /**
     * Updates the UI overlay with current bot status and trade information.
     */
    function updateUI() {
        if (!overlayElement) return; // UI not initialized yet

        currentPriceDisplay.textContent = `Current Price: $${currentPrice.toFixed(2)}`;
        botStatusDisplay.textContent = `Status: ${botStatus}`;

        if (position) {
            const currentPositionPnl = (currentPrice - position.entryPrice) * (position.type === 'LONG' ? 1 : -1) * position.quantity;
            positionInfoDisplay.innerHTML = `
                Position: ${position.type} <br>
                Entry: $${position.entryPrice.toFixed(2)} <br>
                Current P&L: $${currentPositionPnl.toFixed(2)}
            `;
        } else {
            positionInfoDisplay.textContent = 'Position: None';
        }

        const winRate = numTrades > 0 ? ((numWins / numTrades) * 100).toFixed(2) : '0.00';
        pnlStatsDisplay.innerHTML = `
            Total P&L: $${totalPnl.toFixed(2)} <br>
            Trades: ${numTrades} (Wins: ${numWins}) <br>
            Win Rate: ${winRate}%
        `;

        // Update trade log display
        tradeLogDisplay.innerHTML = tradeLog.map(trade => {
            const pnlColor = trade.pnl >= 0 ? 'lawngreen' : 'red';
            return `<span style="color: grey;">${new Date(trade.timestamp).toLocaleTimeString()}</span> - ${trade.type}: Entry $${trade.entryPrice.toFixed(2)}, Exit $${trade.exitPrice.toFixed(2)}, P&L: <span style="color: ${pnlColor};">$${trade.pnl.toFixed(2)}</span> (${trade.status})`;
        }).join('<br>');

        // Scroll to bottom of trade log
        tradeLogDisplay.scrollTop = tradeLogDisplay.scrollHeight;

        // Update button states
        startButton.disabled = botStatus === 'RUNNING';
        stopButton.disabled = botStatus === 'STOPPED';
        closeButton.disabled = !position;
    }

    /**
     * Adds a trade record to the history and updates overall stats.
     * @param {'LONG'|'SHORT'} type - Type of the trade.
     * @param {number} entryPrice - Price at which position was opened.
     * @param {number} exitPrice - Price at which position was closed.
     * @param {number} pnl - Profit or loss for this trade.
     * @param {string} status - Reason for closing ('PROFIT', 'STOP_LOSS', 'TIME_LIMIT', 'MANUAL').
     */
    function logTrade(type, entryPrice, exitPrice, pnl, status) {
        tradeLog.push({
            timestamp: Date.now(),
            type,
            entryPrice,
            exitPrice,
            pnl,
            status
        });
        // Keep log size manageable
        if (tradeLog.length > 50) {
            tradeLog.shift();
        }

        numTrades++;
        totalPnl += pnl;
        if (pnl >= 0) { // Consider breakeven a win for win rate calc
            numWins++;
        }
        console.log(`TRADE LOG: ${type} - Entry: $${entryPrice.toFixed(2)}, Exit: $${exitPrice.toFixed(2)}, P&L: $${pnl.toFixed(2)} (${status})`);
        updateUI();
    }

    /**
     * Displays a temporary message on the UI.
     * @param {string} message - The message to display.
     * @param {'info'|'warning'|'error'} type - Type of message for styling (optional).
     */
    function showMessage(message, type = 'info') {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = `[${type.toUpperCase()}] ${message}`;
        msgDiv.style.color = type === 'error' ? 'red' : (type === 'warning' ? 'yellow' : 'cyan');
        msgDiv.style.marginTop = '5px';
        msgDiv.style.padding = '5px';
        msgDiv.style.border = '1px solid currentColor';
        msgDiv.style.borderRadius = '3px';
        msgDiv.style.animation = 'fadeout 5s forwards';

        // Add a simple fade-out animation CSS
        if (!document.getElementById('bot-message-style')) {
            const style = document.createElement('style');
            style.id = 'bot-message-style';
            style.innerHTML = `
                @keyframes fadeout {
                    0% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); display: none; }
                }
            `;
            document.head.appendChild(style);
        }

        overlayElement.querySelector('#bot-status-display').after(msgDiv); // Insert after status
        setTimeout(() => msgDiv.remove(), 5000); // Remove after animation
    }

    // --- Trading Logic ---

    /**
     * Handles new price ticks from the MutationObserver.
     * This is the core loop for the trading strategy.
     * @param {Array<MutationRecord>} mutationsList
     */
    function handlePriceChange(mutationsList) {
        if (botStatus !== 'RUNNING' && botStatus !== 'POSITION_OPEN') {
            return; // Only process if bot is active
        }

        for (const mutation of mutationsList) {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const newPriceStr = mutation.target.textContent || '';
                const newPrice = parsePrice(newPriceStr);

                if (newPrice > 0 && newPrice !== currentPrice) {
                    currentPrice = newPrice;
                    priceHistory.push(currentPrice);
                    if (priceHistory.length > PRICE_HISTORY_MAX_SIZE) {
                        priceHistory.shift(); // Keep history size limited
                    }
                    updateUI(); // Update price immediately on UI

                    tradingStrategy(); // Execute trading strategy on each price tick
                }
            }
        }
    }

    /**
     * Executes the simulated trading strategy based on current price and momentum.
     */
    function tradingStrategy() {
        if (botStatus === 'STOPPED' || currentPrice === 0 || priceHistory.length < MOMENTUM_LONG_AVG_PERIOD) {
            return; // Not ready to trade
        }

        // --- Position Management (Exit Logic) ---
        if (position) {
            const pnl = (currentPrice - position.entryPrice) * (position.type === 'LONG' ? 1 : -1) * position.quantity;
            const priceChangePercent = pnl / (position.entryPrice * position.quantity); // P&L as percentage of invested amount

            const currentTime = Date.now();
            const timeElapsed = currentTime - position.entryTime;

            // Update trailing stop value
            if (position.type === 'LONG') {
                position.trailingStopValue = Math.max(position.trailingStopValue, currentPrice * (1 - TRAILING_STOP_PERCENT));
            } else { // SHORT
                position.trailingStopValue = Math.min(position.trailingStopValue, currentPrice * (1 + TRAILING_STOP_PERCENT));
            }

            // Determine the active stop loss (more protective of initial fixed or trailing)
            const activeStopLoss = (position.type === 'LONG')
                ? Math.max(position.initialStopLoss, position.trailingStopValue)
                : Math.min(position.initialStopLoss, position.trailingStopValue);

            if (priceChangePercent >= PROFIT_TARGET_PERCENT) {
                console.log(`[${position.type}] PROFIT TARGET HIT: $${pnl.toFixed(2)}`);
                showMessage(`PROFIT: $${pnl.toFixed(2)}`, 'info');
                closePosition('PROFIT');
            } else if (
                (position.type === 'LONG' && currentPrice <= activeStopLoss) ||
                (position.type === 'SHORT' && currentPrice >= activeStopLoss)
            ) {
                console.log(`[${position.type}] STOP LOSS HIT: $${pnl.toFixed(2)}`);
                showMessage(`STOP LOSS: $${pnl.toFixed(2)}`, 'error');
                closePosition('STOP_LOSS');
            } else if (timeElapsed >= POSITION_TIME_LIMIT_MS) {
                console.log(`[${position.type}] TIME LIMIT REACHED: $${pnl.toFixed(2)}`);
                showMessage(`TIME LIMIT: $${pnl.toFixed(2)}`, 'warning');
                closePosition('TIME_LIMIT');
            }
        }

        // --- Entry Logic ---
        if (!position) { // Only enter if no open position
            const momentum = calculateMomentum(priceHistory);

            if (momentum > MOMENTUM_THRESHOLD) {
                console.log(`MOMENTUM UP (${momentum.toFixed(6)}): Opening LONG position.`);
                openPosition('LONG');
            } else if (momentum < -MOMENTUM_THRESHOLD) {
                console.log(`MOMENTUM DOWN (${momentum.toFixed(6)}): Opening SHORT position.`);
                openPosition('SHORT');
            }
        }
    }

    /**
     * Opens a simulated trading position.
     * @param {'LONG'|'SHORT'} type - The type of position to open.
     */
    function openPosition(type) {
        if (position || currentPrice === 0) return; // Already in a position or no valid price

        const initialStopLossPrice = (type === 'LONG')
            ? currentPrice * (1 - STOP_LOSS_PERCENT)
            : currentPrice * (1 + STOP_LOSS_PERCENT);

        botStatus = 'POSITION_OPEN';
        position = {
            type: type,
            entryPrice: currentPrice,
            entryTime: Date.now(),
            quantity: BOT_QUANTITY,
            initialStopLoss: initialStopLossPrice, // Store the initial fixed stop loss
            trailingStopValue: initialStopLossPrice // Initialize trailing stop at initial fixed stop loss
        };
        console.log(`Position Opened: ${type} at $${currentPrice.toFixed(2)}`);
        showMessage(`OPENED ${type} at $${currentPrice.toFixed(2)}`);
        updateUI();
    }

    /**
     * Closes the current simulated trading position.
     * @param {string} status - The reason for closing the position (e.g., 'PROFIT', 'STOP_LOSS', 'MANUAL').
     */
    function closePosition(status = 'MANUAL') {
        if (!position) return; // No position to close

        const exitPrice = currentPrice;
        const pnl = (exitPrice - position.entryPrice) * (position.type === 'LONG' ? 1 : -1) * position.quantity;

        logTrade(position.type, position.entryPrice, exitPrice, pnl, status);

        position = null; // Clear current position
        botStatus = 'RUNNING'; // Go back to running state after closing
        console.log(`Position Closed: ${status}`);
        updateUI();
    }

    // --- Bot Control Functions ---

    /**
     * Starts the trading bot.
     */
    function startBot() {
        if (botStatus === 'RUNNING' || botStatus === 'POSITION_OPEN') {
            console.warn('Bot is already running.');
            showMessage('Bot is already running.', 'warning');
            return;
        }

        const targetNode = document.evaluate(TARGET_PRICE_XPATH, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (!targetNode) {
            console.error('Target price element not found using XPath:', TARGET_PRICE_XPATH);
            showMessage('ERROR: Price element not found. Check XPath.', 'error');
            return;
        }

        botStatus = 'RUNNING';
        console.log('Starting bot...');
        showMessage('Bot started successfully.');

        // Initialize MutationObserver
        priceObserver = new MutationObserver(handlePriceChange);
        priceObserver.observe(targetNode, {
            characterData: true,
            subtree: true,
            childList: true // Also observe child list for dynamic content updates
        });

        // Initial price reading
        currentPrice = parsePrice(targetNode.textContent);
        if (currentPrice > 0) {
            priceHistory.push(currentPrice);
        }

        // Start 1-minute OHLC update
        startOhlcUpdater();

        updateUI();
    }

    /**
     * Stops the trading bot.
     */
    function stopBot() {
        if (botStatus === 'STOPPED') {
            console.warn('Bot is already stopped.');
            showMessage('Bot is already stopped.', 'warning');
            return;
        }

        if (priceObserver) {
            priceObserver.disconnect();
            priceObserver = null;
        }
        clearInterval(ohlcInterval);
        ohlcInterval = null;

        botStatus = 'STOPPED';
        console.log('Bot stopped.');
        showMessage('Bot stopped.');
        updateUI();
    }

    /**
     * Calculates and stores 1-minute OHLC data.
     */
    let currentMinuteTicks = [];
    let lastOhlcTimestamp = 0;

    function startOhlcUpdater() {
        if (ohlcInterval) clearInterval(ohlcInterval); // Clear any existing interval

        ohlcInterval = setInterval(() => {
            if (currentMinuteTicks.length > 0) {
                const open = currentMinuteTicks[0];
                const close = currentMinuteTicks[currentMinuteTicks.length - 1];
                const high = Math.max(...currentMinuteTicks);
                const low = Math.min(...currentMinuteTicks);
                const timestamp = Date.now();

                ohlcData.push({ open, high, low, close, timestamp });
                if (ohlcData.length > 60) { // Keep last 60 minutes of OHLC
                    ohlcData.shift();
                }
                console.log(`OHLC 1-min: O:${open.toFixed(2)} H:${high.toFixed(2)} L:${low.toFixed(2)} C:${close.toFixed(2)}`);
                currentMinuteTicks = []; // Reset for next minute
            }
        }, OHLC_UPDATE_INTERVAL_MS);

        // Add current price to minute ticks whenever price changes
        // This is handled by handlePriceChange, which pushes to priceHistory.
        // We'll use the priceHistory to build currentMinuteTicks within the OHLC interval,
        // or just ensure that handlePriceChange adds to currentMinuteTicks if the minute is still the same.
        // A simpler approach: use a running array of ticks for the *current* minute.
        // Let's modify handlePriceChange to also populate currentMinuteTicks.

        // Corrected OHLC logic:
        // Instead of processing `priceHistory` in interval, `handlePriceChange` will feed `currentMinuteTicks`
        // and the interval will just process `currentMinuteTicks` and reset it.
    }


    // --- UI Creation and Injection ---

    /**
     * Creates and injects the UI overlay into the document body.
     */
    function createUIOverlay() {
        // Prevent multiple injections
        if (document.getElementById('bot-overlay')) {
            console.warn('Bot overlay already exists. Remove it first if you want to re-inject.');
            return;
        }

        overlayElement = document.createElement('div');
        overlayElement.id = 'bot-overlay';
        overlayElement.style.cssText = `
            position: fixed;
            top: 40px;
            right: 40px;
            width: 600px;
            background-color: rgba(0, 0, 0, 0.85);
            border: 1px solid #0f0;
            border-radius: 8px;
            color: lawngreen;
            font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
            font-size: 13px;
            padding: 15px;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
            z-index: 99999;
            resize: both; /* Allow resizing */
            overflow: auto; /* Enable scroll if content overflows */
            cursor: grab; /* Indicate draggable */
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        overlayElement.innerHTML = `
            <div id="bot-header" style="font-weight: bold; text-align: center; margin-bottom: 10px; cursor: move;">
                HFT Scalper Bot (Simulated) - powered by <a href="https://simul8or.com/" target="_blank" style="color:azure;">simul8or</a>
            </div>
            <div id="current-price-display">Current Price: $0.00</div>
            <div id="bot-status-display">Status: STOPPED</div>
            <div id="position-info-display">Position: None</div>
            <div id="pnl-stats-display">
                Total P&L: $0.00 <br>
                Trades: 0 (Wins: 0) <br>
                Win Rate: 0.00%
            </div>
            <div id="controls" style="display: flex; gap: 10px; margin-top: 10px;">
                <button id="start-bot-btn" style="flex: 1; padding: 8px; background-color: #005000; color: lawngreen; border: 1px solid #0f0; border-radius: 5px; cursor: pointer; font-family: inherit; font-size: inherit;">START</button>
                <button id="stop-bot-btn" style="flex: 1; padding: 8px; background-color: #500000; color: lightcoral; border: 1px solid #f00; border-radius: 5px; cursor: pointer; font-family: inherit; font-size: inherit;">STOP</button>
                <button id="close-position-btn" style="flex: 1; padding: 8px; background-color: #000050; color: lightblue; border: 1px solid #00f; border-radius: 5px; cursor: pointer; font-family: inherit; font-size: inherit;">CLOSE</button>
            </div>
            <div id="trade-log-container" style="max-height: 150px; overflow-y: auto; border: 1px solid #333; padding: 8px; border-radius: 5px; background-color: #111;">
                <span style="color: #666;">Trade Log:</span><br>
                <div id="trade-log-display"></div>
            </div>
        `;

        document.body.appendChild(overlayElement);

        // Get references to UI elements
        currentPriceDisplay = overlayElement.querySelector('#current-price-display');
        botStatusDisplay = overlayElement.querySelector('#bot-status-display');
        positionInfoDisplay = overlayElement.querySelector('#position-info-display');
        pnlStatsDisplay = overlayElement.querySelector('#pnl-stats-display');
        tradeLogDisplay = overlayElement.querySelector('#trade-log-display');
        startButton = overlayElement.querySelector('#start-bot-btn');
        stopButton = overlayElement.querySelector('#stop-bot-btn');
        closeButton = overlayElement.querySelector('#close-position-btn');

        // Attach event listeners to buttons
        startButton.addEventListener('click', startBot);
        stopButton.addEventListener('click', stopBot);
        closeButton.addEventListener('click', closePosition);

        // --- Make the overlay draggable ---
        let isDragging = false;
        let offsetX, offsetY;

        overlayElement.querySelector('#bot-header').addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - overlayElement.getBoundingClientRect().left;
            offsetY = e.clientY - overlayElement.getBoundingClientRect().top;
            overlayElement.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent text selection during drag
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            overlayElement.style.left = (e.clientX - offsetX) + 'px';
            overlayElement.style.top = (e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            overlayElement.style.cursor = 'grab';
        });

        updateUI(); // Initialize UI display
    }

    // --- Main Execution ---
    // Ensure the DOM is fully loaded before creating the UI.
    // Injected scripts usually run after DOMContentLoaded, but a safety check is good.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createUIOverlay);
    } else {
        createUIOverlay();
    }

    // This ensures that the currentMinuteTicks array gets populated for OHLC calculation.
    // The handlePriceChange function is responsible for adding new prices to `priceHistory`.
    // For OHLC, we need to gather all ticks within a single minute.
    // Let's modify handlePriceChange to also contribute to currentMinuteTicks
    // and the OHLC interval will consume and reset `currentMinuteTicks`.
    const originalHandlePriceChange = handlePriceChange;
    handlePriceChange = function(mutationsList) {
        const previousCurrentPrice = currentPrice;
        originalHandlePriceChange(mutationsList); // Call original to update currentPrice and priceHistory

        // If price actually changed and we are in RUNNING/POSITION_OPEN state
        if (currentPrice > 0 && currentPrice !== previousCurrentPrice && (botStatus === 'RUNNING' || botStatus === 'POSITION_OPEN')) {
            const now = new Date();
            // If it's a new minute since the last OHLC processing (or first tick)
            // Or if currentMinuteTicks is empty and it's the start of a new minute period.
            if (currentMinuteTicks.length === 0 || (now.getTime() - lastOhlcTimestamp) >= OHLC_UPDATE_INTERVAL_MS) {
                 // It's a new minute period, clear past ticks for new OHLC bar
                 currentMinuteTicks = [];
                 lastOhlcTimestamp = now.getTime(); // Update the timestamp of the last OHLC bar start
            }
            currentMinuteTicks.push(currentPrice);
        }
    };

})();
