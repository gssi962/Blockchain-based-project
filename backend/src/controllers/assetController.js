const assetService = require("../services/assetService");
const { sendSuccess, sendError } = require("../utils/response");

const getAssets = async (req, res) => {
    try {
        const assets = await assetService.getAllAssets();

        return sendSuccess(res, assets);
    } catch (error) {
        return sendError(res, error.message);
    }
};

const getAsset = async (req, res) => {
    try {
        const asset = await assetService.getAssetById(req.params.id);

        if (!asset) {
            return sendError(res, "Asset not found", 404);
        }

        return sendSuccess(res, asset);
    } catch (error) {
        return sendError(res, error.message);
    }
};

const createAsset = async (req, res) => {
    try {
        const {
            name,
            description,
            category
        } = req.body;

        if (!name) {
            return sendError(
                res,
                "Asset name is required",
                400
            );
        }

        const asset = await assetService.createAsset({
            name,
            description,
            category,
            createdBy: req.user.id
        });

        return sendSuccess(res, asset, 201);
    } catch (error) {
        return sendError(res, error.message);
    }
};

const transferAsset = async (req, res) => {
    try {
        const {
            toUser
        } = req.body;

        if (!toUser) {
            return sendError(
                res,
                "Recipient user is required",
                400
            );
        }

        const result = await assetService.transferAsset({
            assetId: req.params.id,
            fromUser: req.user.id,
            toUser
        });

        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, error.message);
    }
};

const getAssetStats = async (req, res) => {
    try {
        const assets = await assetService.getAllAssets();

        const stats = {
            totalAssets: assets.length,

            activeAssets: assets.filter(
                asset => asset.status === "ACTIVE"
            ).length,

            nftLinked: assets.filter(
                asset => asset.nftId
            ).length
        };

        return sendSuccess(res, stats);
    } catch (error) {
        return sendError(res, error.message);
    }
};

module.exports = {
    getAssets,
    getAsset,
    createAsset,
    transferAsset,
    getAssetStats
};