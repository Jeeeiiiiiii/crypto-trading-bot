# ICC Trading Bot - Setup Guide
## From Paper Trading to Live Trading

This guide will help you set up and run the ICC trading bot, starting with **safe paper trading** (no real money) and optionally moving to live trading later.

---

## 🚨 IMPORTANT WARNINGS

### Paper Trading First!
- **ALWAYS start with paper trading** (simulated trades with real prices)
- Run paper trading for AT LEAST 1-3 months
- Only consider live trading if consistently profitable in paper mode
- Even then, start with VERY small amounts ($5-10 USD / 300-500 PHP)

### Live Trading Risks
- **You can lose ALL your money** - only use money you can afford to lose
- **No guarantees** - past performance doesn't predict future results
- **Fees matter** - trading fees can eat into profits
- **Volatility** - crypto markets are extremely volatile
- **Technical failures** - bugs, internet issues, exchange downtime can cause losses

### Legal Disclaimer
- This bot is for **educational purposes only**
- Not financial advice
- Use at your own risk
- The creators are not responsible for any losses

---

## 📋 Prerequisites

### What You Need:

1. **Computer** with internet connection
2. **Node.js** installed (version 14 or higher)
3. **Binance account** (free to create, only needed for live trading)
4. **300-500 pesos** (or equivalent) for initial capital

### Check if Node.js is Installed:

```bash
node --version
```

If you see a version number (e.g., `v18.16.0`), you're good to go!

If not, install Node.js:
- **Download**: https://nodejs.org/en/download/
- Install the LTS (Long Term Support) version

---

## 🛠️ Installation

### Step 1: Navigate to Bot Directory

```bash
cd /home/user/crypto-trading-bot
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `ccxt` - Exchange connection library (Binance, Coinbase, etc.)
- `dotenv` - Environment variable management
- `chalk` - Colored terminal output
- `cli-table3` - Nice looking tables

Wait for installation to complete (may take 1-2 minutes).

---

## ⚙️ Configuration

### Step 1: Create Environment File

Copy the example configuration:

```bash
cp .env.example .env
```

### Step 2: Edit Configuration

Open `.env` file in a text editor:

```bash
nano .env
```

**For Paper Trading** (RECOMMENDED TO START):

```env
# TRADING MODE - ALWAYS START WITH PAPER!
TRADING_MODE=paper

# EXCHANGE - Leave empty for paper trading
BINANCE_API_KEY=
BINANCE_API_SECRET=

# TRADING PAIR
TRADING_PAIR=SOL/USDT

# INITIAL CAPITAL (in USD/USDT)
# 300 PHP ≈ $5.40 USD
# 500 PHP ≈ $9.00 USD
INITIAL_CAPITAL_USDT=10

# POSITION SIZE (95% of capital per trade)
POSITION_SIZE_PERCENT=0.95

# PROFIT TARGET (2.5% = good swing trade)
PROFIT_TARGET_PERCENT=0.025

# STOP LOSS (1.25% = manageable risk)
STOP_LOSS_PERCENT=0.0125

# TRAILING STOP (0.75% = lock in profits)
TRAILING_STOP_PERCENT=0.0075

# MAX HOLDING PERIOD (24 hours for swing trading)
MAX_HOLDING_PERIOD_HOURS=24
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter` in nano).

---

## 🎮 Running Paper Trading Mode

### Start the Bot:

```bash
npm run paper
```

**OR**

```bash
npm start
```

### What You'll See:

```
ICC Trading Bot Starting...
Exchange initialized: binance (paper mode)
Fetching historical data...
Loaded 100 candles
Current price: $145.23
Initial capital: $10.00

Bot is running! Waiting for ICC setups...

================================================================================
ICC TRADING BOT - PAPER MODE
================================================================================

Parameter                    | Value
-----------------------------|--------------------------------------------------
Symbol                       | SOL/USDT
Current Price                | $145.23
ICC Phase                    | WAITING
Position                     | None
Resistance                   | $148.50
Support                      | $142.10

Performance                  | Value
-----------------------------|--------------------------------------------------
Total Trades                 | 0
Wins                         | 0 (0 after fees)
Win Rate                     | 0.00% (0.00% after fees)
Gross P&L                    | $0.00
Total Fees                   | -$0.00
Net P&L                      | +$0.00
Paper Balance                | $10.00
ROI                          | 0.00%

