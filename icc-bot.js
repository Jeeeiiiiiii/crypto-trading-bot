#!/usr/bin/env node

/**
 * ICC Trading Bot - Standalone Edition
 * Based on Trade by Sci's ICC (Indication, Correction, Continuation) Framework
 *
 * This bot runs as a standalone Node.js application and connects to Binance
 * to execute real trades (starting with paper trading mode).
 *
 * Trading Modes:
 * - PAPER: Simulates trades with real price data (safe, no real money)
 * - LIVE: Executes real trades on Binance (use with caution!)
 *
 * Author: Based on Trade by Sci's ICC Strategy
 * License: MIT (Educational Use Only)
 */

require('dotenv').config();
const ccxt = require('ccxt');
const chalk = require('chalk');
const Table = require('cli-table3');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Trading mode
    tradingMode: process.env.TRADING_MODE || 'paper',

    // Exchange
    exchange: 'binance',
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    testnet: process.env.BINANCE_TESTNET === 'true',

    // Trading pair
    symbol: process.env.TRADING_PAIR || 'SOL/USDT',

    // Capital
    initialCapital: parseFloat(process.env.INITIAL_CAPITAL_USDT) || 10,
    positionSizePercent: parseFloat(process.env.POSITION_SIZE_PERCENT) || 0.95,

    // ICC Strategy
    swingPeriod: parseInt(process.env.SWING_PERIOD) || 5,
    breakThresholdPercent: parseFloat(process.env.BREAK_THRESHOLD_PERCENT) || 0.002,
    retestTolerancePercent: parseFloat(process.env.RETEST_TOLERANCE_PERCENT) || 0.01,
    continuationConfirmationPercent: parseFloat(process.env.CONTINUATION_CONFIRMATION_PERCENT) || 0.003,

    // Risk management
    profitTargetPercent: parseFloat(process.env.PROFIT_TARGET_PERCENT) || 0.025,
    stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT) || 0.0125,
    trailingStopPercent: parseFloat(process.env.TRAILING_STOP_PERCENT) || 0.0075,
    maxHoldingPeriodHours: parseInt(process.env.MAX_HOLDING_PERIOD_HOURS) || 24,
    maxPositions: parseInt(process.env.MAX_POSITIONS) || 1,

    // Data
    candleTimeframe: process.env.CANDLE_TIMEFRAME || '5m',
    historicalCandles: parseInt(process.env.HISTORICAL_CANDLES) || 100,
    priceUpdateIntervalMs: parseInt(process.env.PRICE_UPDATE_INTERVAL_MS) || 5000,

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    saveTradeLog: process.env.SAVE_TRADE_LOG === 'true'
};

// ============================================
// GLOBAL STATE
// ============================================

let exchange = null;
let currentPrice = 0;
let ohlcData = [];

// ICC State
let iccPhase = 'WAITING'; // 'WAITING', 'INDICATION_DETECTED', 'CORRECTION_IN_PROGRESS', 'CONTINUATION_CONFIRMED'
let iccSetup = null;

// Support/Resistance
let supportLevels = [];
let resistanceLevels = [];
let swingHighs = [];
let swingLows = [];

// Position
let position = null;

// Performance
let paperTradingBalance = CONFIG.initialCapital;
let totalPnl = 0;
let totalPnlAfterFees = 0;
let totalFeesPaid = 0;
let numTrades = 0;
let numWins = 0;
let numWinsAfterFees = 0;
let tradeLog = [];

// System
let priceUpdateInterval = null;
let isRunning = false;

// ============================================
// EXCHANGE INITIALIZATION
// ============================================

