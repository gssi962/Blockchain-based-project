"use strict";

const AssetContract = require("./contracts/AssetContract");
const NFTContract = require("./contracts/NFTContract");
const OwnershipContract = require("./contracts/OwnershipContract");
const AuditContract = require("./contracts/AuditContract");

module.exports.contracts = [
    AssetContract,
    NFTContract,
    OwnershipContract,
    AuditContract
];