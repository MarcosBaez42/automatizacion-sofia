import mongoose from 'mongoose';

const { Schema } = mongoose;

const instructorSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    emailpersonal: { type: String }
  },
  {
    collection: 'instructors',
    timestamps: true,
    strict: false
  }
);

const Instructor =
  mongoose.models.Instructor || mongoose.model('Instructor', instructorSchema);

export default Instructor;