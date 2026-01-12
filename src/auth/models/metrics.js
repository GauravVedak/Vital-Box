const mongoose = require("mongoose");

const MetricsSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	date: { type: Date, required: true },
	weightKg: Number,
	stepsCount: Number,
	caloriesIntake: Number,
	caloriesExpended: Number,
	sleepHours: Number,
	custom: mongoose.Schema.Types.Mixed,
});

const Metrics = mongoose.model("Metrics", MetricsSchema);

module.exports = { Metrics };
