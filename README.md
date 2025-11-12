# Solana Scalping Bot - Low Budget Edition
A browser-based **Solana scalping bot** optimized for **$2-3 budgets** with **REALISTIC FEE AND SLIPPAGE SIMULATION**. For educational use only.

![image](https://github.com/user-attachments/assets/19bd08c6-3de3-482e-b108-f9fdf688ce91)

I asked AI to build a trading bot for small budgets — and it actually works.

## 🎯 Optimized for Small Budget Solana Scalping

This bot is specifically designed for:
- **Solana (SOL)** trading on DEXs
- **$2-3 trading budget** (perfect for beginners)
- **Realistic DEX fees** (0.25% per trade)
- **Slippage simulation** (0.15% average)
- **Dynamic position sizing** based on your budget

## ⚠️ WHY SOLANA? The Fee & Budget Reality

Most crypto scalping bots fail because they ignore the **brutal math** of trading costs:

### The Problem with Traditional Scalping:
- **High-frequency trading** = lots of trades = lots of fees
- With 0.25% DEX fees + 0.15% slippage = **0.8% round-trip cost**
- For a $100 position: $0.80 in costs per trade
- Need **>0.8% profit** just to break even!

### Why Solana Solves This:
1. **Ultra-low blockchain fees** (~$0.00025 per transaction, essentially free)
2. **High liquidity** on DEXs like Jupiter and Raydium
3. **Fast execution** (400ms block times)
4. **Small budget friendly** - you can trade with $2-3 effectively
5. **Dynamic position sizing** - bot calculates exact SOL quantity based on your budget

### What This Bot Does Differently:
1. **Realistic cost simulation** - includes both DEX fees (0.25%) AND slippage (0.15%)
2. **Higher profit targets** (1.2% vs traditional 0.08%) to ensure profitability
3. **Budget-based sizing** - automatically calculates position size from your $2-3 budget
4. **Wider stops** (0.6%) to avoid getting stopped out by normal volatility
5. **Reduced trade frequency** - only trades on stronger momentum signals
6. **Full transparency** - shows gross P&L, fees, slippage, and net P&L separately

---

## 🚀 Quick Start Guide

### Step 1: Configure Your Budget (Optional)

The bot defaults to a **$3 budget**. To change this, edit line 44 in `crypto-trading-bot.js`:

```javascript
const TRADING_BUDGET = 3.0;  // Change to your desired budget ($2-3 recommended)
```

### Step 2: Run the Bot

1. **Navigate to Webull Crypto**: Go to [https://app.webull.com/crypto](https://app.webull.com/crypto)

2. **Open SOL/USD Chart**: Search for "SOL" and open the SOL/USD trading pair

3. **Open Developer Console**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K`

4. **Paste the Bot Script**:
   - Copy the entire contents of `crypto-trading-bot.js`
   - Paste it into the console and press Enter

5. **Start Trading**:
   - The bot UI overlay will appear in the top-right corner
   - Click the **START** button to begin monitoring prices
   - The bot will automatically execute trades based on momentum

6. **Keep the Tab Active**:
   - The bot uses real-time DOM updates
   - Keep the browser and tab open while the bot is running

### ⚠️ Troubleshooting

**"ERROR: Price element not found"**

If you see this error, the page structure may have changed. The bot uses this XPath to find the price:
```
//*[@id="app"]/main/section/div[2]/div[1]/div/div[2]/div[1]/div[2]/div/div/span[2]
```

To fix:
1. Right-click the SOL price on the page
2. Select "Inspect" or "Inspect Element"
3. Right-click the highlighted element in DevTools
4. Select "Copy" → "Copy XPath"
5. Update line 50 in the script with the new XPath

**Bot not trading?**

- Make sure you clicked START
- Check that the "Current Price" is updating (confirms price feed is working)
- The bot needs 20 price ticks before it starts analyzing momentum
- Try adjusting `MOMENTUM_THRESHOLD` (line 67) to a lower value like `0.0001` for more frequent trades

---

## 🧠 Strategy & Parameters

### Core Strategy:
- **Momentum-based scalping** - Trades when short-term momentum diverges from longer-term average
- **Dynamic position sizing** - Automatically calculates SOL quantity based on your budget
- **Conservative entry signals** - Only trades on 0.02% momentum shifts (reduces overtrading)
- **Protective stops** - 0.6% stop loss to limit downside while accounting for volatility
- **Trailing stops** - 0.3% trailing stop to lock in profits as price moves favorably
- **Time limits** - Maximum 120 seconds per trade to enforce scalping discipline

### Trading Parameters for $2-3 Budget:

| Parameter | Value | Why This Matters |
|-----------|-------|------------------|
| **Budget** | $3.00 | Your capital per trade |
| **DEX Fee** | 0.25% | Realistic Jupiter/Raydium fee |
| **Slippage** | 0.15% | Average slippage for small orders |
| **Total Cost** | 0.8% round-trip | 0.4% entry + 0.4% exit |
| **Profit Target** | 1.2% | Ensures profitability after 0.8% costs |
| **Stop Loss** | 0.6% | Limits losses while avoiding noise |
| **Trailing Stop** | 0.3% | Locks in gains progressively |
| **Position Hold** | 120 sec max | Forces quick scalping discipline |

### Real Example with $3 Budget:

Assuming SOL at $150:
- **Position Size**: $3 / $150 = 0.02 SOL
- **Entry Costs**: $3 × 0.4% = $0.012
- **Exit Costs**: ~$3 × 0.4% = $0.012
- **Total Costs**: $0.024 per trade
- **Profit Target**: $3 × 1.2% = $0.036
- **Net Profit**: $0.036 - $0.024 = **$0.012 per winning trade**

> With a 50% win rate and equal stop losses, you'd need about 30 trades to make $1 in profit. The bot is designed for **learning** how fees impact profitability, not get-rich-quick trading!

---

## 💰 Profitability Analysis - The Honest Truth

### Can You Actually Profit with $2-3?

**Short answer**: It's extremely challenging, but possible with the right conditions.

### Expected Performance (Conservative Estimates)

```
Assumptions:
- $3 budget per trade
- SOL at $150 (0.02 SOL position)
- DEX fee: 0.25% + Slippage: 0.15% = 0.4% per side
- Total round-trip cost: 0.8%
- Win rate: 50% (optimistic)

Per Winning Trade:
- Profit target: 1.2% of $3 = $0.036
- Total costs: 0.8% of $3 = $0.024
- Net profit: $0.036 - $0.024 = $0.012 ✅

Per Losing Trade (stop loss at 0.6%):
- Loss: 0.6% of $3 = -$0.018
- Total costs: 0.8% of $3 = -$0.024
- Net loss: -$0.018 - $0.024 = -$0.042 ❌

Expected Value per Trade (50% win rate):
EV = (0.50 × $0.012) + (0.50 × -$0.042)
EV = $0.006 - $0.021 = -$0.015 per trade

Still slightly negative! 😬
```

### 🎯 What You'd Need to Be Profitable:

To achieve positive expected value with this setup:

| Scenario | Win Rate Required | Expected Profit per Trade |
|----------|------------------|---------------------------|
| **Current (1.2% target)** | 58%+ | Break even at 58%, profit above |
| **Tighter 1.5% target** | 53%+ | Easier to profit, harder to hit |
| **Aggressive 2.0% target** | 47%+ | Lower win rate needed, but moves are rare |

**Best Case Scenario** (60% win rate):
- 100 trades = 60 wins × $0.012 + 40 losses × -$0.042
- Net: $0.72 - $1.68 = **-$0.96** 😞

**Optimistic Scenario** (65% win rate, 1.5% profit target):
- Net profit per win: ~$0.021
- Net loss per loss: ~$0.042
- 100 trades = 65 × $0.021 + 35 × -$0.042
- Net: $1.365 - $1.47 = **-$0.105** (almost break even!)

### 💡 Key Insights:

1. **Fees are brutal** - With $3 positions, 0.8% costs = $0.024 per trade
2. **You need high win rate** - 60%+ to have a chance at profitability
3. **Small profits add up slowly** - Even with good performance, expect pennies per trade
4. **Compounding helps** - If you start with $3 and grow to $10, costs stay similar but profits increase
5. **This is educational** - Perfect for learning fee impact without risking real money!

### 🎓 What You'll Learn:

- How trading costs destroy high-frequency strategies
- Why most retail traders lose money (fees + slippage)
- The importance of win rate and profit targets
- How position sizing affects absolute returns
- Why institutional traders need massive volume to profit

> **Educational Value > Profit**: This bot teaches you the harsh reality of crypto trading costs. Use it to understand the math before risking real money!

---

## 📊 UI Features

The bot overlay displays:

### Main Dashboard:
- **Current SOL Price** - Real-time price updates
- **Bot Status** - STOPPED / RUNNING / POSITION_OPEN
- **Position Info**:
  - Type (LONG/SHORT)
  - Quantity in SOL and USD value
  - Entry price vs current price
  - Current P&L in dollars and percentage
  - Your trading budget

### Performance Metrics:
- **Gross P&L** - Profit before costs (gray)
- **Total Fees** - Cumulative DEX fees (orange)
- **Total Slippage** - Cumulative slippage costs (orange)
- **Total Costs** - Combined fees + slippage with % of profit
- **Net P&L** - Real profit after all costs (green/red, bold)
- **Trade Count** - Total trades executed
- **Win Count** - Wins before costs vs wins after costs
- **Win Rate** - Percentage before vs after costs

### Trade Log:
Each trade shows:
- Timestamp
- Trade type (LONG/SHORT)
- Entry → Exit prices
- Gross P&L (before costs)
- Total costs (fees + slippage, orange)
- Net P&L (after costs, bold green/red)
- Exit reason (PROFIT, STOP_LOSS, TIME_LIMIT, MANUAL)

### Controls:
- **START** - Begin monitoring prices and trading
- **STOP** - Pause the bot (keeps any open position)
- **CLOSE** - Manually close current position

---

## 🔧 Customization & Improvements

### Easy Customizations:

**Adjust Your Budget** (Line 44):
```javascript
const TRADING_BUDGET = 5.0;  // Increase to $5 for slightly higher profits
```

**Change Profit Target** (Line 58):
```javascript
profitTargetPercent: 0.015,  // 1.5% target (higher = fewer trades, more profit per win)
```

**Adjust Trading Frequency** (Line 67):
```javascript
const MOMENTUM_THRESHOLD = 0.0001;  // Lower = more trades, higher = fewer trades
```

**Modify Fees** (Lines 53-54):
```javascript
exchangeFeePercent: 0.002,   // 0.2% if you have lower fee tier
slippagePercent: 0.001,      // 0.1% if trading during high liquidity
```

### Ideas for Advanced Improvements:

- **Multi-indicator signals** - Add RSI, MACD, or volume filters
- **Volatility-based position sizing** - Adjust budget based on ATR
- **Time-of-day filters** - Only trade during high liquidity hours
- **Trend filters** - Only take longs in uptrends, shorts in downtrends
- **Risk management** - Stop trading after X consecutive losses
- **Backtesting mode** - Test against historical data
- **Multi-timeframe analysis** - Check higher timeframes before entry

> Fork this repo, experiment with parameters, and share your findings!

---

---

## ⚠️ Disclaimer & Educational Purpose

### This Bot is for EDUCATION ONLY

**DO NOT trade real money with this bot!**

This is a **simulation tool** designed to teach you about:
- How trading fees impact profitability
- The difficulty of scalping with small capital
- The importance of win rate vs profit targets
- Why most retail traders lose money
- How to calculate trading costs properly

### Important Warnings:

1. **This is NOT connected to real DEXs** - It only simulates trades based on Webull price data
2. **Simulated profits ≠ real profits** - Real execution has additional costs (spread, liquidity, gas)
3. **Browser-based limitations** - Not suitable for actual trading (can't execute real orders)
4. **No guarantees** - Past performance doesn't predict future results
5. **Educational only** - This is not financial advice

### Why This Exists:

Most people don't realize how much fees eat into profits. This bot lets you:
- See the real cost of trading with small capital
- Understand why scalping is so difficult
- Learn about fees and slippage without losing real money
- Experiment with different parameters safely

**Use this to learn, not to trade!**

---

## 📎 License

MIT License - Free for educational use.

**Remember**: Even if you see "profits" in the simulation, those would likely not translate to real trading due to execution costs, spread, market impact, and other real-world factors. Always paper trade extensively and understand the risks before trading real money.

---

## 🔗 Credits

Inspired by the crypto trading bot community and built to educate about the harsh reality of trading costs.

Brought to you by the open-source community. Fork, improve, and share your learnings!


