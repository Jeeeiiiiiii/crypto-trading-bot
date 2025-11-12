# crypto-trading-bot
A browser-based crypto scalping bot built with help from AI. For educational use only.

![image](https://github.com/user-attachments/assets/19bd08c6-3de3-482e-b108-f9fdf688ce91)

I asked AI to build a crypto trading bot — and it actually worked.

> In just **36 hours**, it executed **7,328 simulated trades**  
> with a **40.60% win rate** and generated **$566.07 in profit**  
> (no fees, spreads, or slippage).

This was created as a raw experiment by simul8or.  
It runs entirely in the browser — no installs, no API keys — just paste and go.

---

## 🚀 Try It Yourself

1. Go to [https://app.webull.com/stocks](https://app.webull.com/stocks)
2. Open the ETH/USD chart
3. Open your browser’s **Dev Console**
4. Paste in the script from `crypto-trading-bot.js`
5. Keep the tab **active** — the bot uses real-time DOM updates

> 🔔 You must keep the browser and tab open or it will stop receiving price updates.

---

## 🧠 Strategy

- Momentum-based logic
- Tight trailing stops to secure profits quickly
- Works best on volatile assets like ETH
- Script is easily tweakable to support stocks like NVDA or TSLA

> Note: You’ll see "stop loss" in the logs, but many are profitable exits due to trailing stops. Logging quirks.

---

## 🤖 Fork It. Tweak It. Evolve It.

This is open for anyone to improve. Add new indicators, rework the logic, or run it on other tickers.

> Drop your variants via issue or pull request — we might feature them on the main site.

---

## 🔗 Related Project

Brought to you by [simul8or](https://simul8or.com) — a browser-based trading simulator with chart replay, real-time feeds, and AI tools for traders.

---

## 📎 License

MIT – for educational use only. This is not financial advice. Do not use with real money.


