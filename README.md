<div align="center">

# 🔐 CRYPTA SHIELD

### Secure Identity • Access Control • Digital Asset Management

A blockchain-powered platform for secure digital identity,
role-based access control, and trusted digital asset management.

<br>

![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger-Fabric-2F3134?style=for-the-badge&logo=hyperledger&logoColor=white)
![Blockchain](https://img.shields.io/badge/Blockchain-Permissioned-6C63FF?style=for-the-badge)

</div>

---

## 📖 Introduction

**Crypta Shield** is a secure digital platform that combines identity
management, access control, cryptographic verification, and
blockchain-based digital asset management.

The platform is designed around a simple idea: identity, permissions,
digital assets, ownership, and important transactions should be managed
through a secure and traceable workflow.

Crypta Shield uses different technologies for different responsibilities:

- **DID and cryptography** for digital identity
- **RBAC** for access control
- **MySQL** for application data and metadata
- **SHA-256** for file integrity verification
- **NFTs** for unique digital asset representation
- **Hyperledger Fabric** for trusted transaction records
- **Chaincode** for blockchain business logic

---

# 🎯 Project Overview

Digital platforms commonly need to manage three important areas:

```text
              ┌──────────────────┐
              │     IDENTITY     │
              │  Who is the user?│
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │      ACCESS      │
              │ What can they do?│
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │      ASSETS      │
              │ What do they own?│
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   TRANSACTIONS   │
              │ What happened?   │
              └──────────────────┘
              Crypta Shield connects these areas into one platform.

A user can register, complete verification, receive an identity and role,
and access only the functionality permitted by that role.

Authorized users can create digital assets, generate file fingerprints,
associate assets with NFTs, transfer ownership, and track important
transactions.

❗ Problem

Managing identities, permissions, and digital assets through traditional
centralized applications can create several challenges.

Identity Management

Organizations may need to manage a large number of user identities,
verification records, and access permissions.

Access Control

Different users require different levels of access. Giving every user
the same permissions can increase the risk of unauthorized operations.

Digital Asset Ownership

When digital assets are transferred between users, maintaining a clear
and traceable ownership history can become difficult.

File Integrity

A digital file may be modified after it is uploaded. A mechanism is
needed to verify whether the file content has changed.

Transaction History

Important activities need to be traceable so that authorized users can
review what happened during the lifecycle of an asset.

💡 Solution

Crypta Shield addresses these requirements through a combination of
identity, access control, application storage, cryptography, and
permissioned blockchain technology.

                 ┌─────────────────────┐
                 │        USER         │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Identity + DID   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │        RBAC         │
                 │ Roles & Permissions │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Digital Assets    │
                 └──────────┬──────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
           ┌──────────────┐   ┌──────────────┐
           │ SHA-256 Hash │   │     NFT      │
           └──────┬───────┘   └──────┬───────┘
                  │                  │
                  └────────┬─────────┘
                           ▼
                 ┌─────────────────────┐
                 │ Hyperledger Fabric  │
                 │    + Chaincode      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Transactions / Audit│
                 └─────────────────────┘
✨ Core Features
Feature	Purpose
🔐 Identity Management	Manage authorized platform identities
🪪 DID	Associate identities with decentralized identifiers
📧 OTP Verification	Verify users during registration
🛡️ RBAC	Control access according to assigned roles
📦 Digital Asset Management	Create and manage digital assets
#️⃣ SHA-256	Generate file integrity fingerprints
🎨 NFT	Provide unique digital representation of assets
⛓️ Hyperledger Fabric	Maintain trusted transaction records
📜 Chaincode	Define blockchain asset operations
🔄 Asset Transfer	Transfer digital asset ownership
📊 Transaction History	Track important asset operations
📝 Audit Trail	Monitor important platform activities
🔐 Identity Management

Identity management is one of the core modules of Crypta Shield.

The platform provides a workflow through which users can register and
complete verification before receiving access to the system.

Registration Flow
User Registration
       │
       ▼
Basic Information
       │
       ▼
OTP Sent to Email
       │
       ▼
OTP Verification
       │
       ▼
Account Verification
       │
       ▼
Identity Management
       │
       ▼
DID + Role Assignment
       │
       ▼
Platform Access

This separates registration from authorization.

A registered user does not automatically receive unrestricted access.
Identity and role management determine what functionality the user can
access.

🪪 Decentralized Identity

Crypta Shield uses Decentralized Identity (DID) as part of its
identity workflow.

A DID provides a unique identifier associated with an identity.

Cryptographic mechanisms are also used during identity verification.

User
  ↓
Identity
  ↓
DID
  ↓
Cryptographic Verification
  ↓
Authorized Access

This creates a structured identity workflow before users interact with
protected platform functionality.

🛡️ Role-Based Access Control

Crypta Shield implements Role-Based Access Control (RBAC).

Instead of giving every user the same permissions, the platform assigns
a role and provides access according to that role.

👑 Admin

The Admin manages the administrative side of the platform.

Main responsibilities:

Identity management
Role management
User authorization
Access permissions
🧑‍💼 Manager

The Manager focuses on digital asset operations.

Main capabilities:

Create digital assets
Manage assets
View asset information
Transfer ownership
🔎 Auditor

The Auditor focuses on monitoring and verification.

Main capabilities:

View transactions
Monitor activities
Review audit information
Verify recorded operations
👤 User

The User receives limited access based on assigned permissions.

The User can access the modules made available for the assigned role,
while administrative functionality remains restricted.

👥 Role & Permission Model
                         ┌─────────────┐
                         │    ADMIN    │
                         └──────┬──────┘
                                │
                   Identity + Role Management
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
     ┌─────────┐          ┌───────────┐         ┌─────────┐
     │ MANAGER │          │  AUDITOR  │         │  USER   │
     └────┬────┘          └─────┬─────┘         └────┬────┘
          │                     │                    │
          ▼                     ▼                    ▼
       Assets              Monitoring           Permitted
       & Transfer          & Verification        Features

This role-based approach restricts users from accessing administrative
functions outside their responsibilities.

📦 Digital Asset Management

Digital Asset Management is one of the main functional modules of the
platform.

Authorized users can register digital assets by providing relevant
information and uploading supported files.

An asset can contain information such as:

Asset ID
Description
Category
Current Owner
NFT ID
Asset Status
File information
Hash information
📤 Asset Creation Workflow
             Upload File
                 │
                 ▼
        Enter Asset Details
                 │
                 ▼
          Generate SHA-256
                 │
                 ▼
           Create Asset
                 │
                 ▼
          Generate NFT
                 │
                 ▼
       Blockchain Transaction
                 │
                 ▼
          Asset Registered

The application processes the uploaded file through the backend while
relevant asset information is maintained through the application and
blockchain layers.

#️⃣ SHA-256 File Integrity

Crypta Shield generates a SHA-256 cryptographic hash for uploaded
digital files.

A hash can be considered a digital fingerprint of the file.

       Original File
             │
             ▼
          SHA-256
             │
             ▼
     Digital Fingerprint

If the contents of a file are changed, the resulting SHA-256 hash also
changes.

This provides a mechanism for comparing hash values and detecting
changes in file content.

Example
Original File
     ↓
  SHA-256
     ↓
   Hash A


Modified File
     ↓
  SHA-256
     ↓
   Hash B

Hash A ≠ Hash B

Therefore, the hash can be used as part of the file integrity
verification process.

🎨 NFT-Based Digital Asset Representation

Crypta Shield uses NFTs (Non-Fungible Tokens) as a unique digital
representation of registered assets.

An asset can be associated with a unique NFT identifier.

Digital Asset
      │
      ▼
    NFT ID
      │
      ▼
Ownership Information
      │
      ▼
Transaction History

The NFT layer provides a unique representation that can be associated
with the asset's ownership information.

⛓️ Hyperledger Fabric

Crypta Shield uses Hyperledger Fabric as a permissioned blockchain
network.

A permissioned blockchain operates with known and authorized
participants.

The blockchain layer is used for important asset and ownership
operations where a trusted and traceable transaction record is required.

Fabric Configuration
Channel:
crypta-channel

Chaincode:
crypta-contract

Organizations:
Org1MSP
Org2MSP

Gateway Peer:
peer0.org1.example.com

The application communicates with the Fabric network through the
Fabric Gateway.

📜 Smart Contract / Chaincode

Chaincode contains the business logic executed on the Hyperledger
Fabric network.

In Crypta Shield, Chaincode manages important asset operations.

Main Operations
CreateAsset
ReadAsset
UpdateAsset
TransferAsset
GetAllAssets
GenerateFileHash

The Chaincode defines the blockchain-side rules for these operations.

🔄 Asset Ownership Transfer

A Manager can transfer ownership of a registered asset to another
registered user.

Current Owner
      │
      │ Transfer Request
      ▼
Recipient DID
      │
      ▼
Ownership Update
      │
      ▼
Blockchain Transaction
      │
      ▼
Transaction History

After a successful transfer, the current owner information is updated
and the transfer operation becomes part of the transaction history.

📜 Transaction History

Crypta Shield provides transaction information for important asset
operations.

Transaction records can contain information such as:

Operation type
Transaction ID
Timestamp
Status
Asset-related information

Example operations:

Asset Creation
      ↓
NFT Minting
      ↓
Ownership Transfer
      ↓
Other Important Operations

This makes the asset lifecycle easier to trace.

📝 Audit Trail

The Audit Trail provides visibility into important activities performed
within the platform.

It helps authorized users review activities related to:

Identity management
Role management
Asset operations
Ownership transfers
Transactions

The purpose is to provide a clear history of important actions performed
within the system.

🗄️ Database Architecture

Crypta Shield uses MySQL for application-level data and metadata.

The database and blockchain serve different purposes.

MySQL

MySQL handles application information such as:

User records
Identity-related information
Roles
Asset metadata
Application records
Transaction-related application data
Hyperledger Fabric

Fabric handles important blockchain transactions and ownership records.

                 APPLICATION
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
          MySQL             Fabric
             │                 │
             ▼                 ▼
       Application       Trusted / Tamper-
       Data & Metadata   Resistant Records

Using both layers allows the application database and blockchain to
perform different responsibilities instead of duplicating the same role.

💾 File Storage

The uploaded digital file itself is handled through the backend storage
layer.

The application maintains the file along with relevant metadata and its
SHA-256 hash.

                  Digital File
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        Backend Storage       SHA-256 Hash
             │                   │
             │                   ▼
             │             Integrity Check
             │
             ▼
        File Retrieval

The actual file remains outside the blockchain while its integrity and
relevant asset information can be associated with the blockchain record.

🏗️ System Architecture
                         ┌──────────────────────┐
                         │       FRONTEND       │
                         │      React + Vite    │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │       BACKEND        │
                         │   Node.js + Express  │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
                 ▼                                     ▼
        ┌─────────────────┐                  ┌─────────────────────┐
        │      MySQL      │                  │ Hyperledger Fabric  │
        │                 │                  │                     │
        │ Application     │                  │     Chaincode       │
        │ Data & Metadata │                  │     Transactions    │
        └─────────────────┘                  └─────────────────────┘
🔄 Complete System Workflow
┌──────────────────────────┐
│    User Registration     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│     OTP Verification     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│      Identity + DID      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│     Role Assignment      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│     Role-Based Login     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│  Digital Asset Creation  │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│  SHA-256 Hash Generation │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│       NFT Creation       │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│   Hyperledger Fabric     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Transaction & Audit Trail│
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│   Ownership / Transfer   │
└──────────────────────────┘
🔗 How the Components Work Together

The major components of Crypta Shield work as a layered system.

🎨 Frontend

The React + Vite frontend provides the user interface.

Users interact with:

Registration
Login
Dashboard
Identity Management
Role Management
Asset Management
Transactions
Audit-related information
⚙️ Backend

The Node.js + Express backend acts as the application layer.

It handles:

API requests
Authentication-related operations
Database interaction
File handling
Asset operations
Blockchain interaction
🗄️ MySQL

MySQL stores application-level data and metadata required by the
platform.

⛓️ Blockchain

Hyperledger Fabric handles important blockchain-based operations.

📜 Chaincode

Chaincode defines the business rules for blockchain asset operations.

🛠️ Technology Stack
Layer	Technology	Purpose
🎨 Frontend	React + Vite	User interface
⚙️ Runtime	Node.js	Backend runtime
🌐 API	Express.js	REST API layer
🗄️ Database	MySQL	Application data & metadata
🪪 Identity	DID	Digital identity
🔐 Cryptography	Ed25519 / Cryptographic Verification	Identity verification
#️⃣ Integrity	SHA-256	File fingerprinting
🎨 Ownership	NFT	Digital asset representation
⛓️ Blockchain	Hyperledger Fabric	Trusted transaction records
📜 Smart Contract	Chaincode	Blockchain business logic
📧 Verification	OTP + Email	User verification
📁 Storage	Backend File Storage	Digital file storage
📊 Technology Responsibilities
┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│               React + Vite                  │
│          User Interface & Views             │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                    │
│             Node.js + Express               │
│          APIs + Business Processing         │
└───────────────┬───────────────────┬─────────┘
                │                   │
                ▼                   ▼
       ┌────────────────┐   ┌──────────────────┐
       │     MySQL      │   │ Hyperledger      │
       │                │   │ Fabric           │
       │ App Data       │   │ Blockchain       │
       │ Metadata       │   │ Transactions     │
       └────────────────┘   └────────┬─────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Chaincode   │
                              │ Asset Logic  │
                              └──────────────┘
🔒 Security Architecture

Crypta Shield follows a layered security approach.

                 ┌──────────────────┐
                 │     Identity     │
                 │      + DID       │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │      RBAC        │
                 │ Access Control   │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │  Cryptography    │
                 │   Verification   │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │    SHA-256       │
                 │ File Integrity   │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │ Hyperledger      │
                 │ Fabric           │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │ Transaction &    │
                 │ Audit History    │
                 └──────────────────┘
Layer	Responsibility
Identity	Establish user identity
DID	Provide decentralized identifier
RBAC	Control permissions
Cryptography	Support identity verification
SHA-256	Verify file integrity
Blockchain	Maintain trusted transaction history
Audit	Track important activities
📁 Project Structure
Blockchain-based-project/
│
├── backend/
│   └── Node.js + Express backend
│
├── blockchain/
│   └── Hyperledger Fabric + Chaincode
│
├── frontend/
│   └── React + Vite frontend
│
├── .gitignore
│
└── README.md
🚀 Getting Started
Prerequisites

Before running the project, make sure the development environment has:

Node.js
npm
MySQL
Docker
Hyperledger Fabric
Clone the Repository
git clone <repository-url>
cd Blockchain-based-project
Backend
cd backend
npm install
npm start
Frontend

Open another terminal:

cd frontend
npm install
npm run dev
Blockchain

The blockchain component requires the Hyperledger Fabric environment to
be configured and running.

The application communicates with the Fabric network through the Fabric
Gateway.

Channel:
crypta-channel

Chaincode:
crypta-contract

Organizations:
Org1MSP
Org2MSP
🧩 Application Modules
🏠 Dashboard

Provides an overview of the platform and relevant asset and transaction
information.

👥 Identity Management

Provides administrative functionality for managing registered identities
and their verification status.

🛡️ Role Management

Allows authorized administrators to manage roles and permissions.

📦 Asset Management

Provides functionality for creating, viewing, and managing digital
assets.

🔄 Asset Transfer

Allows authorized users to transfer ownership of registered assets.

📊 Transactions

Displays important blockchain and application transaction information.

📝 Audit Trail

Provides visibility into important activities performed within the
platform.

🧪 Asset Lifecycle
        Asset Created
             │
             ▼
      File Uploaded
             │
             ▼
     SHA-256 Generated
             │
             ▼
        NFT Created
             │
             ▼
    Ownership Assigned
             │
             ▼
   Blockchain Transaction
             │
             ▼
       Asset Available
             │
             ▼
   Ownership Transferred
             │
             ▼
   New Transaction Record
             │
             ▼
       Audit History
🧩 Design Principles
Separation of Responsibilities

Different technologies are used for different purposes rather than
forcing one component to handle everything.

Role-Based Access

Access is determined by user roles and permissions.

Traceability

Important asset and ownership operations can be tracked through
transaction records.

File Integrity

SHA-256 provides a mechanism for detecting changes to uploaded files.

Permissioned Blockchain

Hyperledger Fabric provides a controlled blockchain environment for
authorized participants.

📌 Project Status

The current implementation includes:

✅ React + Vite frontend
✅ Node.js + Express backend
✅ MySQL database integration
✅ User registration
✅ OTP verification
✅ Identity management
✅ DID-based identity workflow
✅ Role-Based Access Control
✅ Admin / Manager / Auditor / User roles
✅ Digital asset management
✅ File upload handling
✅ SHA-256 hash generation
✅ NFT-based asset representation
✅ Hyperledger Fabric integration
✅ Chaincode asset operations
✅ Asset ownership transfer
✅ Transaction history
✅ Audit trail
🔮 Future Enhancements

Potential areas for further development include:

More granular permission policies
Additional identity verification mechanisms
Advanced asset search and filtering
Extended analytics and reporting
Additional Fabric organizations
Enhanced monitoring tools
Scalable cloud deployment
Improved document verification workflows
Additional digital asset types
🤝 Contribution

Contributions and suggestions are welcome.

If you would like to improve the project:

git clone <repository-url>

Create a feature branch, make your changes, test them, and submit a
pull request.

📄 License

This project can be distributed and maintained according to the license
defined for the repository.