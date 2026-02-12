
const counterSchema = new mongoose.Schema({
  month: String,
  year: Number,
  sequence: {
    type: Number,
    default: 0
  }
});

export const Counter = mongoose.model("Counter", counterSchema);