Last update: 10:30:45 AM
Press Ctrl+C to stop
```

### What the Bot Does:

1. **Connects to Binance** (reads real price data, no trading)
2. **Identifies support/resistance levels** automatically
3. **Waits for ICC setups**:
   - INDICATION: Price breaks key level
   - CORRECTION: Price retests broken level
   - CONTINUATION: Price confirms direction → **ENTERS TRADE**
4. **Simulates trades** with your paper balance
5. **Manages positions**:
   - Takes profit at 2.5% target
   - Stops loss at 1.25%
   - Trails stop to lock in profits
6. **Tracks performance** (win rate, P&L, ROI)

### Understanding the Phases:

**🔵 WAITING** (Cyan)
- Bot is scanning for level breaks
- No setup in progress
- Just watching...

**🟡 INDICATION_DETECTED** (Yellow)
- Price broke a key support/resistance level
- Bot noted the break
- Waiting for price to pull back (correction)

**🟠 CORRECTION_IN_PROGRESS** (Orange)
- Price is retesting the broken level
- Bot is watching for rejection/acceptance
- Not entering yet - waiting for continuation

**🟢 CONTINUATION_CONFIRMED** (Green)
- Price resumed in the indicated direction
- **HIGH-PROBABILITY SETUP!**
- Bot enters the trade

### Example Trade Flow:

```
10:30 - WAITING: Scanning for setups...
10:35 - INDICATION_DETECTED (BULLISH): Resistance broken at $145.00
10:40 - CORRECTION_IN_PROGRESS: Price retesting $145.00 zone
10:45 - CONTINUATION_CONFIRMED: Entry signal at $146.50
        📊 ICC ENTRY: LONG position
        Entry Price: $146.50
        Quantity: 0.0647 SOL
        Capital Used: $9.50
        Stop Loss: $144.67

11:20 - ✅ PROFIT TARGET HIT: +$0.24 (2.52%)
        📉 POSITION CLOSED (PROFIT)
        Entry: $146.50 → Exit: $150.19
        Gross P&L: +$0.24
        Fees: -$0.03
        Net P&L: +$0.21
        Paper Balance: $10.21
```

### Stop the Bot:

Press `Ctrl+C`

The bot will:
1. Close any open positions
2. Display final statistics
3. Shut down safely

---

## 📊 Tracking Your Progress

### Keep a Trading Journal

Track your paper trading results:

**Week 1:**
- Trades: 12
- Win Rate: 58.3%
- Net P&L: +$0.87
- ROI: +8.7%
- Notes: Bot correctly identified ICC setups, avoided false breakouts

**Week 2:**
- Trades: 15
- Win Rate: 60.0%
- Net P&L: +$1.24
- ROI: +12.4%
- Notes: Trailed stops locked in good profits

Continue for at least 8-12 weeks before considering live trading.

### What to Look For:

✅ **Good Signs:**
- Win rate >55% after fees
- Consistent profitability week-over-week
- ROI >10% per month
- Bot follows ICC strategy correctly
- You understand why trades win/lose

❌ **Warning Signs:**
- Win rate <50% after fees
- Inconsistent or negative results
- ROI <5% per month
- You don't understand the trades
- Bot seems to enter randomly

---

## 💰 Moving to Live Trading (ONLY IF PROFITABLE)

### Prerequisites for Live Trading:

1. **✅ Paper traded for 3+ months**
2. **✅ Consistently profitable** (>55% win rate, >10% monthly ROI)
3. **✅ Understand ICC strategy completely**
4. **✅ Comfortable with potential losses**
5. **✅ Only using money you can afford to lose**

### Step 1: Create Binance Account

1. Go to https://www.binance.com
2. Click "Register"
3. Complete KYC verification
4. Enable 2FA (two-factor authentication) **REQUIRED FOR SECURITY!**

### Step 2: Deposit Funds

**Start VERY Small:**
- Minimum: 300 PHP ($5.40 USD)
- Recommended: 500 PHP ($9.00 USD)
- **DO NOT** deposit more than you can afford to lose

**How to Deposit:**
1. Go to Binance → Wallet → Fiat and Spot
2. Click "Deposit"
3. Choose USDT (Tether - stablecoin)
4. Use P2P trading or bank transfer (depends on Philippines options)

### Step 3: Get API Keys

**⚠️ CRITICAL SECURITY STEPS:**

1. Go to Binance → Account → API Management
2. Click "Create API"
3. **Security Settings (VERY IMPORTANT):**
   - ✅ Enable "Spot & Margin Trading"
   - ❌ **DO NOT** enable "Futures"
   - ❌ **DO NOT** enable "Withdrawals"
   - ✅ Enable "IP Access Restrictions" (optional but recommended)
   - ✅ Enable 2FA verification
4. Save your API Key and Secret **securely**
   - **NEVER share these with anyone**
   - **NEVER commit them to git**
   - Store them in a password manager

### Step 4: Configure Live Trading

Edit your `.env` file:

```env
# ⚠️ LIVE TRADING MODE - REAL MONEY!
TRADING_MODE=live

