# 🔐 Self-Sovereign Identity (SSI) Credential Exchange App

A full-stack demo application for **issuing, holding, and verifying verifiable credentials (VCs)** using **decentralized identifiers (DIDs)** on the **bcovrin:test** ledger.

This project simulates a real-world SSI ecosystem with two interacting agents:

- ✅ **Acme** – *Issuer & Verifier*  
- ✅ **Bob** – *Credential Holder*

Built with the **Hyperledger Aries framework**, **AnonCreds**, and the **Credo Agent SDK**.

---

## 🚀 Features

| Module | Description |
|--------|-------------|
| 🧱 **Agents** | Initialize Acme (Issuer) and Bob (Holder) agents |
| 🤝 **Connections** | Create and receive DID-based Out-of-Band invitations |
| 🆔 **DID Management** | Generate and register DIDs on the Indy `bcovrin:test` network |
| 📄 **Schema & Credential Definition** | Register schemas and credential definitions as an authorized issuer |
| 🎓 **Credential Issuance** | Issue credentials to Bob with customizable attributes |
| 📥 **Credential Storage** | Bob accepts and stores credentials in his wallet |
| ✅ **Proof Requests** | Acme requests verification of specific credential attributes |
| 🔍 **Proof Verification** | Bob presents credentials, and Acme verifies the proof manually |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | NestJS, Credo SDK (`@credo-ts/core`), TypeScript |
| **Ledger** | Hyperledger Indy (`bcovrin:test`) |
| **Wallet** | Askar / AnonCreds |
| **Transport** | HTTP + WebSocket (DIDComm v2) |

---

## 📦 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or v18 recommended)
- [npm](https://www.npmjs.com/)
- Internet access to connect with the public **bcovrin:test** ledger

---

## 🧑‍💻 Getting Started

### 🗂️ Clone the Repository

```bash
git clone https://git@github.com:vigneshjraju/soulverse_tasks.git
cd ssi-app
```

---

### ▶️ Start the Backend

```bash
cd backend
npm install
npm run start:dev
```

This will start the **NestJS** backend and initialize two agents:

- **Acme Agent** → `http://localhost:3002`
- **Bob Agent** → `http://localhost:3003`

The backend logs will display agent startup details, DIDComm transport info, and ledger registration events.

---

### 💻 Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 SSI Flow (Step-by-Step)

1. Initialize **Acme** and **Bob** agents  
2. Establish a connection using **Out-of-Band (OOB)** invitations  
3. Generate a **DID + Seed** from the DID Management page using `bcovrin:test`  
4. Register DID as **Acme (Issuer)**  
5. Register **Schema** defining credential attributes (e.g., *Name*, *Email*, *Role*)  
6. Create and register a **Credential Definition**  
7. **Acme issues** credential to **Bob**  
8. **Bob accepts** and stores credential in wallet  
9. **Acme requests proof** of attributes  
10. **Bob presents proof**  
11. **Acme verifies** proof manually  

---

## 📸 Video Demo

> 🎥 Watch the full demo walkthrough of the SSI Credential Exchange App:

[![Watch the demo video](https://img.youtube.com/vi/jyU2lX69-II/maxresdefault.jpg)](https://www.youtube.com/watch?v=jyU2lX69-II)

Or open directly: [https://www.youtube.com/watch?v=jyU2lX69-II](https://www.youtube.com/watch?v=jyU2lX69-II)

## 📚 Learn More

- [Hyperledger Indy](https://www.hyperledger.org/use/hyperledger-indy)  
- [Hyperledger Aries](https://www.hyperledger.org/use/hyperledger-aries)  
- [bcovrin:test Ledger Explorer](https://indyscan.io/ledger/bcovrin-test)  
- [Credo Agent SDK](https://github.com/openwallet-foundation/credo-ts)  
- [AnonCreds Specification](https://hyperledger.github.io/anoncreds-spec/)

---

## 🤝 Contributing

Pull requests are welcome! You can contribute by improving:

- UI/UX design  
- Credential revocation features  
- Schema & Tag management  
- Agent connection history & activity logs  

---

## 📝 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.