function initializeExchange() {
    try {
        const ExchangeClass = ccxt[CONFIG.exchange];

        const exchangeConfig = {
            enableRateLimit: true,
            options: {
                defaultType: 'spot'
            }
        };

        // Add API keys only if in live mode
        if (CONFIG.tradingMode === 'live') {
            if (!CONFIG.apiKey || !CONFIG.apiSecret) {
                throw new Error('API keys required for live trading! Set BINANCE_API_KEY and BINANCE_API_SECRET in .env file');
            }
            exchangeConfig.apiKey = CONFIG.apiKey;
            exchangeConfig.secret = CONFIG.apiSecret;
        }

        // Use testnet if enabled
        if (CONFIG.testnet) {
            exchangeConfig.urls = {
                api: {
                    public: 'https://testnet.binance.vision/api/v3',
                    private: 'https://testnet.binance.vision/api/v3'
                }
            };
        }

        exchange = new ExchangeClass(exchangeConfig);

        log('info', `Exchange initialized: ${CONFIG.exchange} (${CONFIG.tradingMode} mode)`);
        return true;
    } catch (error) {
        log('error', `Failed to initialize exchange: ${error.message}`);
        return false;
    }
}

// ============================================
// LOGGING
// ============================================

function log(level, message, data = null) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[CONFIG.logLevel] || 1;
    const messageLevel = levels[level] || 1;

    if (messageLevel < configLevel) return;

    const timestamp = new Date().toISOString();
    let coloredMessage = message;

    switch (level) {
        case 'error':
            coloredMessage = chalk.red(`[ERROR] ${message}`);
            break;
        case 'warn':
            coloredMessage = chalk.yellow(`[WARN] ${message}`);
            break;
        case 'info':
            coloredMessage = chalk.cyan(`[INFO] ${message}`);
            break;
        case 'debug':
            coloredMessage = chalk.gray(`[DEBUG] ${message}`);
            break;
    }

    console.log(`${chalk.gray(timestamp)} ${coloredMessage}`);

    if (data) {
        console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
}

// ============================================
// PRICE DATA
// ============================================

async function fetchOHLC() {
    try {
        const candles = await exchange.fetchOHLCV(
            CONFIG.symbol,
            CONFIG.candleTimeframe,
            undefined,
            CONFIG.historicalCandles
        );

        ohlcData = candles.map(candle => ({
            timestamp: candle[0],
            open: candle[1],
            high: candle[2],
            low: candle[3],
            close: candle[4],
            volume: candle[5]
        }));

        if (ohlcData.length > 0) {
            currentPrice = ohlcData[ohlcData.length - 1].close;
        }

        log('debug', `Fetched ${ohlcData.length} candles, current price: $${currentPrice.toFixed(4)}`);
        return true;
    } catch (error) {
        log('error', `Failed to fetch OHLC data: ${error.message}`);
        return false;
    }
}

async function updatePrice() {
    try {
        const ticker = await exchange.fetchTicker(CONFIG.symbol);
        currentPrice = ticker.last;

        // Update the latest candle
        if (ohlcData.length > 0) {
            ohlcData[ohlcData.length - 1].close = currentPrice;
            ohlcData[ohlcData.length - 1].high = Math.max(ohlcData[ohlcData.length - 1].high, currentPrice);
            ohlcData[ohlcData.length - 1].low = Math.min(ohlcData[ohlcData.length - 1].low, currentPrice);
        }

        return true;
    } catch (error) {
        log('error', `Failed to update price: ${error.message}`);
        return false;
    }
}

// ============================================
// SUPPORT/RESISTANCE DETECTION
// ============================================

