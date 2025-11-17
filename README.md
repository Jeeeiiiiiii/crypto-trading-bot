# crypto-trading-bot
An **ICC (Indication, Correction, Continuation) swing trading bot** for **STOCKS and CRYPTO** based on **Trade by Sci's strategy**. Features automatic support/resistance detection, ICC phase tracking, and real fee calculations. For educational use only.

**Two Versions Available:**
1. **🌐 Browser Simulation** (`crypto-trading-bot.js`) - Paste in browser console, simulates trades on Webull
2. **🤖 Standalone Bot** (`icc-bot.js`) - Node.js app, connects to Binance, executes real trades (paper or live)

![image](https://github.com/user-attachments/assets/19bd08c6-3de3-482e-b108-f9fdf688ce91)

## What is ICC Trading?

**ICC = Indication, Correction, Continuation**

This is NOT a scalping bot - it's a **swing/day trading strategy** that waits for high-probability setups:

1. **INDICATION** - Price breaks key support/resistance
2. **CORRECTION** - Price pulls back to retest broken level
3. **CONTINUATION** - Price resumes in indicated direction → **ENTRY**

**Why ICC works better than scalping:**
- ✅ Fewer trades (1-5 per session vs 100+)
- ✅ Larger profit targets (2-3% vs 0.25%)
- ✅ Higher win rate (55-70% vs 40-50%)
- ✅ Better R:R ratio (2:1 to 5:1 vs 1:1)
- ✅ No entry on the break - wait for confirmation

## 🤖 Choose Your Version

### Version 1: Browser Simulation (Beginner-Friendly)
- **File**: `crypto-trading-bot.js`
- **Platform**: Webull (browser-based)
- **Trading**: Simulation only (no real money)
- **Setup**: Paste JavaScript in browser console
- **Best For**: Learning ICC strategy, testing without risk

The bot works on both:
- **Stocks**: https://app.webull.com/stocks (Default configuration)
- **Crypto**: https://app.webull.com/crypto (Uncomment crypto config in code)

### Version 2: Standalone Bot (Real Trading)
- **File**: `icc-bot.js`
- **Platform**: Binance (API connection)
- **Trading**: Paper trading OR live trading (real money!)
- **Setup**: Node.js application, see [TRADING_SETUP.md](TRADING_SETUP.md)
- **Best For**: Serious traders wanting automation with real capital

**Start with Paper Trading:**
```bash
npm install
cp .env.example .env
npm run paper
```

See **[TRADING_SETUP.md](TRADING_SETUP.md)** for complete setup guide!

**ICC Strategy Results:**
> Unlike scalping bots that take 100+ trades per session,
> the ICC bot is **selective** - waiting for confirmed setups.
> **Expect 1-5 high-quality trades per session** with:
> - **2-3% profit targets** (vs 0.25% scalping targets)
> - **1% stop losses** (vs 0.12% scalping stops)
> - **55-70% win rate** (vs 40% scalping win rate)
> - **24-hour max hold time** (vs 60-second scalping holds)

This is a **swing/day trading approach**, not high-frequency scalping.
It runs entirely in the browser — no installs, no API keys — just paste and go.

---

## ⚠️ THE FEE PROBLEM (And How We Fixed It)

The original bot made **$566 profit over 7,328 trades** = only **$0.08 profit per trade**.

**With real trading fees, this would be UNPROFITABLE:**
- Average exchange fee: **0.1% per trade** (entry + exit = 0.2% total)
- For ETH at $3,000 with 1 ETH per trade: **$6 in fees per trade**
- Your $0.08 profit would be wiped out immediately!

### 💡 Solution: Low-Fee Coins + Fee Tracking

This updated bot now:
1. **Supports LOW-FEE cryptocurrencies** (Solana, XRP, Stellar, etc.)
2. **Calculates real trading fees** and shows NET profit
3. **Adjusted profit targets** (0.25% instead of 0.08%) to stay profitable after fees
4. **Displays both gross and net P&L** so you see the real picture

---

## 🚀 Try It Yourself

### Step 1: Choose Your Asset

**For Stocks Trading (Default - No Code Changes Needed):**
1. The bot is pre-configured for stocks trading
2. No fee calculations (most platforms offer commission-free stock trading)
3. Perfect for testing the strategy without fee concerns

**For Crypto Trading (Requires Code Edit):**

The bot supports multiple low-fee coins. **Solana (SOL) is recommended** for crypto.

**Supported Crypto Coins:**
- **Solana (SOL)** - Extremely low fees, high liquidity ✅ **RECOMMENDED**
- **XRP** - Ultra-low blockchain fees, fast transactions
- **Stellar (XLM)** - Lowest fees available
- **Algorand (ALGO)** - Low fees, fast finality
- **Polygon (MATIC)** - Very low fees on Polygon network
- **Litecoin (LTC)** - Lower fees than BTC/ETH
- **Tron (TRX)** - Very low fees, high throughput
- **Ethereum (ETH)** - Original (NOT recommended due to high fees)

To switch to crypto, edit the configuration section in `crypto-trading-bot.js` (lines 38-162):
- Comment out the STOCK configuration (lines 41-48)
- Uncomment your preferred crypto coin configuration

### Step 2: Run the Bot

**For Stocks:**
1. Go to [https://app.webull.com/stocks](https://app.webull.com/stocks)
2. Open the chart for any stock (e.g., **AAPL**, **TSLA**, etc.)
3. Open your browser's **Dev Console** (F12 or Cmd+Option+I)
4. Paste in the script from `crypto-trading-bot.js`
5. Keep the tab **active** — the bot uses real-time DOM updates

**For Crypto:**
1. Go to [https://app.webull.com/crypto](https://app.webull.com/crypto)
2. Open the chart for your chosen coin (e.g., **SOL/USD**)
3. Open your browser's **Dev Console** (F12 or Cmd+Option+I)
4. Paste in the script from `crypto-trading-bot.js`
5. Keep the tab **active** — the bot uses real-time DOM updates

> 🔔 You must keep the browser and tab open or it will stop receiving price updates.

### ⚠️ XPath Troubleshooting

If you see "ERROR: Price element not found. Check XPath", the page structure may have changed. The XPath selector is configured differently for stocks vs crypto:
- **Stocks**: `//*[@id="app"]/section/section/section/main/div/div[2]/div[1]/div[2]/div/div/span[2]`
- **Crypto**: `//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]`

If you encounter issues, you can inspect the price element in Chrome DevTools and update the `xpath` value in the configuration.

---

## 🧠 ICC Strategy Explained

The bot implements **Trade by Sci's ICC Framework**:

### The Three Phases:

1. **INDICATION Phase**
   - Bot detects when price breaks key support or resistance
   - **Does NOT enter** - just marks the broken level
   - Waits for the next phase

2. **CORRECTION Phase**
   - Price pulls back to retest the broken level
   - Bot monitors for rejection/acceptance at the level
   - **Still does NOT enter** - waits for confirmation

3. **CONTINUATION Phase**
   - Price resumes moving in the indicated direction
   - **NOW the bot enters** - high-probability setup confirmed
   - Stop loss placed beyond the retest level

### Key Features:

- **Automatic Support/Resistance Detection** - Uses swing highs/lows
- **Smart Phase Tracking** - Visual UI shows current ICC phase
- **No False Breakouts** - Waits for retest confirmation before entry
- **Real Fee Calculations** - Shows gross & net P&L
- **Swing Trading Parameters** - Optimized for 2-3% moves, not 0.25%

### ICC Parameters (Swing Trading)

| Parameter | Scalping (Old) | ICC Swing Trading (New) | Why Changed |
|-----------|---------------|------------------------|-------------|
| Profit Target | 0.25% | **2.0%** | Targets structural moves |
| Stop Loss | 0.12% | **1.0%** | Room for retest volatility |
| Trailing Stop | 0.06% | **0.5%** | Locks in swing profits |
| Hold Time | 60 seconds | **24 hours** | Swing trades, not scalps |
| Trade Frequency | 100+ per session | **1-5 per session** | Quality over quantity |
| Entry Logic | Momentum | **ICC Confirmation** | Wait for all 3 phases |

> Note: The bot displays ICC Phase, detected support/resistance levels, gross/net P&L, and full trade log.

---

## 💰 Fee Analysis & Profitability

### Original ETH Bot Performance (UNPROFITABLE)

```
Total Trades: 7,328
Gross Profit: $566.07
Average Profit per Trade: $0.08

With 0.1% trading fees (entry + exit = 0.2% total):
- Assuming $3,000 ETH, 1 ETH per trade
- Fee per trade: $6.00 (entry) + $6.00 (exit) = $12.00
- Net profit per trade: $0.08 - $12.00 = -$11.92 LOSS
- Total net after fees: -$87,329 MASSIVE LOSS! ❌
```

### Updated Low-Fee Coin Bot (POTENTIALLY PROFITABLE)

With the new 0.25% profit target and low-fee coins:

```
Assumptions:
- Trading SOL at $150 per coin
- 1 SOL per trade
- 0.1% exchange fee (entry + exit = 0.2% total)
- 40% win rate maintained

Per Winning Trade:
- Profit target: 0.25% of $150 = $0.375
- Fees: 0.2% of $150 = $0.30
- Net profit: $0.375 - $0.30 = $0.075 ✅

Per Losing Trade (stop loss at 0.12%):
- Loss: 0.12% of $150 = -$0.18
- Fees: 0.2% of $150 = -$0.30
- Net loss: -$0.18 - $0.30 = -$0.48

Expected Value per Trade (40% win rate):
EV = (0.40 × $0.075) + (0.60 × -$0.48) = -$0.258

Still challenging, but MUCH better than the -$11.92 with ETH!
```

### 🎯 Tips for Profitability

1. **Use low-fee coins** - SOL, XRP, XLM have the best fee structures
2. **Reduce trade frequency** - Fewer trades = fewer fees
3. **Increase profit targets** - Current 0.25% is minimum; 0.5% would be better
4. **Improve win rate** - 40% is baseline; aim for 50%+ with better signals
5. **Use VIP/maker fee tiers** - Some exchanges offer 0.05% fees for high volume
6. **Consider spread costs** - The bot doesn't account for bid-ask spread yet

> ⚠️ **Reality Check**: Even with low-fee coins, high-frequency scalping is extremely difficult to profit from after fees. This bot is for EDUCATIONAL purposes to understand the impact of trading costs.

---

## 📊 New Features

### Fee Tracking Dashboard

The updated UI shows:
- **Gross P&L**: Profit before fees (old metric)
- **Total Fees**: Cumulative fees paid across all trades
- **Net P&L**: Real profit after fees (what matters!)
- **Win Rate Before Fees**: Raw win percentage
- **Win Rate After Fees**: Profitable trades after accounting for fees

### Trade Log Enhancements

Each trade now displays:
- Entry and exit prices
- Gross P&L (before fees)
- Fee amount (highlighted in orange)
- Net P&L (after fees, in bold)
- Exit reason (PROFIT, STOP_LOSS, TIME_LIMIT, MANUAL)

---

## 📚 About the ICC Strategy

This bot implements the **ICC (Indication, Correction, Continuation)** framework taught by **Trade by Sci** (@sci.mindset on TikTok/YouTube).

### ICC Philosophy:

> **"Don't chase the break. Wait for the market to come back and test it. Then, and only then, enter when it continues in your direction."** - Trade by Sci

This simple philosophy eliminates:
- ❌ FOMO entries on initial breakouts
- ❌ Getting trapped in false breakouts
- ❌ Emotional, impulsive trading

And creates:
- ✅ High-probability setups
- ✅ Clear invalidation points
- ✅ Structured decision-making

### Learn More About ICC:

- **Creator**: Trade by Sci (@sci.mindset)
- **Strategy Guide**: See `ICC_STRATEGY_GUIDE.md` in this repo for complete explanation
- **YouTube**: Search "ICC Trading Method" or "Trade by Sci"
- **TradingView**: ICC Trading System indicators available

**Key Takeaway**: ICC is about **patience and confirmation**. Wait for all three phases to complete before entering. One missed trade is better than one bad entry.

---

## 🤖 Fork It. Tweak It. Evolve It.

This is open for anyone to improve. Add new indicators, rework the logic, or run it on other tickers.

**Ideas for improvement:**
- Multi-timeframe analysis (1H structure + 5m entries)
- Volume confirmation for breakouts
- Fibonacci retracement levels for correction zones
- ATR-based dynamic stop losses
- Multiple position sizing options
- Backtesting mode with historical data
- Integration with TradingView alerts

> Drop your variants via issue or pull request — we might feature them on the main site.

---

## 🔗 Related Project

Brought to you by [simul8or](https://simul8or.com) — a browser-based trading simulator with chart replay, real-time feeds, and AI tools for traders.

---

## 📎 License

MIT – for educational use only. This is not financial advice. Do not use with real money.

---

## ⚡ Trading Style Classification

**This is a SWING/DAY TRADING bot, NOT a scalping bot:**

| Characteristic | Scalping | ICC Swing Trading (This Bot) |
|----------------|----------|------------------------------|
| Trade Duration | Seconds to minutes | Hours to days (max 24h) |
| Profit Targets | 0.1-0.5% | 2-3%+ |
| Trades Per Day | 50-200+ | 1-5 |
| Analysis Type | Tick charts, momentum | Structure, support/resistance, phases |
| Stop Loss | Very tight (0.1-0.2%) | Reasonable (1-2%) |
| Win Rate | 40-50% | 55-70% (expected) |
| R:R Ratio | 1:1 | 2:1 to 5:1 |
| Strategy | Immediate entries | Wait for 3-phase confirmation |

**Key Point**: Patience is the edge. The ICC bot will pass on many opportunities waiting for the perfect setup. That's by design. Quality over quantity.

---

**Remember**: Even with the ICC strategy's better win rate and R:R ratio, trading is risky. This bot is for educational purposes to understand:
- How ICC trading works
- The importance of support/resistance levels
- Why waiting for confirmation beats chasing breakouts
- The impact of fees on profitability

Always paper trade and backtest before considering live trading.


