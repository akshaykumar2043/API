const Swap = require('../models/swap');

exports.Swap = async (req, res) => {
    try {
        let data = req.body;

        const swap = await Swap.create({
            tokenFrom: data.tokenFrom,
            tokenTo: data.tokenTo,
            amountFrom: data.amountFrom,
            amountTo: data.amountTo,
            status: data.status,
        });
        return res.status(201).json({ message: "swap successfull", swap });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllSwap = async function (req, res) {
    try {
        //pagination
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        let skip = (page - 1) * limit;

        const allSwap = await Swap.find({}).skip(skip).limit(limit);

        const totalCount = await Swap.countDocuments();

        return res.status(200).json({
            message: "Get successfully.",
            currentPage: page,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            swaps: allSwap
        });
    } catch (error) {
        console.error("Error", error);
        res.status(400).json({ message: "Error all Swap", error });
    }
};