function identifySwingHighs() {
    const swings = [];
    if (ohlcData.length < CONFIG.swingPeriod * 2 + 1) return swings;

    for (let i = CONFIG.swingPeriod; i < ohlcData.length - CONFIG.swingPeriod; i++) {
        const current = ohlcData[i].high;
        let isSwingHigh = true;

        // Check left side
        for (let j = i - CONFIG.swingPeriod; j < i; j++) {
            if (ohlcData[j].high >= current) {
                isSwingHigh = false;
                break;
            }
        }

        // Check right side
        if (isSwingHigh) {
            for (let j = i + 1; j <= i + CONFIG.swingPeriod; j++) {
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

function identifySwingLows() {
    const swings = [];
    if (ohlcData.length < CONFIG.swingPeriod * 2 + 1) return swings;

    for (let i = CONFIG.swingPeriod; i < ohlcData.length - CONFIG.swingPeriod; i++) {
        const current = ohlcData[i].low;
        let isSwingLow = true;

        // Check left side
        for (let j = i - CONFIG.swingPeriod; j < i; j++) {
            if (ohlcData[j].low <= current) {
                isSwingLow = false;
                break;
            }
        }

        // Check right side
        if (isSwingLow) {
            for (let j = i + 1; j <= i + CONFIG.swingPeriod; j++) {
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

function updateSupportResistanceLevels() {
    swingHighs = identifySwingHighs();
    swingLows = identifySwingLows();

    // Update resistance levels
    resistanceLevels = [];
    swingHighs.forEach(swing => {
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

    // Update support levels
    supportLevels = [];
    swingLows.forEach(swing => {
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

    // Sort by strength
    resistanceLevels.sort((a, b) => b.strength - a.strength);
    supportLevels.sort((a, b) => b.strength - a.strength);

    // Keep top 3
    resistanceLevels = resistanceLevels.slice(0, 3);
    supportLevels = supportLevels.slice(0, 3);
}

function getNearestResistance() {
    const above = resistanceLevels.filter(level => level.price > currentPrice);
    if (above.length === 0) return null;
    return above.reduce((nearest, level) =>
        level.price < nearest.price ? level : nearest
    ).price;
}

function getNearestSupport() {
    const below = supportLevels.filter(level => level.price < currentPrice);
    if (below.length === 0) return null;
    return below.reduce((nearest, level) =>
        level.price > nearest.price ? level : nearest
    ).price;
}

// ============================================
// ICC STRATEGY
// ============================================

function detectIndication() {
    const nearestResistance = getNearestResistance();
    const nearestSupport = getNearestSupport();

    // Bullish indication
    if (nearestResistance && currentPrice > nearestResistance * (1 + CONFIG.breakThresholdPercent)) {
        iccPhase = 'INDICATION_DETECTED';
        iccSetup = {
            type: 'BULLISH',
            brokenLevel: nearestResistance,
            indicationPrice: currentPrice,
            indicationTime: Date.now(),
            correctionStarted: false
        };
        log('info', chalk.green(`🔔 ICC INDICATION (BULLISH): Resistance broken at $${nearestResistance.toFixed(4)}`));
        return;
    }

    // Bearish indication
    if (nearestSupport && currentPrice < nearestSupport * (1 - CONFIG.breakThresholdPercent)) {
        iccPhase = 'INDICATION_DETECTED';
        iccSetup = {
            type: 'BEARISH',
            brokenLevel: nearestSupport,
            indicationPrice: currentPrice,
            indicationTime: Date.now(),
            correctionStarted: false
        };
        log('info', chalk.red(`🔔 ICC INDICATION (BEARISH): Support broken at $${nearestSupport.toFixed(4)}`));
        return;
    }
}

function detectCorrection() {
    if (!iccSetup) {
        resetICCPhase();
        return;
    }

    const retestLowerBound = iccSetup.brokenLevel * (1 - CONFIG.retestTolerancePercent);
    const retestUpperBound = iccSetup.brokenLevel * (1 + CONFIG.retestTolerancePercent);

    // Check if price entered retest zone
    if (currentPrice >= retestLowerBound && currentPrice <= retestUpperBound) {
        if (!iccSetup.correctionStarted) {
            iccSetup.correctionStarted = true;
            iccSetup.correctionTime = Date.now();
            iccPhase = 'CORRECTION_IN_PROGRESS';
            log('info', chalk.yellow(`🔔 ICC CORRECTION: Price retesting $${iccSetup.brokenLevel.toFixed(4)} zone`));
        }
    }

    // Invalidate if price breaks back
    if (iccSetup.type === 'BULLISH' && currentPrice < retestLowerBound) {
        log('warn', `❌ ICC Setup INVALIDATED: Price broke back below`);
        resetICCPhase();
    } else if (iccSetup.type === 'BEARISH' && currentPrice > retestUpperBound) {
        log('warn', `❌ ICC Setup INVALIDATED: Price broke back above`);
        resetICCPhase();
    }

    // Timeout
    if (Date.now() - iccSetup.indicationTime > 2 * 60 * 60 * 1000) {
        log('warn', `⏱️ ICC Setup TIMEOUT`);
        resetICCPhase();
    }
}

function detectContinuation() {
    if (!iccSetup || !iccSetup.correctionStarted) {
        resetICCPhase();
        return;
    }

    // Bullish continuation
    if (iccSetup.type === 'BULLISH') {
        const continuationTarget = iccSetup.indicationPrice;
        if (currentPrice > continuationTarget * (1 + CONFIG.continuationConfirmationPercent)) {
            iccPhase = 'CONTINUATION_CONFIRMED';
            iccSetup.continuationPrice = currentPrice;
            iccSetup.continuationTime = Date.now();
            log('info', chalk.green(`✅ ICC CONTINUATION (BULLISH): Entry signal at $${currentPrice.toFixed(4)}`));
            return;
        }
    }

    // Bearish continuation
    if (iccSetup.type === 'BEARISH') {
        const continuationTarget = iccSetup.indicationPrice;
        if (currentPrice < continuationTarget * (1 - CONFIG.continuationConfirmationPercent)) {
            iccPhase = 'CONTINUATION_CONFIRMED';
            iccSetup.continuationPrice = currentPrice;
            iccSetup.continuationTime = Date.now();
            log('info', chalk.red(`✅ ICC CONTINUATION (BEARISH): Entry signal at $${currentPrice.toFixed(4)}`));
            return;
        }
    }

    // Check for invalidation
    const retestLowerBound = iccSetup.brokenLevel * (1 - CONFIG.retestTolerancePercent);
    const retestUpperBound = iccSetup.brokenLevel * (1 + CONFIG.retestTolerancePercent);

    if (iccSetup.type === 'BULLISH' && currentPrice < retestLowerBound) {
        log('warn', `❌ ICC Setup FAILED: No continuation`);
        resetICCPhase();
    } else if (iccSetup.type === 'BEARISH' && currentPrice > retestUpperBound) {
        log('warn', `❌ ICC Setup FAILED: No continuation`);
        resetICCPhase();
    }
}

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
            enterICCPosition();
            break;
    }
}

function resetICCPhase() {
    iccPhase = 'WAITING';
    iccSetup = null;
}

// ============================================
// POSITION MANAGEMENT
// ============================================

async function enterICCPosition() {
    if (!iccSetup || iccPhase !== 'CONTINUATION_CONFIRMED') {
        resetICCPhase();
        return;
    }

    if (position) {
        log('warn', 'Already in position, skipping entry');
        return;
    }

    const type = iccSetup.type === 'BULLISH' ? 'LONG' : 'SHORT';
    const stopLossPrice = type === 'LONG'
        ? currentPrice * (1 - CONFIG.stopLossPercent)
        : currentPrice * (1 + CONFIG.stopLossPercent);

    // Calculate position size
    const capitalToUse = CONFIG.tradingMode === 'paper'
        ? paperTradingBalance * CONFIG.positionSizePercent
        : await getRealBalance();

    const quantity = capitalToUse / currentPrice;

    log('info', chalk.bold.green(`📊 ICC ENTRY: ${type} position`));
    log('info', `Entry Price: $${currentPrice.toFixed(4)}`);
    log('info', `Quantity: ${quantity.toFixed(6)} ${CONFIG.symbol.split('/')[0]}`);
    log('info', `Capital Used: $${capitalToUse.toFixed(2)}`);
    log('info', `Stop Loss: $${stopLossPrice.toFixed(4)}`);

    if (CONFIG.tradingMode === 'live') {
        // Execute real order
        await executeRealOrder(type, quantity);
    }

    // Record position
    position = {
        type,
        entryPrice: currentPrice,
        entryTime: Date.now(),
        quantity,
        initialStopLoss: stopLossPrice,
        trailingStopValue: stopLossPrice
    };

    // Reset ICC phase after entry
    resetICCPhase();
}

async function managePosition() {
    if (!position) return;

    const pnl = (currentPrice - position.entryPrice) * (position.type === 'LONG' ? 1 : -1) * position.quantity;
    const pnlPercent = pnl / (position.entryPrice * position.quantity);
    const timeElapsed = Date.now() - position.entryTime;

    // Update trailing stop
    if (position.type === 'LONG') {
        position.trailingStopValue = Math.max(
            position.trailingStopValue,
            currentPrice * (1 - CONFIG.trailingStopPercent)
        );
    } else {
        position.trailingStopValue = Math.min(
            position.trailingStopValue,
            currentPrice * (1 + CONFIG.trailingStopPercent)
        );
    }

    const activeStopLoss = position.type === 'LONG'
        ? Math.max(position.initialStopLoss, position.trailingStopValue)
        : Math.min(position.initialStopLoss, position.trailingStopValue);

    // Check exit conditions
    if (pnlPercent >= CONFIG.profitTargetPercent) {
        log('info', chalk.green(`✅ PROFIT TARGET HIT: $${pnl.toFixed(2)} (${(pnlPercent * 100).toFixed(2)}%)`));
        await closePosition('PROFIT');
    } else if (
        (position.type === 'LONG' && currentPrice <= activeStopLoss) ||
        (position.type === 'SHORT' && currentPrice >= activeStopLoss)
    ) {
        log('warn', chalk.red(`🛑 STOP LOSS HIT: $${pnl.toFixed(2)} (${(pnlPercent * 100).toFixed(2)}%)`));
        await closePosition('STOP_LOSS');
    } else if (timeElapsed >= CONFIG.maxHoldingPeriodHours * 60 * 60 * 1000) {
        log('warn', chalk.yellow(`⏱️ TIME LIMIT (${CONFIG.maxHoldingPeriodHours}h): $${pnl.toFixed(2)}`));
        await closePosition('TIME_LIMIT');
    }
}

async function closePosition(reason) {
    if (!position) return;

    const exitPrice = currentPrice;
    const pnl = (exitPrice - position.entryPrice) * (position.type === 'LONG' ? 1 : -1) * position.quantity;

    // Calculate fees
    const entryFee = position.entryPrice * position.quantity * 0.001; // 0.1% Binance fee
    const exitFee = exitPrice * position.quantity * 0.001;
    const totalFees = entryFee + exitFee;
    const netPnl = pnl - totalFees;

    // Update stats
    numTrades++;
    totalPnl += pnl;
    totalFeesPaid += totalFees;
    totalPnlAfterFees += netPnl;

    if (pnl >= 0) numWins++;
    if (netPnl >= 0) numWinsAfterFees++;

    // Update paper trading balance
    if (CONFIG.tradingMode === 'paper') {
        paperTradingBalance += netPnl;
    }

    // Execute real close order if live
    if (CONFIG.tradingMode === 'live') {
        await executeRealCloseOrder(position.type, position.quantity);
    }

    // Log trade
    const trade = {
        timestamp: Date.now(),
        type: position.type,
        entryPrice: position.entryPrice,
        exitPrice,
        pnl,
        fees: totalFees,
        netPnl,
        reason
    };

    tradeLog.push(trade);

    log('info', chalk.bold(`📉 POSITION CLOSED (${reason})`));
    log('info', `Type: ${position.type}`);
    log('info', `Entry: $${position.entryPrice.toFixed(4)} → Exit: $${exitPrice.toFixed(4)}`);
    log('info', `Gross P&L: ${pnl >= 0 ? chalk.green('+') : chalk.red('')}$${pnl.toFixed(2)}`);
    log('info', `Fees: -$${totalFees.toFixed(2)}`);
    log('info', `Net P&L: ${netPnl >= 0 ? chalk.green('+') : chalk.red('')}$${netPnl.toFixed(2)}`);

    if (CONFIG.tradingMode === 'paper') {
        log('info', `Paper Balance: $${paperTradingBalance.toFixed(2)}`);
    }

    position = null;
    resetICCPhase();
}

// ============================================
// REAL TRADING (LIVE MODE)
// ============================================

async function getRealBalance() {
    try {
        const balance = await exchange.fetchBalance();
        const currency = CONFIG.symbol.split('/')[1]; // e.g., USDT from SOL/USDT
        return balance[currency].free * CONFIG.positionSizePercent;
    } catch (error) {
        log('error', `Failed to fetch balance: ${error.message}`);
        return 0;
    }
}

async function executeRealOrder(type, quantity) {
    try {
        log('info', `Executing REAL ${type} order...`);

        const side = type === 'LONG' ? 'buy' : 'sell';
        const order = await exchange.createMarketOrder(CONFIG.symbol, side, quantity);

        log('info', chalk.green(`✅ Order executed: ${order.id}`));
        return order;
    } catch (error) {
        log('error', `Failed to execute order: ${error.message}`);
        return null;
    }
}

async function executeRealCloseOrder(type, quantity) {
    try {
        log('info', `Executing REAL close order...`);

        const side = type === 'LONG' ? 'sell' : 'buy';
        const order = await exchange.createMarketOrder(CONFIG.symbol, side, quantity);

        log('info', chalk.green(`✅ Close order executed: ${order.id}`));
        return order;
    } catch (error) {
        log('error', `Failed to execute close order: ${error.message}`);
        return null;
    }
}

// ============================================
// MAIN TRADING LOOP
// ============================================

async function runTradingCycle() {
    try {
        // Update price
        await updatePrice();

        // Update support/resistance
        if (ohlcData.length >= CONFIG.swingPeriod * 2 + 1) {
            updateSupportResistanceLevels();
        }

        // Manage existing position
        if (position) {
            await managePosition();
        }

        // Look for new ICC setups
        if (!position && ohlcData.length >= CONFIG.swingPeriod * 2 + 1) {
            processICCPhases();
        }

    } catch (error) {
        log('error', `Error in trading cycle: ${error.message}`);
    }
}

// ============================================
// STATUS DISPLAY
// ============================================

function displayStatus() {
    console.clear();

    // Header
    console.log(chalk.bold.cyan('='.repeat(80)));
    console.log(chalk.bold.cyan(`ICC TRADING BOT - ${CONFIG.tradingMode.toUpperCase()} MODE`));
    console.log(chalk.bold.cyan('='.repeat(80)));
    console.log();

    // Current state
    const table = new Table({
        head: [chalk.white.bold('Parameter'), chalk.white.bold('Value')],
        colWidths: [30, 50]
    });

    table.push(
        ['Symbol', CONFIG.symbol],
        ['Current Price', `$${currentPrice.toFixed(4)}`],
        ['ICC Phase', iccPhase === 'WAITING' ? chalk.cyan(iccPhase) :
                      iccPhase === 'INDICATION_DETECTED' ? chalk.yellow(iccPhase) :
                      iccPhase === 'CORRECTION_IN_PROGRESS' ? chalk.magenta(iccPhase) :
                      chalk.green(iccPhase)],
        ['Position', position ? `${position.type} at $${position.entryPrice.toFixed(4)}` : 'None']
    );

    if (position) {
        const pnl = (currentPrice - position.entryPrice) * (position.type === 'LONG' ? 1 : -1) * position.quantity;
        const pnlPercent = (pnl / (position.entryPrice * position.quantity) * 100).toFixed(2);
        const pnlColor = pnl >= 0 ? chalk.green : chalk.red;
        table.push(['Current P&L', pnlColor(`${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent}%)`)]);
    }

    // Levels
    const nearestResistance = getNearestResistance();
    const nearestSupport = getNearestSupport();
    if (nearestResistance) {
        table.push(['Resistance', `$${nearestResistance.toFixed(4)}`]);
    }
    if (nearestSupport) {
        table.push(['Support', `$${nearestSupport.toFixed(4)}`]);
    }

    console.log(table.toString());
    console.log();

    // Performance
    const perfTable = new Table({
        head: [chalk.white.bold('Performance'), chalk.white.bold('Value')],
        colWidths: [30, 50]
    });

    const winRate = numTrades > 0 ? ((numWins / numTrades) * 100).toFixed(2) : '0.00';
    const winRateAfterFees = numTrades > 0 ? ((numWinsAfterFees / numTrades) * 100).toFixed(2) : '0.00';
    const profitColor = totalPnlAfterFees >= 0 ? chalk.green : chalk.red;

    perfTable.push(
        ['Total Trades', numTrades.toString()],
        ['Wins', `${numWins} (${numWinsAfterFees} after fees)`],
        ['Win Rate', `${winRate}% (${winRateAfterFees}% after fees)`],
        ['Gross P&L', `$${totalPnl.toFixed(2)}`],
        ['Total Fees', chalk.yellow(`-$${totalFeesPaid.toFixed(2)}`)],
        ['Net P&L', profitColor(`${totalPnlAfterFees >= 0 ? '+' : ''}$${totalPnlAfterFees.toFixed(2)}`)]
    );

    if (CONFIG.tradingMode === 'paper') {
        const roi = ((paperTradingBalance - CONFIG.initialCapital) / CONFIG.initialCapital * 100).toFixed(2);
        const roiColor = roi >= 0 ? chalk.green : chalk.red;
        perfTable.push(
            ['Paper Balance', `$${paperTradingBalance.toFixed(2)}`],
            ['ROI', roiColor(`${roi}%`)]
        );
    }

    console.log(perfTable.toString());
    console.log();

    console.log(chalk.gray(`Last update: ${new Date().toLocaleTimeString()}`));
    console.log(chalk.gray(`Press Ctrl+C to stop`));
}

// ============================================
// STARTUP
// ============================================

async function start() {
    console.log(chalk.bold.cyan('ICC Trading Bot Starting...'));
    console.log();

    // Validate mode
    if (CONFIG.tradingMode !== 'paper' && CONFIG.tradingMode !== 'live') {
        log('error', `Invalid trading mode: ${CONFIG.tradingMode}. Must be 'paper' or 'live'`);
        process.exit(1);
    }

    // Warning for live mode
    if (CONFIG.tradingMode === 'live') {
        console.log(chalk.bold.red('⚠️  WARNING: LIVE TRADING MODE ENABLED!'));
        console.log(chalk.yellow('Real money will be used. Make sure you know what you are doing!'));
        console.log();

        // Wait 5 seconds
        console.log(chalk.yellow('Starting in 5 seconds... Press Ctrl+C to cancel'));
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Initialize exchange
    if (!initializeExchange()) {
        process.exit(1);
    }

    // Fetch initial data
    log('info', 'Fetching historical data...');
    if (!await fetchOHLC()) {
        process.exit(1);
    }

    log('info', `Loaded ${ohlcData.length} candles`);
    log('info', `Current price: $${currentPrice.toFixed(4)}`);
    log('info', `Initial capital: $${CONFIG.initialCapital.toFixed(2)}`);
    log('info', '');
    log('info', chalk.bold.green('Bot is running! Waiting for ICC setups...'));
    log('info', '');

    // Start price update loop
    priceUpdateInterval = setInterval(async () => {
        await runTradingCycle();
        displayStatus();
    }, CONFIG.priceUpdateIntervalMs);

    // Initial display
    displayStatus();

    isRunning = true;
}

// ============================================
// SHUTDOWN
// ============================================

async function shutdown() {
    log('info', 'Shutting down...');

    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
    }

    if (position) {
        log('warn', 'Closing open position before shutdown...');
        await closePosition('MANUAL');
    }

    // Display final stats
    console.log();
    console.log(chalk.bold.cyan('='.repeat(80)));
    console.log(chalk.bold.cyan('FINAL STATISTICS'));
    console.log(chalk.bold.cyan('='.repeat(80)));
    displayStatus();

    log('info', 'Bot stopped');
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ============================================
// START BOT
// ============================================

start().catch(error => {
    log('error', `Fatal error: ${error.message}`);
    process.exit(1);
});
