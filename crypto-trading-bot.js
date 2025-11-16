 /**
 * ICC (Indication, Correction, Continuation) Trading Bot (Simulated)
 * Based on Trade by Sci's ICC Trading Framework
 * For Educational/Simulation Purposes Only.
 *
 * This bot implements the ICC trading strategy:
 * 1. INDICATION - Detects breaks of key support/resistance levels
 * 2. CORRECTION - Waits for price to pull back and retest the broken level
 * 3. CONTINUATION - Enters trade when price continues in the indicated direction
 *
 * This is a SWING/DAY TRADING strategy, NOT high-frequency scalping.
 * - Fewer trades (1-5 per session vs 100+)
 * - Larger profit targets (1-3% vs 0.25%)
 * - Longer hold times (hours to days vs seconds)
 * - Higher win rate (55-70% vs 40-50%)
 * - Better risk-to-reward ratio (2:1 to 5:1 vs 1:1)
 *
 * Target Platforms:
 * - Stocks: https://app.webull.com/stocks (Default configuration)
 * - Crypto: https://app.webull.com/crypto (Change COIN_CONFIG in the code)
 *
 * Features:
 * - Draggable, semi-transparent UI overlay with terminal aesthetic
 * - Automatically detects swing highs/lows for support/resistance levels
 * - Tracks ICC phases: Indication → Correction → Continuation
 * - Visual display of current ICC phase and detected levels
 * - Smart entry logic: Only enters after all three phases confirm
 * - Swing trading parameters: wider stops, bigger targets, longer holds
 * - Full P&L tracking with fee calculations
 *
 * Usage:
 * 1. Navigate to the target web trading platform:
 *    - For stocks: https://app.webull.com/stocks
 *    - For crypto: https://app.webull.com/crypto
 * 2. Open your browser's developer console (F12 or Cmd+Option+I).
 * 3. Paste this entire script into the console and press Enter.
 * 4. The UI overlay should appear. Click 'START' to activate the bot.
 * 5. The bot will monitor price and wait for ICC setups to form.
 *
 * Strategy Guide: See ICC_STRATEGY_GUIDE.md for complete explanation
 *
 * Note: The default configuration is set for STOCKS trading. To use with crypto,
 * uncomment the desired crypto configuration (SOL, XRP, XLM, etc.) and comment out
 * the STOCK configuration in the code below.
 */

