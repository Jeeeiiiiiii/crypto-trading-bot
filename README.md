# crypto-trading-bot
A browser-based scalping bot for **STOCKS and CRYPTO** with **REAL FEE CALCULATIONS** and support for **LOW-FEE COINS**. For educational use only.

![image](https://github.com/user-attachments/assets/19bd08c6-3de3-482e-b108-f9fdf688ce91)

I asked AI to build a trading bot — and it actually worked.

## 🆕 Now Supports Stocks AND Crypto!

The bot now works on both:
- **Stocks**: https://app.webull.com/stocks (Default configuration)
- **Crypto**: https://app.webull.com/crypto (Uncomment crypto config in code)

> In just **36 hours**, it executed **7,328 simulated trades**
> with a **40.60% win rate** and generated **$566.07 in profit**
> **(BUT that's before fees!)**

This was created as a raw experiment by simul8or.
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

## 🧠 Strategy

- **Momentum-based** scalping logic
- **Tight trailing stops** to secure profits quickly
- **Higher profit targets** (0.25% vs 0.08%) to account for fees
- **Real fee calculations** (0.1% entry + 0.1% exit = 0.2% total)
- Works best on **liquid, low-fee coins** like SOL, XRP, XLM

### Updated Parameters (vs Original ETH Bot)

| Parameter | Original (ETH) | Updated (Low-Fee Coins) | Why Changed |
|-----------|---------------|------------------------|-------------|
| Profit Target | 0.08% | **0.25%** | Must exceed 0.2% in fees |
| Stop Loss | 0.04% | **0.12%** | Wider to avoid fee-heavy losses |
| Trailing Stop | 0.02% | **0.06%** | Better profit protection |
| Fee Tracking | ❌ None | ✅ **Full tracking** | Shows real profitability |

> Note: The bot displays both GROSS P&L (before fees) and NET P&L (after fees) so you can see the true impact of trading costs.

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

## 🤖 Fork It. Tweak It. Evolve It.

This is open for anyone to improve. Add new indicators, rework the logic, or run it on other tickers.

**Ideas for improvement:**
- Support for custom exchange fee rates
- Bid-ask spread simulation
- Slippage modeling
- Position sizing optimization
- Better entry signals (RSI, MACD, volume)
- Backtesting mode with historical data

> Drop your variants via issue or pull request — we might feature them on the main site.

---

## 🔗 Related Project

Brought to you by [simul8or](https://simul8or.com) — a browser-based trading simulator with chart replay, real-time feeds, and AI tools for traders.

---

## 📎 License

MIT – for educational use only. This is not financial advice. Do not use with real money.

**Remember**: This bot shows that even a "profitable" trading strategy can lose money after accounting for fees. Always factor in trading costs before live trading!


