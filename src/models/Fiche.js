import mongoose from 'mongoose';

const { Schema } = mongoose;

const ficheSchema = new Schema(
  {
    number: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'Instructor' }
  },
  {
    collection: 'fiches',
    timestamps: true,
    strict: false
  }
);

const Fiche = mongoose.models.Fiche || mongoose.model('Fiche', ficheSchema);

export default Fiche;