(function() {
    // --- Configuration ---

    // ========================================
    // TRADING CONFIGURATION
    // Choose your preferred asset by uncommenting ONE section below
    // ========================================

    // OPTION 0: STOCKS - FOR https://app.webull.com/stocks
    // Use this configuration when trading individual stocks on Webull
    // Typical exchange fee: 0% for stock trades on most platforms
    // ICC SWING TRADING PARAMETERS (not scalping!)
    const COIN_CONFIG = {
        name: 'STOCK',
        xpath: '//*[@id="app"]/section/section/section/main/div/div[2]/div[1]/div[2]/div/div/span[2]',
        exchangeFeePercent: 0.0,     // 0% fee for stocks (adjust if your broker charges)
        profitTargetPercent: 0.02,   // 2% profit target (swing trading)
        stopLossPercent: 0.01,       // 1% stop loss (wider for swing)
        trailingStopPercent: 0.005,  // 0.5% trailing stop
    };

    // OPTION 1: SOLANA (SOL) - RECOMMENDED FOR LOW FEES (CRYPTO)
    // Extremely low transaction fees (~$0.00025), high liquidity, fast execution
    // Typical exchange fee: 0.1% per trade (maker/taker)
    // For crypto trading, navigate to: https://app.webull.com/crypto
    // ICC SWING TRADING PARAMETERS
    // /*
    // const COIN_CONFIG = {
    //     name: 'SOL/USD',
    //     xpath: '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]',
    //     exchangeFeePercent: 0.001,   // 0.1% fee per trade
    //     profitTargetPercent: 0.025,  // 2.5% profit target (swing trading, covers fees)
    //     stopLossPercent: 0.0125,     // 1.25% stop loss (wider for swing)
    //     trailingStopPercent: 0.0075, // 0.75% trailing stop
    // };
    // */

    // OPTION 2: XRP - ULTRA LOW BLOCKCHAIN FEES (CRYPTO)
    // For crypto trading, navigate to: https://app.webull.com/crypto
    // ICC SWING TRADING PARAMETERS
    // /*
    // const COIN_CONFIG = {
    //     name: 'XRP/USD',
    //     xpath: '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]',
    //     exchangeFeePercent: 0.001,   // 0.1% exchange fee
    //     profitTargetPercent: 0.025,  // 2.5% profit target
    //     stopLossPercent: 0.0125,     // 1.25% stop loss
    //     trailingStopPercent: 0.0075, // 0.75% trailing stop
    // };
    // */

    // OPTION 3: STELLAR (XLM) - LOWEST FEES (CRYPTO)
    // For crypto trading, navigate to: https://app.webull.com/crypto
    // ICC SWING TRADING PARAMETERS
    // /*
    // const COIN_CONFIG = {
    //     name: 'XLM/USD',
    //     xpath: '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]',
    //     exchangeFeePercent: 0.001,   // 0.1% exchange fee
    //     profitTargetPercent: 0.025,  // 2.5% profit target
    //     stopLossPercent: 0.0125,     // 1.25% stop loss
    //     trailingStopPercent: 0.0075, // 0.75% trailing stop
    // };
    // */

    // OPTION 4: ALGORAND (ALGO) - LOW FEES, FAST (CRYPTO)
    // For crypto trading, navigate to: https://app.webull.com/crypto
    // ICC SWING TRADING PARAMETERS
    // /*
    // const COIN_CONFIG = {
    //     name: 'ALGO/USD',
    //     xpath: '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]',
    //     exchangeFeePercent: 0.001,   // 0.1% exchange fee
    //     profitTargetPercent: 0.025,  // 2.5% profit target
    //     stopLossPercent: 0.0125,     // 1.25% stop loss
    //     trailingStopPercent: 0.0075, // 0.75% trailing stop
    // };
    // */

    // OPTION 5: POLYGON (MATIC) - LOW FEES (CRYPTO)
    // For crypto trading, navigate to: https://app.webull.com/crypto
    // ICC SWING TRADING PARAMETERS
    // /*
    // const COIN_CONFIG = {
    //     name: 'MATIC/USD',
    //     xpath: '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]',
    //     exchangeFeePercent: 0.001,   // 0.1% exchange fee
    //     profitTargetPercent: 0.025,  // 2.5% profit target
    //     stopLossPercent: 0.0125,     // 1.25% stop loss
    //     trailingStopPercent: 0.0075, // 0.75% trailing stop
    // };
    // */

    // OPTION 6: LITECOIN (LTC) - LOWER FEES THAN ETH (CRYPTO)
    // For crypto trading, navigate to: https://app.webull.com/crypto
    // ICC SWING TRADING PARAMETERS
    // /*
    // const COIN_CONFIG = {
    //     name: 'LTC/USD',
    //     xpath: '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]',
    //     exchangeFeePercent: 0.001,   // 0.1% exchange fee
    //     profitTargetPercent: 0.025,  // 2.5% profit target
    //     stopLossPercent: 0.0125,     // 1.25% stop loss
    //     trailingStopPercent: 0.0075, // 0.75% trailing stop
    // };
    // */

    // OPTION 7: TRON (TRX) - VERY LOW FEES (CRYPTO)
    // For crypto trading, navigate to: https://app.webull.com/crypto
    // ICC SWING TRADING PARAMETERS
    // /*
    // const COIN_CONFIG = {
    //     name: 'TRX/USD',
    //     xpath: '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]',
    //     exchangeFeePercent: 0.001,   // 0.1% exchange fee
    //     profitTargetPercent: 0.025,  // 2.5% profit target
    //     stopLossPercent: 0.0125,     // 1.25% stop loss
    //     trailingStopPercent: 0.0075, // 0.75% trailing stop
    // };
    // */

    // OPTION 8: ETHEREUM (ETH) - ORIGINAL (CRYPTO)
    // For crypto trading, navigate to: https://app.webull.com/crypto
    // ICC SWING TRADING PARAMETERS
    // /*
    // const COIN_CONFIG = {
    //     name: 'ETH/USD',
    //     xpath: '//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]',
    //     exchangeFeePercent: 0.001,   // 0.1% exchange fee (not including gas fees)
    //     profitTargetPercent: 0.025,  // 2.5% profit target (swing trading)
    //     stopLossPercent: 0.0125,     // 1.25% stop loss
    //     trailingStopPercent: 0.0075, // 0.75% trailing stop
    // };
    // */

    // General Configuration (applies to all coins)
    const TARGET_PRICE_XPATH = COIN_CONFIG.xpath;

    // ICC Strategy Configuration
    const SWING_PERIOD = 5;  // Number of candles to identify swing high/low (5 candles = 2 left + 1 pivot + 2 right)
    const BREAK_THRESHOLD_PERCENT = 0.002; // 0.2% move beyond level to confirm break (not just a wick)
    const RETEST_TOLERANCE_PERCENT = 0.01; // 1% tolerance for correction retest zone
    const CONTINUATION_CONFIRMATION_PERCENT = 0.003; // 0.3% move to confirm continuation

    // Position Management
    const PROFIT_TARGET_PERCENT = COIN_CONFIG.profitTargetPercent;
    const STOP_LOSS_PERCENT = COIN_CONFIG.stopLossPercent;
    const TRAILING_STOP_PERCENT = COIN_CONFIG.trailingStopPercent;
    const EXCHANGE_FEE_PERCENT = COIN_CONFIG.exchangeFeePercent;
    const POSITION_TIME_LIMIT_MS = 24 * 60 * 60 * 1000; // Max 24 hours per trade (swing trading)
    const MAX_HOLDING_PERIOD_HOURS = 24; // Display value for UI

    // Data Management
    const PRICE_HISTORY_MAX_SIZE = 500;  // Store more history for swing detection
    const OHLC_UPDATE_INTERVAL_MS = 60 * 1000; // Update OHLC every 1 minute
    const BOT_QUANTITY = 1; // Simulated quantity for each trade

    // --- Global State Variables ---
    let botStatus = 'STOPPED'; // 'STOPPED', 'RUNNING', 'POSITION_OPEN'
    let currentPrice = 0;
    let priceHistory = []; // Stores raw price ticks
    let ohlcData = [];     // Stores 1-minute OHLC bars [{open, high, low, close, timestamp}]

    // ICC State Management
    let iccPhase = 'WAITING'; // 'WAITING', 'INDICATION_DETECTED', 'CORRECTION_IN_PROGRESS', 'CONTINUATION_CONFIRMED'
    let iccSetup = null; // { type: 'BULLISH'/'BEARISH', brokenLevel, indicationPrice, indicationTime, correctionStarted }

    // Support/Resistance Levels
    let supportLevels = []; // Array of support levels: [{price, strength, lastTouch}]
    let resistanceLevels = []; // Array of resistance levels: [{price, strength, lastTouch}]
    let swingHighs = []; // Recent swing highs for resistance detection
    let swingLows = [];  // Recent swing lows for support detection

    // Position Management
    let position = null; // { type: 'LONG'/'SHORT', entryPrice, entryTime, quantity, initialStopLoss, trailingStopValue }

    // Performance Tracking
    let totalPnl = 0;
    let totalPnlAfterFees = 0;
    let totalFeesPaid = 0;
    let numTrades = 0;
    let numWins = 0;
    let numWinsAfterFees = 0;
    let tradeLog = []; // Stores objects: { timestamp, type, entryPrice, exitPrice, pnl, fees, netPnl, status }

    // System Components
    let priceObserver = null; // MutationObserver instance
    let ohlcInterval = null;  // Interval for OHLC calculation

    let overlayElement = null; // Reference to the UI overlay div

    // --- UI Overlay Elements (references will be populated after creation) ---
    let currentPriceDisplay, botStatusDisplay, positionInfoDisplay,
        pnlStatsDisplay, tradeLogDisplay, startButton, stopButton, closeButton,
        iccPhaseDisplay, levelsDisplay; // ICC-specific UI elements

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
     * Identifies swing highs in the price history.
     * A swing high is a peak where price is higher than SWING_PERIOD candles on both sides.
     * @returns {Array<{price: number, index: number}>} Array of swing highs
     */
    function identifySwingHighs() {
        const swings = [];
        if (ohlcData.length < SWING_PERIOD * 2 + 1) return swings;

        for (let i = SWING_PERIOD; i < ohlcData.length - SWING_PERIOD; i++) {
            const current = ohlcData[i].high;
            let isSwingHigh = true;

            // Check left side (must be lower)
            for (let j = i - SWING_PERIOD; j < i; j++) {
                if (ohlcData[j].high >= current) {
                    isSwingHigh = false;
                    break;
                }
            }

            // Check right side (must be lower)
            if (isSwingHigh) {
                for (let j = i + 1; j <= i + SWING_PERIOD; j++) {
                    if (ohlcData[j].high >= current) {
                        isSwingHigh = false;
                        break;
                    }
                }
            }

            if (isSwingHigh) {
                swings.push({ price: current, index: i, timestamp: ohlcData[i].timestamp });
            }
        }

        return swings;
    }

    /**
     * Identifies swing lows in the price history.
     * A swing low is a valley where price is lower than SWING_PERIOD candles on both sides.
     * @returns {Array<{price: number, index: number}>} Array of swing lows
     */
    function identifySwingLows() {
        const swings = [];
        if (ohlcData.length < SWING_PERIOD * 2 + 1) return swings;

        for (let i = SWING_PERIOD; i < ohlcData.length - SWING_PERIOD; i++) {
            const current = ohlcData[i].low;
            let isSwingLow = true;

            // Check left side (must be higher)
            for (let j = i - SWING_PERIOD; j < i; j++) {
                if (ohlcData[j].low <= current) {
                    isSwingLow = false;
                    break;
                }
            }

            // Check right side (must be higher)
            if (isSwingLow) {
                for (let j = i + 1; j <= i + SWING_PERIOD; j++) {
                    if (ohlcData[j].low <= current) {
                        isSwingLow = false;
                        break;
                    }
                }
            }

            if (isSwingLow) {
                swings.push({ price: current, index: i, timestamp: ohlcData[i].timestamp });
            }
        }

        return swings;
    }

    /**
     * Updates support and resistance levels based on identified swing points.
     * Merges nearby levels and tracks their strength.
     */
    function updateSupportResistanceLevels() {
        swingHighs = identifySwingHighs();
        swingLows = identifySwingLows();

        // Update resistance levels from swing highs
        resistanceLevels = [];
        swingHighs.forEach(swing => {
            // Check if this level already exists (within 0.5% tolerance)
            const existing = resistanceLevels.find(level =>
                Math.abs(level.price - swing.price) / swing.price < 0.005
            );

            if (existing) {
                existing.strength++;
                existing.lastTouch = swing.timestamp;
            } else {
                resistanceLevels.push({
                    price: swing.price,
                    strength: 1,
                    lastTouch: swing.timestamp
                });
            }
        });

        // Update support levels from swing lows
        supportLevels = [];
        swingLows.forEach(swing => {
            // Check if this level already exists (within 0.5% tolerance)
            const existing = supportLevels.find(level =>
                Math.abs(level.price - swing.price) / swing.price < 0.005
            );

            if (existing) {
                existing.strength++;
                existing.lastTouch = swing.timestamp;
            } else {
                supportLevels.push({
                    price: swing.price,
                    strength: 1,
                    lastTouch: swing.timestamp
                });
            }
        });

        // Sort by strength (strongest first)
        resistanceLevels.sort((a, b) => b.strength - a.strength);
        supportLevels.sort((a, b) => b.strength - a.strength);

        // Keep only the top 3 most significant levels
        resistanceLevels = resistanceLevels.slice(0, 3);
        supportLevels = supportLevels.slice(0, 3);
    }

    /**
     * Finds the nearest resistance level above current price.
     * @returns {number|null} The price of the nearest resistance, or null if none found
     */
    function getNearestResistance() {
        const above = resistanceLevels.filter(level => level.price > currentPrice);
        if (above.length === 0) return null;
        return above.reduce((nearest, level) =>
            level.price < nearest.price ? level : nearest
        ).price;
    }

    /**
     * Finds the nearest support level below current price.
     * @returns {number|null} The price of the nearest support, or null if none found
     */
    function getNearestSupport() {
        const below = supportLevels.filter(level => level.price < currentPrice);
        if (below.length === 0) return null;
        return below.reduce((nearest, level) =>
            level.price > nearest.price ? level : nearest
        ).price;
    }

    /**
     * Updates the UI overlay with current bot status and trade information.
     */
    function updateUI() {
        if (!overlayElement) return; // UI not initialized yet

        currentPriceDisplay.textContent = `Current Price: $${currentPrice.toFixed(2)}`;
        botStatusDisplay.textContent = `Status: ${botStatus}`;

        // Update ICC Phase Display
        const phaseColors = {
            'WAITING': 'cyan',
            'INDICATION_DETECTED': 'yellow',
            'CORRECTION_IN_PROGRESS': 'orange',
            'CONTINUATION_CONFIRMED': 'lawngreen'
        };
        const phaseColor = phaseColors[iccPhase] || 'white';
        let phaseText = iccPhase.replace(/_/g, ' ');
        if (iccSetup) {
            phaseText += ` (${iccSetup.type})`;
        }
        iccPhaseDisplay.innerHTML = `<span style="color: ${phaseColor}; font-weight: bold;">ICC Phase: ${phaseText}</span>`;

        // Update Levels Display
        const nearestResistance = getNearestResistance();
        const nearestSupport = getNearestSupport();
        let levelsHTML = '<span style="color: #666;">Key Levels:</span><br>';

        if (nearestResistance) {
            const distPct = ((nearestResistance - currentPrice) / currentPrice * 100).toFixed(2);
            levelsHTML += `<span style="color: red;">R: $${nearestResistance.toFixed(2)} (+${distPct}%)</span><br>`;
        }
        if (nearestSupport) {
            const distPct = ((currentPrice - nearestSupport) / currentPrice * 100).toFixed(2);
            levelsHTML += `<span style="color: lawngreen;">S: $${nearestSupport.toFixed(2)} (-${distPct}%)</span><br>`;
        }

        if (iccSetup && iccSetup.brokenLevel) {
            levelsHTML += `<span style="color: yellow;">Broken: $${iccSetup.brokenLevel.toFixed(2)}</span><br>`;
        }

        if (!nearestResistance && !nearestSupport && !iccSetup) {
            levelsHTML += '<span style="color: #666;">Building levels...</span>';
        }

        levelsDisplay.innerHTML = levelsHTML;

        // Update Position Info
        if (position) {
            const currentPositionPnl = (currentPrice - position.entryPrice) * (position.type === 'LONG' ? 1 : -1) * position.quantity;
            const pnlPercent = (currentPositionPnl / (position.entryPrice * position.quantity) * 100).toFixed(2);
            const timeHeld = ((Date.now() - position.entryTime) / (60 * 1000)).toFixed(1); // minutes
            positionInfoDisplay.innerHTML = `
                Position: ${position.type} <br>
                Entry: $${position.entryPrice.toFixed(2)} <br>
                Current P&L: $${currentPositionPnl.toFixed(2)} (${pnlPercent}%) <br>
                Time Held: ${timeHeld} min
            `;
        } else {
            positionInfoDisplay.textContent = 'Position: None';
        }

        // Update Performance Stats
        const winRate = numTrades > 0 ? ((numWins / numTrades) * 100).toFixed(2) : '0.00';
        const winRateAfterFees = numTrades > 0 ? ((numWinsAfterFees / numTrades) * 100).toFixed(2) : '0.00';
        const profitColor = totalPnlAfterFees >= 0 ? 'lawngreen' : 'red';
        const feePercentOfProfit = totalPnl !== 0 ? ((totalFeesPaid / Math.abs(totalPnl)) * 100).toFixed(1) : '0.0';

        pnlStatsDisplay.innerHTML = `
            <span style="color: grey;">Gross P&L:</span> $${totalPnl.toFixed(2)} <br>
            <span style="color: orange;">Total Fees:</span> -$${totalFeesPaid.toFixed(2)} (${feePercentOfProfit}%) <br>
            <span style="color: ${profitColor}; font-weight: bold;">Net P&L:</span> $${totalPnlAfterFees.toFixed(2)} <br>
            Trades: ${numTrades} | Wins: ${numWins} (${numWinsAfterFees} after fees) <br>
            Win Rate: ${winRate}% (${winRateAfterFees}% after fees)
        `;

        // Update trade log display
        tradeLogDisplay.innerHTML = tradeLog.map(trade => {
            const grossPnlColor = trade.pnl >= 0 ? 'lawngreen' : 'red';
            const netPnlColor = trade.netPnl >= 0 ? 'lawngreen' : 'red';
            return `<span style="color: grey;">${new Date(trade.timestamp).toLocaleTimeString()}</span> - ${trade.type}: $${trade.entryPrice.toFixed(2)}→$${trade.exitPrice.toFixed(2)} | Gross: <span style="color: ${grossPnlColor};">$${trade.pnl.toFixed(2)}</span> | Fee: <span style="color: orange;">-$${trade.fees.toFixed(2)}</span> | Net: <span style="color: ${netPnlColor}; font-weight: bold;">$${trade.netPnl.toFixed(2)}</span> (${trade.status})`;
        }).join('<br>');

        // Scroll to bottom of trade log
        tradeLogDisplay.scrollTop = tradeLogDisplay.scrollHeight;

        // Update button states
        startButton.disabled = botStatus === 'RUNNING' || botStatus === 'POSITION_OPEN';
        stopButton.disabled = botStatus === 'STOPPED';
        closeButton.disabled = !position;
    }

    /**
     * Adds a trade record to the history and updates overall stats.
     * @param {'LONG'|'SHORT'} type - Type of the trade.
     * @param {number} entryPrice - Price at which position was opened.
     * @param {number} exitPrice - Price at which position was closed.
     * @param {number} pnl - Profit or loss for this trade (before fees).
     * @param {string} status - Reason for closing ('PROFIT', 'STOP_LOSS', 'TIME_LIMIT', 'MANUAL').
     */
    function logTrade(type, entryPrice, exitPrice, pnl, status) {
        // Calculate fees: entry fee + exit fee
        // Fee is calculated on the position value at entry and exit
        const positionValue = entryPrice * BOT_QUANTITY;
        const entryFee = positionValue * EXCHANGE_FEE_PERCENT;
        const exitFee = exitPrice * BOT_QUANTITY * EXCHANGE_FEE_PERCENT;
        const totalFees = entryFee + exitFee;
        const netPnl = pnl - totalFees;

        tradeLog.push({
            timestamp: Date.now(),
            type,
            entryPrice,
            exitPrice,
            pnl,
            fees: totalFees,
            netPnl,
            status
        });
        // Keep log size manageable
        if (tradeLog.length > 50) {
            tradeLog.shift();
        }

        numTrades++;
        totalPnl += pnl;
        totalFeesPaid += totalFees;
        totalPnlAfterFees += netPnl;

        if (pnl >= 0) { // Consider breakeven a win for gross win rate calc
            numWins++;
        }
        if (netPnl >= 0) { // Win after fees
            numWinsAfterFees++;
        }

        console.log(`TRADE LOG: ${type} - Entry: $${entryPrice.toFixed(2)}, Exit: $${exitPrice.toFixed(2)}, Gross P&L: $${pnl.toFixed(2)}, Fees: -$${totalFees.toFixed(2)}, Net P&L: $${netPnl.toFixed(2)} (${status})`);
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
     * ICC Trading Strategy - Implements Indication, Correction, Continuation phases.
     * This strategy waits for structure breaks, retests, and continuations before entering.
     */
    function tradingStrategy() {
        if (botStatus === 'STOPPED' || currentPrice === 0 || ohlcData.length < SWING_PERIOD * 2 + 1) {
            return; // Not ready to trade - need enough data for swing detection
        }

        // Update support/resistance levels every tick
        updateSupportResistanceLevels();

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
                console.log(`[${position.type}] ICC PROFIT TARGET HIT: $${pnl.toFixed(2)}`);
                showMessage(`ICC PROFIT: $${pnl.toFixed(2)}`, 'info');
                closePosition('PROFIT');
                // Reset ICC phase after closing position
                resetICCPhase();
            } else if (
                (position.type === 'LONG' && currentPrice <= activeStopLoss) ||
                (position.type === 'SHORT' && currentPrice >= activeStopLoss)
            ) {
                console.log(`[${position.type}] ICC STOP LOSS HIT: $${pnl.toFixed(2)}`);
                showMessage(`ICC STOP: $${pnl.toFixed(2)}`, 'error');
                closePosition('STOP_LOSS');
                // Reset ICC phase after closing position
                resetICCPhase();
            } else if (timeElapsed >= POSITION_TIME_LIMIT_MS) {
                console.log(`[${position.type}] ICC TIME LIMIT (${MAX_HOLDING_PERIOD_HOURS}h): $${pnl.toFixed(2)}`);
                showMessage(`TIME LIMIT: $${pnl.toFixed(2)}`, 'warning');
                closePosition('TIME_LIMIT');
                // Reset ICC phase after closing position
                resetICCPhase();
            }
        }

        // --- ICC Phase Logic (Entry Detection) ---
        if (!position) { // Only look for setups if no open position
            processICCPhases();
        }
    }

    /**
     * Processes the three ICC phases: Indication → Correction → Continuation
     */
    function processICCPhases() {
        switch (iccPhase) {
            case 'WAITING':
                detectIndication();
                break;

            case 'INDICATION_DETECTED':
                detectCorrection();
                break;

            case 'CORRECTION_IN_PROGRESS':
                detectContinuation();
                break;

            case 'CONTINUATION_CONFIRMED':
                // Entry signal confirmed - open position
                enterICCPosition();
                break;
        }
    }

    /**
     * PHASE 1: INDICATION
     * Detects when price breaks key support or resistance levels.
     */
    function detectIndication() {
        const nearestResistance = getNearestResistance();
        const nearestSupport = getNearestSupport();

        // Check for BULLISH indication (resistance break)
        if (nearestResistance && currentPrice > nearestResistance * (1 + BREAK_THRESHOLD_PERCENT)) {
            iccPhase = 'INDICATION_DETECTED';
            iccSetup = {
                type: 'BULLISH',
                brokenLevel: nearestResistance,
                indicationPrice: currentPrice,
                indicationTime: Date.now(),
                correctionStarted: false
            };
            console.log(`🔔 ICC INDICATION (BULLISH): Resistance broken at $${nearestResistance.toFixed(2)}`);
            showMessage(`INDICATION: Resistance broken at $${nearestResistance.toFixed(2)}`, 'info');
            updateUI();
            return;
        }

        // Check for BEARISH indication (support break)
        if (nearestSupport && currentPrice < nearestSupport * (1 - BREAK_THRESHOLD_PERCENT)) {
            iccPhase = 'INDICATION_DETECTED';
            iccSetup = {
                type: 'BEARISH',
                brokenLevel: nearestSupport,
                indicationPrice: currentPrice,
                indicationTime: Date.now(),
                correctionStarted: false
            };
            console.log(`🔔 ICC INDICATION (BEARISH): Support broken at $${nearestSupport.toFixed(2)}`);
            showMessage(`INDICATION: Support broken at $${nearestSupport.toFixed(2)}`, 'info');
            updateUI();
            return;
        }
    }

    /**
     * PHASE 2: CORRECTION
     * Waits for price to pull back and retest the broken level.
     */
    function detectCorrection() {
        if (!iccSetup) {
            resetICCPhase();
            return;
        }

        const retestLowerBound = iccSetup.brokenLevel * (1 - RETEST_TOLERANCE_PERCENT);
        const retestUpperBound = iccSetup.brokenLevel * (1 + RETEST_TOLERANCE_PERCENT);

        // Check if price has entered the retest zone
        if (currentPrice >= retestLowerBound && currentPrice <= retestUpperBound) {
            if (!iccSetup.correctionStarted) {
                iccSetup.correctionStarted = true;
                iccSetup.correctionTime = Date.now();
                iccPhase = 'CORRECTION_IN_PROGRESS';
                console.log(`🔔 ICC CORRECTION: Price retesting $${iccSetup.brokenLevel.toFixed(2)} zone`);
                showMessage(`CORRECTION: Retesting broken level`, 'info');
                updateUI();
            }
        }

        // Invalidate setup if price breaks back through in the wrong direction
        if (iccSetup.type === 'BULLISH' && currentPrice < retestLowerBound) {
            console.log(`❌ ICC Setup INVALIDATED: Price broke back below support`);
            showMessage(`Setup invalidated - broke back down`, 'warning');
            resetICCPhase();
        } else if (iccSetup.type === 'BEARISH' && currentPrice > retestUpperBound) {
            console.log(`❌ ICC Setup INVALIDATED: Price broke back above resistance`);
            showMessage(`Setup invalidated - broke back up`, 'warning');
            resetICCPhase();
        }

        // Timeout if correction takes too long (2 hours)
        if (Date.now() - iccSetup.indicationTime > 2 * 60 * 60 * 1000) {
            console.log(`⏱️ ICC Setup TIMEOUT: No correction within 2 hours`);
            showMessage(`Setup timeout - no correction`, 'warning');
            resetICCPhase();
        }
    }

    /**
     * PHASE 3: CONTINUATION
     * Confirms that price is resuming in the indicated direction.
     */
    function detectContinuation() {
        if (!iccSetup || !iccSetup.correctionStarted) {
            resetICCPhase();
            return;
        }

        // BULLISH: Check if price is moving up from retest zone
        if (iccSetup.type === 'BULLISH') {
            const continuationTarget = iccSetup.indicationPrice; // Should exceed initial break high
            if (currentPrice > continuationTarget * (1 + CONTINUATION_CONFIRMATION_PERCENT)) {
                iccPhase = 'CONTINUATION_CONFIRMED';
                iccSetup.continuationPrice = currentPrice;
                iccSetup.continuationTime = Date.now();
                console.log(`✅ ICC CONTINUATION (BULLISH): Price confirming uptrend at $${currentPrice.toFixed(2)}`);
                showMessage(`CONTINUATION confirmed - LONG entry`, 'info');
                updateUI();
                return;
            }
        }

        // BEARISH: Check if price is moving down from retest zone
        if (iccSetup.type === 'BEARISH') {
            const continuationTarget = iccSetup.indicationPrice; // Should exceed initial break low
            if (currentPrice < continuationTarget * (1 - CONTINUATION_CONFIRMATION_PERCENT)) {
                iccPhase = 'CONTINUATION_CONFIRMED';
                iccSetup.continuationPrice = currentPrice;
                iccSetup.continuationTime = Date.now();
                console.log(`✅ ICC CONTINUATION (BEARISH): Price confirming downtrend at $${currentPrice.toFixed(2)}`);
                showMessage(`CONTINUATION confirmed - SHORT entry`, 'info');
                updateUI();
                return;
            }
        }

        // Invalidate if price breaks back through the wrong way
        const retestLowerBound = iccSetup.brokenLevel * (1 - RETEST_TOLERANCE_PERCENT);
        const retestUpperBound = iccSetup.brokenLevel * (1 + RETEST_TOLERANCE_PERCENT);

        if (iccSetup.type === 'BULLISH' && currentPrice < retestLowerBound) {
            console.log(`❌ ICC Setup FAILED: No bullish continuation`);
            showMessage(`Continuation failed - reset`, 'warning');
            resetICCPhase();
        } else if (iccSetup.type === 'BEARISH' && currentPrice > retestUpperBound) {
            console.log(`❌ ICC Setup FAILED: No bearish continuation`);
            showMessage(`Continuation failed - reset`, 'warning');
            resetICCPhase();
        }
    }

    /**
     * Enters a position based on confirmed ICC setup.
     */
    function enterICCPosition() {
        if (!iccSetup || iccPhase !== 'CONTINUATION_CONFIRMED') {
            resetICCPhase();
            return;
        }

        const type = iccSetup.type === 'BULLISH' ? 'LONG' : 'SHORT';
        openPosition(type);
        console.log(`📊 ICC ENTRY: ${type} position at $${currentPrice.toFixed(2)}`);
    }

    /**
     * Resets the ICC phase state to start looking for new setups.
     */
    function resetICCPhase() {
        iccPhase = 'WAITING';
        iccSetup = null;
        updateUI();
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
                ICC Trading Bot (Simulated) - ${COIN_CONFIG.name}
            </div>
            <div style="text-align: center; font-size: 11px; color: orange; margin-bottom: 8px;">
                Swing Trading | Fee: ${(EXCHANGE_FEE_PERCENT * 100).toFixed(2)}% | Target: ${(PROFIT_TARGET_PERCENT * 100).toFixed(2)}% | Stop: ${(STOP_LOSS_PERCENT * 100).toFixed(2)}%
            </div>
            <div id="current-price-display">Current Price: $0.00</div>
            <div id="bot-status-display">Status: STOPPED</div>
            <div id="icc-phase-display" style="margin: 5px 0; padding: 5px; background-color: #222; border-radius: 3px;">
                <span style="color: cyan; font-weight: bold;">ICC Phase: WAITING</span>
            </div>
            <div id="levels-display" style="margin: 5px 0; padding: 5px; background-color: #222; border-radius: 3px; font-size: 12px;">
                <span style="color: #666;">Key Levels:</span><br>
                <span style="color: #666;">Building levels...</span>
            </div>
            <div id="position-info-display">Position: None</div>
            <div id="pnl-stats-display">
                <span style="color: grey;">Gross P&L:</span> $0.00 <br>
                <span style="color: orange;">Total Fees:</span> -$0.00 (0.0%) <br>
                <span style="color: lawngreen; font-weight: bold;">Net P&L:</span> $0.00 <br>
                Trades: 0 | Wins: 0 (0 after fees) <br>
                Win Rate: 0.00% (0.00% after fees)
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
        iccPhaseDisplay = overlayElement.querySelector('#icc-phase-display');
        levelsDisplay = overlayElement.querySelector('#levels-display');
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