# YOUR BINANCE API KEYS
BINANCE_API_KEY=your_actual_api_key_here
BINANCE_API_SECRET=your_actual_secret_here

# TRADING PAIR
TRADING_PAIR=SOL/USDT

# INITIAL CAPITAL (your actual Binance balance will be used)
# This is just for reference
INITIAL_CAPITAL_USDT=10

# ... rest of configuration same as paper trading
```

### Step 5: Test with Testnet FIRST (Optional but Recommended)

Binance offers a testnet (practice environment):

```env
TRADING_MODE=live
BINANCE_TESTNET=true
BINANCE_API_KEY=testnet_key
BINANCE_API_SECRET=testnet_secret
```

Get testnet keys from: https://testnet.binance.vision/

### Step 6: Run Live Trading

**⚠️ FINAL WARNING: REAL MONEY!**

```bash
npm run live
```

You'll see:

```
⚠️  WARNING: LIVE TRADING MODE ENABLED!
Real money will be used. Make sure you know what you are doing!

Starting in 5 seconds... Press Ctrl+C to cancel
```

**You have 5 seconds to cancel if you're not ready!**

### Step 7: Monitor Closely

**First Live Trading Session:**
- ✅ Watch the bot continuously
- ✅ Check every trade execution
- ✅ Verify orders on Binance
- ✅ Be ready to stop the bot if something seems wrong
- ✅ Start with 1-2 trades maximum

**After First Session:**
- Review all trades on Binance
- Compare paper trading vs live trading results
- Check for slippage, execution issues
- Verify fees are as expected

---

## 🔧 Troubleshooting

### Bot Won't Start

**Error: `Cannot find module 'ccxt'`**
- Solution: Run `npm install`

**Error: `Invalid API key`**
- Solution: Check your `.env` file, make sure API keys are correct

**Error: `Insufficient balance`**
- Solution: Deposit more USDT to your Binance spot wallet

### No Trades Happening

**Bot shows "WAITING" for hours:**
- This is normal! ICC strategy is **selective**
- Expect only 1-5 trades per day (not 100+)
- ICC waits for high-quality setups
- Be patient - quality over quantity

**Bot shows levels as "undefined":**
- Not enough historical data yet
- Wait 10-15 minutes for candles to build up
- Bot needs at least 11 candles (SWING_PERIOD * 2 + 1)

### Position Not Closing

**Position held for 24 hours:**
- Check TIME_LIMIT setting
- Manually close with `Ctrl+C` (bot will auto-close on shutdown)

**Stop loss not triggering:**
- Check if price actually hit stop loss level
- Verify STOP_LOSS_PERCENT is set correctly

---

## 📈 Optimizing Performance

### Recommended Settings for Philippines (300-500 Peso Capital)

**Best Coins for Low Capital:**
- SOL/USDT (Solana - recommended)
- XRP/USDT (Ripple)
- MATIC/USDT (Polygon)
- DOGE/USDT (Dogecoin)

**Why These?**
- Low price per coin = can buy fractional amounts
- High liquidity = easy entry/exit
- Lower fees vs Bitcoin/Ethereum

### Adjusting Parameters

**More Conservative (Lower Risk):**
```env
PROFIT_TARGET_PERCENT=0.03      # 3% target (higher)
STOP_LOSS_PERCENT=0.01          # 1% stop (tighter)
POSITION_SIZE_PERCENT=0.80      # 80% of capital (less aggressive)
```

**More Aggressive (Higher Risk):**
```env
PROFIT_TARGET_PERCENT=0.02      # 2% target (lower)
STOP_LOSS_PERCENT=0.015         # 1.5% stop (wider)
POSITION_SIZE_PERCENT=0.98      # 98% of capital (more aggressive)
```

**Faster Trading (More Trades):**
```env
CANDLE_TIMEFRAME=1m             # 1-minute candles (vs 5m)
SWING_PERIOD=3                  # Smaller swing detection (vs 5)
```

**Slower Trading (Higher Quality):**
```env
CANDLE_TIMEFRAME=15m            # 15-minute candles (vs 5m)
SWING_PERIOD=7                  # Larger swing detection (vs 5)
```

---

## 🎓 Learning Resources

### Understanding ICC Strategy

Read the complete guide:
```bash
cat ICC_STRATEGY_GUIDE.md
```

### Trade by Sci (Strategy Creator)

- **TikTok**: @sci.mindset
- **YouTube**: Search "Trade by Sci ICC Method"
- **TradingView**: Search "ICC Trading System"

### Recommended Learning Path

1. **Week 1-2**: Read ICC_STRATEGY_GUIDE.md, watch Trade by Sci videos
2. **Week 3-4**: Run paper trading, observe ICC phases
3. **Month 2-3**: Continue paper trading, track results
4. **Month 4+**: If profitable, consider live trading with minimal capital

---

## 🆘 Getting Help

### Check Logs

The bot logs all activity to console. Look for:
- Errors (red text)
- Warnings (yellow text)
- Trade entries/exits (green/red text)

### Common Issues

**"No valid setups"**
- Normal! ICC is selective
- Try different symbols (SOL, XRP, MATIC)
- Try different timeframes (5m vs 15m)

**"Losing money consistently"**
- Review ICC strategy guide
- Check if setup rules are correct
- Consider different parameters
- Market conditions may not suit ICC right now

### Support

- **GitHub Issues**: https://github.com/Jeeeiiiiiii/crypto-trading-bot/issues
- **Documentation**: ICC_STRATEGY_GUIDE.md
- **Community**: Join crypto trading Discord servers (search for "ICC trading")

---

## ✅ Pre-Flight Checklist

Before running live trading:

- [ ] Completed 3+ months of profitable paper trading
- [ ] Win rate >55% after fees
- [ ] Understand all 3 ICC phases completely
- [ ] Read all warnings and disclaimers
- [ ] Only using money I can afford to lose
- [ ] Binance account created and verified
- [ ] 2FA enabled on Binance
- [ ] API keys created with correct permissions (no withdrawals!)
- [ ] API keys stored securely
- [ ] `.env` file configured correctly
- [ ] Tested on testnet first (optional but recommended)
- [ ] Ready to monitor bot closely for first session
- [ ] Understand I can lose everything

**If you checked all boxes, you're ready. Good luck!**

---

## 📝 Final Thoughts

### The Reality of Trading

**Even with a good strategy:**
- You will have losing streaks
- Markets change and strategies stop working
- Fees and slippage eat into profits
- Most retail traders lose money

**ICC Strategy helps by:**
- Reducing false breakout entries
- Waiting for high-probability setups
- Having clear entry and exit rules
- Better risk-to-reward ratios

**But it's not a money printer:**
- Patience is required (few trades per day)
- Discipline is essential (follow the rules!)
- Losses will happen (manage risk!)
- Continuous learning is necessary

### Success Tips

1. **Start small** - 300-500 PHP is enough
2. **Paper trade first** - No shortcuts!
3. **Keep a journal** - Track every trade
4. **Study the losses** - Learn from mistakes
5. **Be patient** - ICC is not scalping
6. **Don't revenge trade** - Stick to the strategy
7. **Take breaks** - Don't overtrade
8. **Never risk more than 1-2%** - Per trade
9. **Accept losses** - They're part of trading
10. **Enjoy the process** - Trading is a journey

**Good luck, and trade responsibly!** 🚀

---

*Remember: This is for educational purposes only. Not financial advice. Trade at your own risk.*
